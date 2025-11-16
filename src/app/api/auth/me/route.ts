import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    let userData = null;
    let detailedData = null;

    if (user.type === 'customer') {
      userData = await prisma.customer.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, phone: true, address: true }
      });
      
      // Only include vehicles for customer dashboard
      detailedData = await prisma.customer.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          joinDate: true,
          createdAt: true,
          vehicles: {
            select: {
              id: true,
              model: true,
              registrationNumber: true,
              year: true,
              type: true,
              lastService: true,
              nextService: true,
              createdAt: true
            }
          }
        }
      });
    } else if (user.type === 'worker') {
      userData = await prisma.worker.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, position: true }
      });
    } else if (user.type === 'admin') {
      userData = await prisma.admin.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true }
      });
    }

    if (!userData) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      type: user.type,
      user: userData,
      // Only include detailed data for customers (for dashboard)
      detailed: user.type === 'customer' ? detailedData : null
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ authenticated: false });
  }
}