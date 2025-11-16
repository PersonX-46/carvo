// src/app/api/customer/bookings/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUser } from '../../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, bookingId, data } = await request.json();

    switch (action) {
      case 'cancel':
        return await cancelBooking(bookingId, user.id);
      
      case 'create':
        return await createBooking(data, user.id);
      
      case 'reschedule':
        return await rescheduleBooking(bookingId, data, user.id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Booking action error:', error);
    return NextResponse.json(
      { error: 'Failed to process booking action' },
      { status: 500 }
    );
  }
}

async function cancelBooking(bookingId: number, customerId: number) {
  const booking = await prisma.booking.findFirst({
    where: { 
      id: bookingId,
      customerId,
      status: { in: ['Pending', 'Confirmed'] }
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found or cannot be cancelled' },
      { status: 404 }
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'Cancelled' }
  });

  return NextResponse.json({
    message: 'Booking cancelled successfully',
    booking: updatedBooking
  });
}

async function createBooking(bookingData: any, customerId: number) {
  const { vehicleId, serviceType, bookingDate, reportedIssue } = bookingData;

  // Validate vehicle belongs to customer
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, customerId }
  });

  if (!vehicle) {
    return NextResponse.json(
      { error: 'Invalid vehicle' },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      customerId,
      vehicleId,
      bookingDate: new Date(bookingDate),
      reportedIssue,
      status: 'Pending',
      estimatedCost: await calculateEstimatedCost(serviceType)
    },
    include: {
      vehicle: {
        select: { model: true, registrationNumber: true }
      }
    }
  });

  return NextResponse.json({
    message: 'Booking created successfully',
    booking
  });
}

async function rescheduleBooking(bookingId: number, newDate: string, customerId: number) {
  const booking = await prisma.booking.findFirst({
    where: { 
      id: bookingId,
      customerId,
      status: { in: ['Pending', 'Confirmed'] }
    }
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found or cannot be rescheduled' },
      { status: 404 }
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      bookingDate: new Date(newDate),
      status: 'Pending' // Reset to pending for confirmation
    }
  });

  return NextResponse.json({
    message: 'Booking rescheduled successfully',
    booking: updatedBooking
  });
}

async function calculateEstimatedCost(serviceType: string): Promise<number> {
  const pricing: { [key: string]: number } = {
    'basic_service': 120,
    'premium_service': 250,
    'engine_repair': 500,
    'brake_service': 180,
    'ac_repair': 200,
    'electrical': 150,
    'general': 100
  };

  return pricing[serviceType] || 150;
}