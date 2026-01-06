import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET worker details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    // Get worker with services and total revenue
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        services: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            booking: {
              include: {
                customer: {
                  select: {
                    name: true,
                    phone: true,
                  }
                },
                vehicle: {
                  select: {
                    model: true,
                    registrationNumber: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            services: true,
          }
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Calculate total revenue from completed services
    const completedServices = await prisma.service.findMany({
      where: {
        workerId: workerId,
        serviceStatus: "Completed",
        serviceCost: { not: null }
      },
      select: { serviceCost: true }
    });

    const totalRevenue = completedServices.reduce((sum, service) => 
      sum + (service.serviceCost || 0), 0
    );

    // Transform services data
    const services = worker.services.map(service => ({
      id: service.id,
      workerId: service.workerId,
      bookingId: service.bookingId,
      serviceStatus: service.serviceStatus,
      repairNotes: service.repairNotes,
      serviceCost: service.serviceCost,
      completionDate: service.completionDate?.toISOString() || null,
      customerName: service.booking?.customer?.name || "Unknown",
      customerPhone: service.booking?.customer?.phone || null,
      vehicleModel: service.booking?.vehicle?.model || "Unknown",
      registrationNumber: service.booking?.vehicle?.registrationNumber || null,
      createdAt: service.createdAt.toISOString(),
    }));

    // Remove password and transform data
    const { password, services: _, ...workerData } = worker;

    return NextResponse.json({
      worker: {
        ...workerData,
        specialization: JSON.parse(worker.specialization || "[]"),
        totalServices: worker._count.services,
        totalRevenue,
        inProgressServices: worker.currentWorkload,
      },
      services,
    });

  } catch (error) {
    console.error("Error fetching worker details:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch worker details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PUT update worker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      position, 
      specialization, 
      status, 
      salary 
    } = body;

    // Check if worker exists
    const existingWorker = await prisma.worker.findUnique({
      where: { id: workerId }
    });

    if (!existingWorker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Check if email is taken by another worker
    if (email && email !== existingWorker.email) {
      const emailTaken = await prisma.worker.findFirst({
        where: {
          email: email,
          id: { not: workerId }
        }
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email is already registered by another worker" },
          { status: 400 }
        );
      }
    }

    // Update worker data
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (position) updateData.position = position;
    if (specialization !== undefined) {
      updateData.specialization = JSON.stringify(specialization || []);
    }
    if (status) updateData.status = status;
    if (salary) updateData.salary = parseFloat(salary);

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: updateData,
    });

    // Remove password from response
    const { password, ...workerWithoutPassword } = updatedWorker;

    return NextResponse.json({
      success: true,
      message: "Worker updated successfully",
      worker: {
        ...workerWithoutPassword,
        specialization: JSON.parse(updatedWorker.specialization || "[]"),
      },
    });

  } catch (error) {
    console.error("Error updating worker:", error);
    return NextResponse.json(
      { 
        error: "Failed to update worker",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE deactivate worker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        services: {
          where: {
            serviceStatus: { in: ["In Progress", "Price Range Submitted", "Confirmed"] }
          }
        }
      }
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Check if worker has active services
    if (worker.services.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot deactivate worker with active services. Please reassign or complete their services first.",
          activeServices: worker.services.length
        },
        { status: 400 }
      );
    }

    // Update worker status to inactive (soft delete)
    await prisma.worker.update({
      where: { id: workerId },
      data: { status: "inactive" }
    });

    return NextResponse.json({
      success: true,
      message: "Worker deactivated successfully"
    });

  } catch (error) {
    console.error("Error deactivating worker:", error);
    return NextResponse.json(
      { 
        error: "Failed to deactivate worker",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}