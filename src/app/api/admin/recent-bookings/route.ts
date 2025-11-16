import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const recentBookings = await prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true
          }
        },
        service: {
          select: {
            serviceCost: true
          }
        }
      }
    });

    const formattedBookings = recentBookings.map(booking => ({
      id: booking.id,
      customerName: booking.customer.name,
      vehicleModel: booking.vehicle.model,
      registrationNumber: booking.vehicle.registrationNumber,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      status: booking.status,
      estimatedCost: booking.service?.serviceCost || booking.estimatedCost || 0,
      reportedIssue: booking.reportedIssue
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent bookings' },
      { status: 500 }
    );
  }
}