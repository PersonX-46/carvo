// app/api/worker/bookings/[id]/estimate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PriceEstimateRequest {
  laborCost: number;
  partsCost: number;
  totalCost: number;
  estimatedDuration: number;
  spareParts: string[];
  repairNotes: string;
  workerId: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIXED: Await params first
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    const body: PriceEstimateRequest = await request.json();
    const { laborCost, partsCost, totalCost, estimatedDuration, spareParts, repairNotes, workerId } = body;

    // Validate
    if (!workerId || totalCost <= 0) {
      return NextResponse.json(
        { error: "Invalid data provided. Worker ID and positive total cost are required." },
        { status: 400 }
      );
    }

    // Check if booking exists and is assigned to this worker
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        workerId: workerId, // Ensure booking is assigned to this worker
        status: "Confirmed" // Ensure it's a confirmed booking
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or you don't have permission to submit price estimate" },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Update booking with price estimate
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          estimatedCost: totalCost,
          duration: estimatedDuration,
          priceApproved: false, // Reset to false
          priceRejected: false, // Reset to false
          rejectionReason: null, // Clear any previous rejection
          status: "Confirmed" // Keep as Confirmed, price is pending
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

      // Create or update service record
      const service = await tx.service.upsert({
        where: { bookingId: bookingId },
        update: {
          serviceCost: totalCost,
          repairNotes: repairNotes,
          spareParts: spareParts.join(", "),
          duration: estimatedDuration,
          serviceStatus: "Price Estimate Submitted"
        },
        create: {
          bookingId: bookingId,
          workerId: workerId,
          serviceCost: totalCost,
          repairNotes: repairNotes,
          spareParts: spareParts.join(", "),
          duration: estimatedDuration,
          serviceStatus: "Price Estimate Submitted"
        }
      });

      return { booking: updatedBooking, service };
    });

    return NextResponse.json({
      success: true,
      message: "Price estimate submitted successfully",
      booking: result.booking,
      service: result.service
    });

  } catch (error) {
    console.error("Error submitting price estimate:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit price estimate" 
      },
      { status: 500 }
    );
  }
}