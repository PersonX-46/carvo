import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: any = { workerId };
    
    if (status) {
      where.serviceStatus = status;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get services with pagination
    const services = await prisma.service.findMany({
      where,
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
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Get total count
    const total = await prisma.service.count({ where });

    // Transform services data
    const transformedServices = services.map(service => ({
      id: service.id,
      workerId: service.workerId,
      bookingId: service.bookingId,
      serviceStatus: service.serviceStatus,
      repairNotes: service.repairNotes,
      serviceCost: service.serviceCost,
      duration: service.duration,
      completionDate: service.completionDate?.toISOString() || null,
      customerName: service.booking?.customer?.name || "Unknown",
      customerPhone: service.booking?.customer?.phone || null,
      vehicleModel: service.booking?.vehicle?.model || "Unknown",
      registrationNumber: service.booking?.vehicle?.registrationNumber || null,
      createdAt: service.createdAt.toISOString(),
    }));

    return NextResponse.json({
      services: transformedServices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Error fetching worker services:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch worker services",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}