import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

// GET service history for a vehicle
export async function GET(
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
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        customerId: user.id
      }
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        booking: {
          vehicleId: vehicleId
        }
      },
      include: {
        booking: {
          select: {
            vehicle: {
              select: {
                model: true,
                registrationNumber: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ services });

  } catch (error) {
    console.error('Get vehicle services error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}