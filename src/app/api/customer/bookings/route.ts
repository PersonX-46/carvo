import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where: any = {
      customerId: user.id
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
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
        service: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
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
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match your frontend interface
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      serviceId: booking.serviceId,
      bookingDate: booking.bookingDate.toISOString(),
      status: booking.status,
      reportedIssue: booking.reportedIssue,
      estimatedCost: booking.estimatedCost,
      confirmed: booking.confirmed,
      duration: booking.duration,
      createdAt: booking.createdAt.toISOString(),
      vehicle: {
        model: booking.vehicle.model,
        registrationNumber: booking.vehicle.registrationNumber,
        year: booking.vehicle.year,
        type: booking.vehicle.type,
        color: booking.vehicle.color
      },
      service: booking.service ? {
        serviceStatus: booking.service.serviceStatus,
        repairNotes: booking.service.repairNotes,
        serviceCost: booking.service.serviceCost,
        spareParts: booking.service.spareParts,
        completionDate: booking.service.completionDate?.toISOString() || null,
        duration: booking.service.duration,
        worker: booking.service.worker ? {
          id: booking.service.worker.id,
          name: booking.service.worker.name,
          phone: booking.service.worker.phone,
          email: booking.service.worker.email,
          position: booking.service.worker.position,
          specialization: booking.service.worker.specialization,
          rating: booking.service.worker.rating,
          totalServices: booking.service.worker.totalServices,
          hireDate: booking.service.worker.hireDate.toISOString()
        } : undefined
      } : undefined
    }));

    return NextResponse.json({ 
      bookings: transformedBookings 
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add to your existing POST method
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

    // Create booking with Pending status and no estimated cost initially
    const booking = await prisma.booking.create({
      data: {
        customerId: user.id, // Use authenticated user's ID
        vehicleId: parseInt(vehicleId),
        bookingDate: new Date(bookingDate),
        status: 'Pending',
        reportedIssue,
        // estimatedCost will be set later by worker
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
      booking,
      message: 'Booking created successfully. Our team will contact you with a price quote.' 
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
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