import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let whereClause: any = {};

    switch (filter) {
      case 'unassigned':
        whereClause.workerId = null;
        whereClause.status = { not: 'Cancelled' };
        break;
      case 'assigned':
        whereClause.workerId = { not: null };
        whereClause.status = { not: 'Cancelled' };
        break;
      case 'new':
      case 'pending':
        whereClause.status = 'Pending';
        break;
      case 'in-progress':
        whereClause.status = 'In Progress';
        break;
      case 'completed':
        whereClause.status = 'Completed';
        break;
      case 'cancelled':
        whereClause.status = 'Cancelled';
        break;
      case 'price-pending':
        whereClause.OR = [
          { status: 'Price Pending' },
          { priceApproved: false, priceRejected: false }
        ];
        break;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            type: true,
          },
        },
        service: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        },
      },
      orderBy: {
        bookingDate: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}