// app/api/admin/workers/[id]/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: any = {
      workerId: workerId
    };

    if (status && status !== 'all') {
      whereClause.serviceStatus = status;
    }

    // Get total count for pagination
    const totalServices = await prisma.service.count({
      where: whereClause
    });

    // Get services with pagination
    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
                email: true
              }
            },
            vehicle: {
              select: {
                model: true,
                registrationNumber: true,
                year: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Format response
    const formattedServices = services.map(service => ({
      id: service.id,
      bookingId: service.bookingId,
      serviceStatus: service.serviceStatus,
      repairNotes: service.repairNotes,
      serviceCost: service.serviceCost,
      spareParts: service.spareParts,
      completionDate: service.completionDate?.toISOString(),
      duration: service.duration,
      createdAt: service.createdAt.toISOString(),
      customer: service.booking.customer,
      vehicle: service.booking.vehicle,
      bookingDate: service.booking.bookingDate.toISOString()
    }));

    return NextResponse.json({
      services: formattedServices,
      pagination: {
        total: totalServices,
        page,
        limit,
        totalPages: Math.ceil(totalServices / limit)
      },
      statistics: {
        total: totalServices,
        completed: await prisma.service.count({
          where: { ...whereClause, serviceStatus: "Completed" }
        }),
        inProgress: await prisma.service.count({
          where: { ...whereClause, serviceStatus: "In Progress" }
        }),
        pending: await prisma.service.count({
          where: { ...whereClause, serviceStatus: "Pending" }
        })
      }
    });

  } catch (error) {
    console.error("Error fetching worker services:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker services" },
      { status: 500 }
    );
  }
}