import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total customers count
    const totalCustomers = await prisma.customer.count();

    // Get total vehicles count
    const totalVehicles = await prisma.vehicle.count();

    // Get total bookings count
    const totalBookings = await prisma.booking.count();

    // Get recent customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get active customers (with 3+ bookings)
    const activeCustomers = await prisma.customer.count({
      where: {
        bookings: {
          some: {} // At least one booking
        }
      }
    });

    const stats = {
      totalCustomers,
      totalVehicles,
      totalBookings,
      recentCustomers,
      activeCustomers
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}