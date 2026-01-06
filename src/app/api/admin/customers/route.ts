import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";

    // Build where clause
    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } }
      ];
    }

    // Add date filter
    if (filter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.createdAt = { gte: thirtyDaysAgo };
    } else if (filter === "active") {
      // Active customers have bookings in the last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // This is a complex query, we'll handle it differently
      // First get all customers, then filter in application logic
    }

    // Fetch customers with counts
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        joinDate: true,
        createdAt: true,
        _count: {
          select: {
            vehicles: true,
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Get last service date for each customer
    const customersWithLastService = await Promise.all(
      customers.map(async (customer) => {
        const lastService = await prisma.booking.findFirst({
          where: {
            customerId: customer.id,
            status: "Completed"
          },
          select: {
            bookingDate: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        });

        // Filter active customers (have bookings in last 90 days)
        let isActive = false;
        if (filter === "active") {
          const recentBookings = await prisma.booking.findFirst({
            where: {
              customerId: customer.id,
              createdAt: {
                gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
              }
            }
          });
          isActive = !!recentBookings;
        }

        return {
          ...customer,
          totalVehicles: customer._count.vehicles,
          totalBookings: customer._count.bookings,
          lastServiceDate: lastService?.bookingDate || null
        };
      })
    );

    // Apply active filter after fetching
    let filteredCustomers = customersWithLastService;
    if (filter === "active") {
      filteredCustomers = customersWithLastService.filter(customer => {
        // Active: has bookings and last service within 90 days
        return customer.totalBookings > 0 && customer.lastServiceDate && 
               new Date(customer.lastServiceDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      });
    }

    return NextResponse.json(filteredCustomers);

  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, password } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Determine password (use provided or generate a temporary one)
    let plainPassword = password;
    let generatedPassword: string | null = null;
    if (!plainPassword) {
      generatedPassword = randomBytes(6).toString("base64").replace(/\W/g, "").slice(0, 12);
      plainPassword = generatedPassword;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        joinDate: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = newCustomer;

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      customer: customerWithoutPassword,
      ...(generatedPassword ? { temporaryPassword: generatedPassword } : {})
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { 
        error: "Failed to create customer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}