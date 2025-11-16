import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';


export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      include: {
        customer: {
          select: {
            name: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true
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
      },
      orderBy: { bookingDate: 'asc' }
    });

    return NextResponse.json({ bookings });

  } catch (error) {
    console.error('Get admin bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}