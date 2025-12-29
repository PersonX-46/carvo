// app/api/worker/bookings/[id]/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIXED: Await params first
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    // Parse request body
    const body = await request.json();
    const workerId = body.workerId;

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    // Check if booking is already assigned (admin might have assigned it)
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // If booking already has a worker assigned, check if it's this worker
    if (existingBooking.workerId && existingBooking.workerId !== parseInt(workerId)) {
      return NextResponse.json(
        { error: "Booking is already assigned to another worker" },
        { status: 400 }
      );
    }

    // Use transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "Confirmed",
          confirmed: true,
          workerId: parseInt(workerId)
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          vehicle: {
            select: {
              model: true,
              registrationNumber: true,
              year: true,
              type: true,
              mileage: true
            }
          }
        }
      });

      // Create or update service
      const service = await tx.service.upsert({
        where: { bookingId: bookingId },
        update: {
          workerId: parseInt(workerId),
          serviceStatus: "Confirmed"
        },
        create: {
          bookingId: bookingId,
          workerId: parseInt(workerId),
          serviceStatus: "Confirmed"
        }
      });

      // Update worker's workload
      await tx.worker.update({
        where: { id: parseInt(workerId) },
        data: {
          currentWorkload: { increment: 1 }
        }
      });

      return { ...updatedBooking, service };
    });

    return NextResponse.json({
      success: true,
      message: "Booking accepted successfully",
      booking: result
    });

  } catch (error) {
    console.error("Error accepting booking:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to accept booking" 
      },
      { status: 500 }
    );
  }
}