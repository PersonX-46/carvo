import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get customer from auth
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customerId: user.id,
        status: { not: "Cancelled" } // Optional: filter out cancelled bookings
      },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                position: true,
                specialization: true,
                rating: true,
                totalServices: true,
                hireDate: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Transform statuses for frontend
    const transformedBookings = bookings.map(booking => ({
      ...booking,
      // Ensure status matches frontend expectations
      status: booking.status.replace(/_/g, " "), // Convert "Price_Pending" to "Price Pending"
      // Ensure price approval fields exist
      priceApproved: booking.priceApproved || false,
      priceRejected: booking.priceRejected || false,
      rejectionReason: booking.rejectionReason || null
    }));

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      count: transformedBookings.length,
      priceApprovalCount: transformedBookings.filter(b => 
        (b.status === "Price Pending" || b.status === "Confirmed") &&
        (b.estimatedCost !== null || b.estimatedMinCost !== null) &&
        b.priceApproved === false &&
        b.priceRejected === false
      ).length
    });

  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch bookings",
        bookings: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, serviceType, bookingDate, reportedIssue, urgency, specialRequests } = body;

    // Get customer from auth
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!vehicleId || !bookingDate) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleId and bookingDate' },
        { status: 400 }
      );
    }

    // Check if vehicle belongs to customer
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: parseInt(vehicleId.toString()),
        customerId: user.id
      }
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Create booking with Pending status and no estimated cost initially
    const booking = await prisma.booking.create({
      data: {
        customerId: user.id,
        vehicleId: parseInt(vehicleId.toString()),
        bookingDate: new Date(bookingDate),
        status: 'Pending',
        reportedIssue: reportedIssue || null, // Use null if not provided
        confirmed: false,
        duration: 2, // Default duration
      },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            color: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      booking,
      message: 'Booking created successfully. Our team will contact you with a price quote.' 
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unknown argument')) {
        console.error('Prisma schema mismatch. Available fields for Booking:');
        console.error('- customerId: Int');
        console.error('- vehicleId: Int');
        console.error('- bookingDate: DateTime');
        console.error('- status: String');
        console.error('- reportedIssue: String?');
        console.error('- confirmed: Boolean');
        console.error('- duration: Float?');
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking'
      },
      { status: 500 }
    );
  }
}
// Add PUT method for updating booking status (cancellation)
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

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Check if booking belongs to this customer
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: parseInt(id),
        customerId: user.id
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({ 
      booking: updatedBooking,
      message: 'Booking updated successfully'
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// Optional: Add DELETE method if needed
export async function DELETE(
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

    const { id } = params;

    // Check if booking belongs to this customer
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: parseInt(id),
        customerId: user.id
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}