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
    const { minCost, maxCost, estimatedDuration, repairNotes, workerId } = body;

    if (!minCost || !maxCost || minCost <= 0 || maxCost <= 0 || minCost >= maxCost) {
      return NextResponse.json(
        { success: false, error: "Valid min and max costs are required (min < max)" },
        { status: 400 }
      );
    }

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Worker ID is required" },
        { status: 400 }
      );
    }

    const parsedWorkerId = parseInt(workerId);

    // Check if booking exists and is assigned to this worker
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        workerId: parsedWorkerId,
        status: { in: ["Confirmed", "Pending"] }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Calculate average
    const averageCost = (minCost + maxCost) / 2;

    // CRITICAL FIX: Set status to "Price Pending" (with space) for customer
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        estimatedCost: averageCost,
        estimatedMinCost: minCost,
        estimatedMaxCost: maxCost,
        duration: estimatedDuration,
        priceApproved: false,        // Reset to false
        priceRejected: false,        // Reset to false
        rejectionReason: null,
        status: "Price Pending",     // CHANGED: Set to "Price Pending" for customer approval
        confirmed: true,
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

    // Update service record
    const serviceNotes = `PRICE ESTIMATE SUBMITTED\n` +
                        `Estimated Range: RM ${minCost.toFixed(2)} - RM ${maxCost.toFixed(2)}\n` +
                        `Average Estimate: RM ${averageCost.toFixed(2)}\n` +
                        `Duration: ${estimatedDuration} hours\n\n` +
                        `TECHNICIAN ASSESSMENT:\n${repairNotes}`;

    await prisma.service.upsert({
      where: { bookingId: bookingId },
      update: {
        serviceCost: averageCost,
        repairNotes: serviceNotes,
        duration: estimatedDuration,
        serviceStatus: "Price Pending",  // Match booking status
        workerId: parsedWorkerId,
      },
      create: {
        bookingId: bookingId,
        workerId: parsedWorkerId,
        serviceCost: averageCost,
        repairNotes: serviceNotes,
        duration: estimatedDuration,
        serviceStatus: "Price Pending",  // Match booking status
      }
    });

    // Optional: Send notification to customer (email/WhatsApp)
    try {
      const customerPhone = updatedBooking.customer.phone.replace(/\D/g, '');
      const message = `Hello ${updatedBooking.customer.name}! 🚗

📋 Your vehicle ${updatedBooking.vehicle.model} (${updatedBooking.vehicle.registrationNumber}) 
has received a price estimate from our technician.

💰 Price Range: RM ${minCost.toFixed(2)} - RM ${maxCost.toFixed(2)}
⏱️ Estimated Duration: ${estimatedDuration} hours

Please log in to your account to review and approve the estimate.
Once approved, our technician can begin work immediately.

Thank you for choosing Cheng Service! 😊`;

      console.log(`Would send notification to ${customerPhone}: ${message}`);
      
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: "Price estimate submitted. Waiting for customer approval.",
      booking: updatedBooking,
      priceRange: { 
        minCost, 
        maxCost, 
        averageCost,
        estimatedDuration 
      }
    });

  } catch (error) {
    console.error("Error submitting price range:", error);
    
    // Fallback for schema errors
    if (error instanceof Error && 
        (error.message.includes("estimatedMinCost") || 
         error.message.includes("estimatedMaxCost"))) {
      
      const bookingId = parseInt((await params).id);
      const body = await request.json();
      const { minCost, maxCost, estimatedDuration, repairNotes, workerId } = body;
      const averageCost = (minCost + maxCost) / 2;
      
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          estimatedCost: averageCost,
          duration: estimatedDuration,
          priceApproved: false,
          priceRejected: false,
          rejectionReason: null,
          status: "Price Pending", // CHANGED HERE TOO
          confirmed: true,
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

      // Store range in service notes instead
      await prisma.service.upsert({
        where: { bookingId: bookingId },
        update: {
          serviceCost: averageCost,
          repairNotes: `Price Range Estimate: RM ${minCost.toFixed(2)} - RM ${maxCost.toFixed(2)}\nAverage: RM ${averageCost.toFixed(2)}\n${repairNotes}`,
          duration: estimatedDuration,
          serviceStatus: "Price Pending", // CHANGED HERE TOO
        },
        create: {
          bookingId: bookingId,
          workerId: parseInt(workerId),
          serviceCost: averageCost,
          repairNotes: `Price Range Estimate: RM ${minCost.toFixed(2)} - RM ${maxCost.toFixed(2)}\nAverage: RM ${averageCost.toFixed(2)}\n${repairNotes}`,
          duration: estimatedDuration,
          serviceStatus: "Price Pending", // CHANGED HERE TOO
        }
      });

      return NextResponse.json({
        success: true,
        message: "Price range estimate submitted (range stored in notes)",
        booking: updatedBooking,
        priceRange: { minCost, maxCost, averageCost },
        note: "Price range stored in service notes due to schema limitations"
      });
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit price range" 
      },
      { status: 500 }
    );
  }
}