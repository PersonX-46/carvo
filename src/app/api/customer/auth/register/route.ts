import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      password,
      vehicleModel,
      registrationNumber,
      vehicleYear,
      vehicleType
    } = await request.json();

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    // Check if vehicle registration number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber }
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this registration number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer and vehicle
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address: address || null,
        password: hashedPassword,
      }
    });

    // Create vehicle for the customer
    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: customer.id,
        model: vehicleModel,
        registrationNumber,
        year: vehicleYear ? parseInt(vehicleYear) : null,
        type: vehicleType || null,
      }
    });

    // Remove password from response
    const { password: _, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      message: 'Customer registered successfully',
      customer: customerWithoutPassword,
      vehicle: vehicle
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}