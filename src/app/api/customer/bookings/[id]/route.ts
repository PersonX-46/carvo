import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookingId = parseInt(params.id);
    const { status } = await request.json();

    // Verify the booking belongs to the customer
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: user.id
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}