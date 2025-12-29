import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Get existing bookings for the date
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const existingBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startDate,
          lt: endDate,
        },
        status: {
          in: ['Confirmed', 'In Progress']
        }
      },
      select: {
        bookingDate: true
      }
    });

    // Generate time slots (9 AM to 5 PM, 30-minute intervals)
    const timeSlots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(`${date}T${timeString}`);
        
        // Check if slot is booked
        const isBooked = existingBookings.some(booking => {
          const bookingTime = new Date(booking.bookingDate);
          return bookingTime.getHours() === hour && bookingTime.getMinutes() === minute;
        });

        timeSlots.push({
          date,
          time: timeString,
          available: !isBooked,
          hour,
          minute
        });
      }
    }

    return NextResponse.json({ availableSlots: timeSlots });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}