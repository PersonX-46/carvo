import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET all vehicles for current customer
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ vehicles });

  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE new vehicle
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Check if registration number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber }
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this registration number already exists' },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: user.id,
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
      message: 'Vehicle added successfully',
      vehicle
    }, { status: 201 });

  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}