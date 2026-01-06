import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse the date
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Set time to beginning of day for accurate comparison
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for the selected date
    const existingBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['Cancelled', 'Rejected'],
        },
      },
      select: {
        id: true,
        bookingDate: true,
        duration: true,
        status: true,
      },
    });

    // Define working hours (9 AM to 6 PM)
    const workingHoursStart = 9;
    const workingHoursEnd = 18;
    const slotDuration = 2; // Each booking takes 2 hours

    // Generate all possible time slots
    const allTimeSlots: Array<{
      time: string;
      hour: number;
      datetime: Date;
    }> = [];

    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      // Generate slots every hour
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hour, 0, 0, 0);
      
      allTimeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour,
        datetime: slotDateTime,
      });
    }

    // Check availability for each slot
    const availableSlots = allTimeSlots.map(slot => {
      const slotStartTime = slot.datetime.getTime();
      const slotEndTime = slotStartTime + (slotDuration * 60 * 60 * 1000);

      // Check if this slot overlaps with any existing booking
      const isBooked = existingBookings.some(booking => {
        const bookingStartTime = booking.bookingDate.getTime();
        const bookingEndTime = bookingStartTime + ((booking.duration || 2) * 60 * 60 * 1000);
        
        // Check for overlap
        return (
          (slotStartTime >= bookingStartTime && slotStartTime < bookingEndTime) ||
          (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime) ||
          (slotStartTime <= bookingStartTime && slotEndTime >= bookingEndTime)
        );
      });

      // Check if slot is in the past
      const isPast = slot.datetime < new Date();

      return {
        date: selectedDate.toISOString().split('T')[0],
        time: slot.time,
        available: !isBooked && !isPast,
        hour: slot.hour,
        minute: 0,
        isPast: isPast,
        isBooked: isBooked,
      };
    });

    // Filter out slots that are booked or in the past
    const filteredSlots = availableSlots.filter(slot => slot.available);

    return NextResponse.json({
      date,
      availableSlots: filteredSlots,
      allSlots: availableSlots, // For debugging - shows all slots with status
      workingHours: {
        start: workingHoursStart,
        end: workingHoursEnd,
        duration: slotDuration,
      },
      statistics: {
        totalSlots: allTimeSlots.length,
        available: filteredSlots.length,
        booked: existingBookings.length,
        past: availableSlots.filter(slot => slot.isPast && !slot.isBooked).length,
      },
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch available slots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}