import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../lib/auth';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      name,
      phone,
      address,
      emergencyContact,
      preferredCommunication,
      marketingEmails,
      serviceReminders,
      language
    } = await request.json();

    const updatedCustomer = await prisma.customer.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        address,
        emergencyContact,
        preferredCommunication,
        marketingEmails,
        serviceReminders,
        language
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        joinDate: true,
        createdAt: true,
        emergencyContact: true,
        preferredCommunication: true,
        marketingEmails: true,
        serviceReminders: true,
        language: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      customer: updatedCustomer
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}