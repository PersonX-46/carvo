import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = parseInt(params.id);
    const body = await request.json();
    const { status, adminNotes, assignedWorkerId } = body;

    // Prepare update data
    const updateData: any = {};
    
    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedWorkerId !== undefined) updateData.assignedWorkerId = assignedWorkerId;
    
    // If status changes to In Progress, set workerStartedAt
    if (status === 'In Progress') {
      updateData.workerStartedAt = new Date();
    }
    
    // If status changes to Completed, set workerCompletedAt
    if (status === 'Completed') {
      updateData.workerCompletedAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
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
        },
        service: {
          include: {
            worker: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        assignedWorker: {
          select: {
            name: true,
            position: true
          }
        }
      }
    });

    // If worker is assigned, also update service record
    if (assignedWorkerId && updatedBooking.service) {
      await prisma.service.update({
        where: { bookingId: bookingId },
        data: {
          workerId: assignedWorkerId,
          serviceStatus: status || updatedBooking.service.serviceStatus
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}