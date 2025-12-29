// app/api/admin/workers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        services: {
          include: {
            booking: {
              include: {
                customer: {
                  select: {
                    name: true,
                    phone: true
                  }
                },
                vehicle: {
                  select: {
                    model: true,
                    registrationNumber: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to recent 10 services
        },
        serviceReports: {
          select: {
            id: true,
            type: true,
            title: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    });

    if (!worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalServices = worker.services.length;
    const completedServices = worker.services.filter(s => s.serviceStatus === "Completed").length;
    const inProgressServices = worker.services.filter(s => s.serviceStatus === "In Progress").length;
    const currentWorkload = inProgressServices;
    
    const totalRevenue = worker.services
      .filter(s => s.serviceCost)
      .reduce((sum, service) => sum + (service.serviceCost || 0), 0);

    const formattedServices = worker.services.map(service => ({
      id: service.id,
      workerId: service.workerId,
      bookingId: service.bookingId,
      serviceStatus: service.serviceStatus,
      repairNotes: service.repairNotes,
      serviceCost: service.serviceCost,
      completionDate: service.completionDate?.toISOString(),
      createdAt: service.createdAt.toISOString(),
      customerName: service.booking?.customer?.name || "Unknown",
      customerPhone: service.booking?.customer?.phone || "N/A",
      vehicleModel: service.booking?.vehicle?.model || "Unknown",
      registrationNumber: service.booking?.vehicle?.registrationNumber || "N/A"
    }));

    return NextResponse.json({
      worker: {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        position: worker.position,
        status: worker.status,
        specialization: worker.specialization ? 
          (worker.specialization.includes(',') ? 
            worker.specialization.split(',').map(s => s.trim()) : 
            [worker.specialization.trim()]) : 
          [],
        totalServices,
        completedServices,
        currentWorkload,
        inProgressServices,
        totalRevenue,
        rating: worker.rating || 0.0,
        hireDate: worker.hireDate.toISOString(),
        salary: worker.salary || 0,
        services: formattedServices,
        reports: worker.serviceReports
      }
    });

  } catch (error) {
    console.error("Error fetching worker:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);
    const data = await request.json();

    // Update worker
    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        status: data.status,
        specialization: data.specialization ? 
          (Array.isArray(data.specialization) ? 
            data.specialization.join(', ') : 
            data.specialization) : 
          null,
        salary: data.salary ? parseFloat(data.salary) : null,
        ...(data.password && { password: data.password }) // Only update password if provided
      }
    });

    return NextResponse.json({
      message: "Worker updated successfully",
      worker: {
        id: updatedWorker.id,
        name: updatedWorker.name,
        email: updatedWorker.email,
        position: updatedWorker.position,
        status: updatedWorker.status
      }
    });

  } catch (error) {
    console.error("Error updating worker:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update worker" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);

    // First, check if worker has any active services
    const activeServices = await prisma.service.count({
      where: {
        workerId: workerId,
        serviceStatus: {
          in: ["In Progress", "Confirmed"]
        }
      }
    });

    if (activeServices > 0) {
      return NextResponse.json(
        { error: "Cannot delete worker with active services. Please reassign or complete services first." },
        { status: 400 }
      );
    }

    // Update worker status to inactive instead of deleting
    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        status: "inactive"
      }
    });

    return NextResponse.json({
      message: "Worker deactivated successfully",
      worker: {
        id: updatedWorker.id,
        name: updatedWorker.name,
        status: updatedWorker.status
      }
    });

  } catch (error) {
    console.error("Error deactivating worker:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to deactivate worker" },
      { status: 500 }
    );
  }
}