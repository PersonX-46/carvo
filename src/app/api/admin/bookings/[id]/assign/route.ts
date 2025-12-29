import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise first
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);
    
    const { workerId } = await request.json();

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Worker ID is required' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
    });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Update booking with worker assignment
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        workerId: workerId,
        status: 'Confirmed', // Change status to Confirmed when assigned
      },
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
    });

    // Update worker's current workload
    await prisma.worker.update({
      where: { id: workerId },
      data: {
        currentWorkload: { increment: 1 },
        totalServices: { increment: 1 },
      },
    });

    // Create or update service record
    const service = await prisma.service.upsert({
      where: { bookingId: bookingId },
      update: {
        workerId: workerId,
        serviceStatus: 'Assigned',
      },
      create: {
        bookingId: bookingId,
        workerId: workerId,
        serviceStatus: 'Assigned',
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      service,
      message: 'Worker assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign worker' },
      { status: 500 }
    );
  }
}