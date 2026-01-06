import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    const body = await request.json();
    const { approved, reason } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Approval status is required" },
        { status: 400 }
      );
    }

    if (!approved && !reason) {
      return NextResponse.json(
        { success: false, error: "Reason is required when rejecting price" },
        { status: 400 }
      );
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: true,
        worker: true,
        service: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify booking is in correct state for price approval
    const canApprovePrice = 
      booking.status === "Price Pending" &&
      (booking.estimatedCost !== null || booking.estimatedMinCost !== null) &&
      booking.priceApproved === false &&
      booking.priceRejected === false;

    if (!canApprovePrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: "This booking is not ready for price approval or already approved/rejected" 
        },
        { status: 400 }
      );
    }

    let updateData: any;
    let newBookingStatus: string;
    let newServiceStatus: string;
    
    if (approved) {
      // Customer approved the price
      updateData = {
        priceApproved: true,
        priceRejected: false,
        rejectionReason: null,
        status: "Confirmed",  // Move to Confirmed for worker to start work
        confirmed: true
      };
      newBookingStatus = "Confirmed";
      newServiceStatus = "Price Approved";
    } else {
      // Customer rejected the price
      if (!reason || reason.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Reason is required when rejecting price" },
          { status: 400 }
        );
      }
      
      updateData = {
        priceApproved: false,
        priceRejected: true,
        rejectionReason: reason,
        status: "Price Pending",  // Keep as Price Pending for worker to revise
        confirmed: true
      };
      newBookingStatus = "Price Pending";
      newServiceStatus = "Price Rejected";
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
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
            type: true
          }
        }
      }
    });

    // Update service record
    const existingNotes = booking.service?.repairNotes || "";
    const newNotes = existingNotes + 
      `\n\n--- PRICE ${approved ? 'APPROVED' : 'REJECTED'} BY CUSTOMER ---\n` +
      `${approved ? '✅ Customer approved the price estimate.' : `❌ Customer rejected price: ${reason}`}\n` +
      `Date: ${new Date().toLocaleString()}`;

    await prisma.service.upsert({
      where: { bookingId: bookingId },
      update: {
        serviceStatus: newServiceStatus,
        repairNotes: newNotes,
      },
      create: {
        bookingId: bookingId,
        workerId: booking.workerId || undefined,
        serviceStatus: newServiceStatus,
        repairNotes: newNotes,
      }
    });

    // If approved, send notification to worker
    if (approved && booking.) {
      try {
        const workerMessage = `Hello ${booking.worker.name},\n\n` +
          `✅ Customer has APPROVED your price estimate for ${booking.vehicle.model}.\n` +
          `You can now start work on this booking.\n` +
          `Estimate: RM ${booking.estimatedMinCost?.toFixed(2) || booking.estimatedCost?.toFixed(2) || '0.00'} - RM ${booking.estimatedMaxCost?.toFixed(2) || booking.estimatedCost?.toFixed(2) || '0.00'}\n\n` +
          `Thank you,\nCheng Service Team`;
        
        console.log(`Would notify worker ${booking.worker.name}: ${workerMessage}`);
        
      } catch (notificationError) {
        console.error("Failed to send worker notification:", notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Price ${approved ? 'approved' : 'rejected'} successfully`,
      booking: updatedBooking,
      action: approved ? 'approved' : 'rejected'
    });

  } catch (error) {
    console.error("Error processing price approval:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to process price approval" 
      },
      { status: 500 }
    );
  }
}