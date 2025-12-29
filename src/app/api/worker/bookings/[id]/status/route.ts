// app/api/worker/bookings/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, workerId } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Allowed: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Get worker ID from request body
    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Worker ID is required" },
        { status: 400 }
      );
    }

    const workerIdNum = parseInt(workerId);
    
    console.log(`📋 API Call: Update booking ${bookingId} to ${status} for worker ${workerIdNum}`);

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
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
        },
        service: true
      }
    });

    if (!booking) {
      console.log(`❌ Booking ${bookingId} not found`);
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    console.log(`📊 Booking Details:
      ID: ${booking.id}
      Current Status: ${booking.status}
      Worker ID: ${booking.workerId}
      Requested Worker ID: ${workerIdNum}
      Price Approved: ${booking.priceApproved}
      Price Rejected: ${booking.priceRejected}
      Estimated Cost: ${booking.estimatedCost}`);

    // Check if worker has permission
    if (booking.workerId !== workerIdNum) {
      console.log(`❌ Permission denied: Booking assigned to worker ${booking.workerId}, but request from worker ${workerIdNum}`);
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this booking" },
        { status: 403 }
      );
    }

    // Status-specific validations
    if (status === "In Progress") {
      // Check if price is approved
      if (booking.priceApproved !== true) {
        console.log(`❌ Cannot start work - price not approved. priceApproved: ${booking.priceApproved}`);
        return NextResponse.json(
          { 
            success: false, 
            error: "Price must be approved by customer before starting work" 
          },
          { status: 400 }
        );
      }
      
      // Check if already in progress
      if (booking.status === "In Progress") {
        return NextResponse.json(
          { success: false, error: "Work is already in progress" },
          { status: 400 }
        );
      }

      // Check if already completed
      if (booking.status === "Completed") {
        return NextResponse.json(
          { success: false, error: "Cannot start work on completed booking" },
          { status: 400 }
        );
      }

    } else if (status === "Completed") {
      // Check if booking is already completed
      if (booking.status === "Completed") {
        return NextResponse.json(
          { success: false, error: "Booking is already completed" },
          { status: 400 }
        );
      }

      // Check if booking is in progress
      if (booking.status !== "In Progress") {
        return NextResponse.json(
          { 
            success: false, 
            error: `Cannot mark as completed. Current status is "${booking.status}". Booking must be "In Progress" first.` 
          },
          { status: 400 }
        );
      }
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      console.log(`🔄 Starting transaction to update booking ${bookingId} to ${status}`);

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { 
          status: status,
          confirmed: true
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

      console.log(`✅ Booking updated: ${updatedBooking.id} -> ${updatedBooking.status}`);

      // Update or create service record
      const serviceData = {
        serviceStatus: status,
        ...(status === "Completed" ? { 
          completionDate: new Date()
        } : {})
      };

      const service = await tx.service.upsert({
        where: { bookingId: bookingId },
        update: serviceData,
        create: {
          bookingId: bookingId,
          workerId: workerIdNum,
          serviceStatus: status,
          ...serviceData
        }
      });

      console.log(`✅ Service updated: ${service.id} -> ${service.serviceStatus}`);

      // Update worker's statistics
      if (status === "Completed") {
        await tx.worker.update({
          where: { id: workerIdNum },
          data: {
            totalServices: { increment: 1 },
            currentWorkload: { decrement: 1 }
          }
        });
        console.log(`✅ Worker ${workerIdNum} statistics updated`);
      }

      return { booking: updatedBooking, service };
    });

    console.log(`🎉 Successfully completed transaction for booking ${bookingId}`);

    return NextResponse.json({
      success: true,
      message: `Booking ${status === "In Progress" ? "work started" : "marked as completed"} successfully`,
      booking: result.booking,
      service: result.service,
      newStatus: status
    });

  } catch (error) {
    console.error("❌ Error updating status:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to update status";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 }
    );
  }
}