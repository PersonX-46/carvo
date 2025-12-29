// app/api/worker/bookings/[id]/reject-assignment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // FIXED: Await params first
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    const body = await request.json();
    const { reason, workerId } = body;

    if (!reason || !workerId) {
      return NextResponse.json(
        { error: 'Reason and worker ID are required' },
        { status: 400 }
      );
    }

    // Check if booking exists and is assigned to this worker
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        workerId: parseInt(workerId),
        status: "Confirmed" // Only can reject confirmed (assigned) bookings
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or you cannot reject this assignment' },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Remove worker assignment
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          workerId: null,
          status: "Pending", // Reset to pending for admin to reassign
          estimatedCost: null, // Clear any price estimates
          priceApproved: null,
          priceRejected: null,
          rejectionReason: null
        }
      });

      // Update service record
      await tx.service.update({
        where: { bookingId: bookingId },
        data: {
          workerId: null,
          serviceStatus: "Assignment Rejected",
          repairNotes: reason ? `Assignment rejected: ${reason}` : "Assignment rejected",
          serviceCost: null
        }
      });

      // Decrement worker's workload
      await tx.worker.update({
        where: { id: parseInt(workerId) },
        data: {
          currentWorkload: { decrement: 1 }
        }
      });

      return updatedBooking;
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment rejected successfully',
      booking: result
    });

  } catch (error) {
    console.error('Error rejecting assignment:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject assignment' 
      },
      { status: 500 }
    );
  }
}