import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total customers
    const totalCustomers = await prisma.customer.count();

    // Get total workers
    const totalWorkers = await prisma.worker.count({
      where: { status: 'active' }
    });

    // Get pending bookings
    const pendingBookings = await prisma.booking.count({
      where: { status: 'Pending' }
    });

    // Get completed services this month
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const completedServices = await prisma.service.count({
      where: {
        serviceStatus: 'Completed',
        completionDate: {
          gte: firstDayOfMonth
        }
      }
    });

    // Get monthly revenue
    const monthlyRevenueResult = await prisma.service.aggregate({
      where: {
        serviceStatus: 'Completed',
        completionDate: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        serviceCost: true
      }
    });

    const monthlyRevenue = monthlyRevenueResult._sum.serviceCost || 0;

    // Get low stock items (quantity <= minStockLevel)
    const lowStockItems = await prisma.stock.count({
      where: {
        quantity: {
          lte: prisma.stock.fields.minStockLevel
        }
      }
    });

    const stats = {
      totalCustomers,
      totalWorkers,
      pendingBookings,
      completedServices,
      monthlyRevenue,
      lowStockItems
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}