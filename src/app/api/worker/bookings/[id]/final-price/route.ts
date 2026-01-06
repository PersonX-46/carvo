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
    const { laborCost, partsCost, totalCost, actualPartsUsed, finalNotes, workerId } = body;

    // Validation
    if (!totalCost || totalCost <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid total cost is required" },
        { status: 400 }
      );
    }

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: "Worker ID is required" },
        { status: 400 }
      );
    }

    if (!laborCost && laborCost !== 0) {
      return NextResponse.json(
        { success: false, error: "Labor cost is required" },
        { status: 400 }
      );
    }

    if (!partsCost && partsCost !== 0) {
      return NextResponse.json(
        { success: false, error: "Parts cost is required" },
        { status: 400 }
      );
    }

    if (!actualPartsUsed || !Array.isArray(actualPartsUsed)) {
      return NextResponse.json(
        { success: false, error: "Actual parts used must be an array" },
        { status: 400 }
      );
    }

    // Check if booking exists and is assigned to this worker
    const booking = await prisma.booking.findFirst({
      where: { 
        id: bookingId,
        workerId: parseInt(workerId),
        status: "Completed"
      },
      include: {
        service: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Completed booking not found, not assigned to you, or booking is not in 'Completed' status" 
        },
        { status: 404 }
      );
    }

    // Check if final price is already set
    if (booking.finalCost !== null && booking.finalCost > 0) {
      return NextResponse.json(
        { success: false, error: "Final price is already set for this booking" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      estimatedCost: totalCost,
      finalCost: totalCost,
    };

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
            type: true,
            mileage: true
          }
        }
      }
    });

    // Update service record with final details
    const repairNotes = `${booking.service?.repairNotes || ''}\n\nFINAL PRICE SET\n${finalNotes}\n\nFINAL PRICE BREAKDOWN:\n• Labor: RM ${laborCost.toFixed(2)}\n• Parts: RM ${partsCost.toFixed(2)}\n• Total: RM ${totalCost.toFixed(2)}\n• Parts Used: ${actualPartsUsed.join(', ')}`;

    const serviceUpdate = await prisma.service.upsert({
      where: { bookingId: bookingId },
      update: {
        serviceCost: totalCost,
        repairNotes: repairNotes,
        serviceStatus: "Final Price Set",
        spareParts: actualPartsUsed.join(', '),
        finalPriceSet: true,
        completionDate: new Date()
      },
      create: {
        bookingId: bookingId,
        workerId: parseInt(workerId),
        serviceCost: totalCost,
        repairNotes: repairNotes,
        serviceStatus: "Final Price Set",
        spareParts: actualPartsUsed.join(', '),
        finalPriceSet: true,
        completionDate: new Date()
      }
    });

    // Update finance record
    await prisma.finance.create({
      data: {
        adminId: 1, // Default admin ID, you might want to get this from context
        amount: totalCost,
        category: "service_final_price",
        notes: `Final price set for Booking #${bookingId}: ${updatedBooking.vehicle.model} (${updatedBooking.vehicle.registrationNumber}). Total: RM ${totalCost.toFixed(2)}. Breakdown: Labor RM ${laborCost.toFixed(2)}, Parts RM ${partsCost.toFixed(2)}. Parts used: ${actualPartsUsed.join(', ')}`,
      }
    });

    // Update worker stats
    await prisma.worker.update({
      where: { id: parseInt(workerId) },
      data: {
        totalServices: { increment: 1 },
        currentWorkload: Math.max(0, (booking.service?.worker?.currentWorkload || 0) - 1)
      }
    });

    return NextResponse.json({
      success: true,
      message: "Final price submitted successfully",
      booking: updatedBooking,
      service: serviceUpdate,
      finalPrice: { 
        laborCost, 
        partsCost, 
        totalCost,
        actualPartsUsed,
        finalNotes
      }
    });

  } catch (error: any) {
    console.error("Error submitting final price:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          success: false,
          error: "Database constraint error. Please check if all required fields exist in the database schema." 
        },
        { status: 400 }
      );
    }
    
    if (error.message?.includes("Unknown argument `finalCost`")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Database schema missing 'finalCost' field. Please run migrations first.",
          solution: "Run: npx prisma migrate dev --name add_final_cost_field"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit final price" 
      },
      { status: 500 }
    );
  }
}