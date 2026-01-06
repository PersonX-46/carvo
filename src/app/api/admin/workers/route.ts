import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET all workers
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/workers called");
    
    // Fetch all workers from database
    const workers = await prisma.worker.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        status: true,
        specialization: true,
        salary: true,
        hireDate: true,
        totalServices: true,
        currentWorkload: true,
        rating: true,
        createdAt: true,
      },
      orderBy: {
        hireDate: "desc",
      },
    });

    console.log(`Found ${workers.length} workers in database`);

    // Transform specialization from JSON string to array
    const transformedWorkers = workers.map(worker => {
      let specializationArray: string[] = [];
      
      try {
        if (worker.specialization) {
          // Try to parse as JSON first
          specializationArray = JSON.parse(worker.specialization);
        }
      } catch (error) {
        // If JSON parsing fails, try comma-separated string
        if (typeof worker.specialization === 'string') {
          specializationArray = worker.specialization.split(',').map(s => s.trim()).filter(s => s);
        }
      }

      return {
        ...worker,
        specialization: specializationArray,
        completedServices: worker.totalServices - worker.currentWorkload,
      };
    });

    // Calculate stats
    const total = transformedWorkers.length;
    const active = transformedWorkers.filter(w => w.status === "active").length;
    const onLeave = transformedWorkers.filter(w => w.status === "on_leave").length;
    const inactive = transformedWorkers.filter(w => w.status === "inactive").length;

    const responseData = {
      workers: transformedWorkers,
      total,
      active,
      onLeave,
      inactive,
    };

    console.log("Sending response:", responseData);
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching workers:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch workers",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST create new worker
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/workers called");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    const { 
      name, 
      email, 
      phone, 
      position, 
      specialization, 
      status, 
      salary, 
      password 
    } = body;

    // Validate required fields
    if (!name || !email || !position || !salary || !password) {
      console.log("Missing required fields");
      return NextResponse.json(
        { 
          error: "Name, email, position, salary and password are required",
          received: { name, email, position, salary, password: password ? "provided" : "missing" }
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingWorker = await prisma.worker.findUnique({
      where: { email }
    });

    if (existingWorker) {
      console.log("Email already exists:", email);
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Format specialization as JSON string
    const specializationString = JSON.stringify(specialization || []);

    // Parse salary as float
    const salaryValue = parseFloat(salary);
    if (isNaN(salaryValue)) {
      return NextResponse.json(
        { error: "Invalid salary format" },
        { status: 400 }
      );
    }

    // Create new worker
    const newWorker = await prisma.worker.create({
      data: {
        name,
        email,
        phone: phone || null,
        position,
        specialization: specializationString,
        status: status || "active",
        salary: salaryValue,
        password: hashedPassword,
        hireDate: new Date(),
      },
    });

    console.log("Worker created successfully:", newWorker.id);

    // Remove password from response
    const { password: _, ...workerWithoutPassword } = newWorker;

    return NextResponse.json({
      success: true,
      message: "Worker created successfully",
      worker: {
        ...workerWithoutPassword,
        specialization: JSON.parse(newWorker.specialization || "[]"),
        totalServices: 0,
        currentWorkload: 0,
        rating: 0.0,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating worker:", error);
    return NextResponse.json(
      { 
        error: "Failed to create worker",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}