import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../lib/auth';

const prisma = new PrismaClient();

// UPDATE vehicle
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

    const vehicleId = parseInt(params.id);
    const {
      model,
      registrationNumber,
      year,
      type,
      color,
      engineCapacity,
      mileage,
      insuranceExpiry,
      roadTaxExpiry
    } = await request.json();

    // Verify the vehicle belongs to the customer
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        customerId: user.id
      }
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if registration number is being changed and if it already exists
    if (registrationNumber !== existingVehicle.registrationNumber) {
      const duplicateVehicle = await prisma.vehicle.findUnique({
        where: { registrationNumber }
      });

      if (duplicateVehicle) {
        return NextResponse.json(
          { error: 'Vehicle with this registration number already exists' },
          { status: 400 }
        );
      }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        model,
        registrationNumber,
        year,
        type,
        color,
        engineCapacity,
        mileage: mileage ? parseInt(mileage) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        roadTaxExpiry: roadTaxExpiry ? new Date(roadTaxExpiry) : null
      }
    });

    return NextResponse.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE vehicle
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

    const vehicleId = parseInt(params.id);

    // Verify the vehicle belongs to the customer
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        customerId: user.id
      }
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        vehicleId: vehicleId,
        status: {
          in: ['Pending', 'Confirmed', 'In Progress']
        }
      }
    });

    if (activeBookings) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with active bookings' },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId }
    });

    return NextResponse.json({
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}