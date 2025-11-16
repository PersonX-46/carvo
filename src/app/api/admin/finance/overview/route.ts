import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get revenue from completed services
    const completedServices = await prisma.service.findMany({
      where: {
        serviceStatus: 'Completed',
        completionDate: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        booking: {
          include: {
            customer: true
          }
        }
      }
    });

    const totalRevenue = completedServices.reduce((sum, service) => 
      sum + (service.serviceCost || 0), 0
    );

    // Get expenses (you can expand this with an expenses table)
    const totalExpenses = await calculateExpenses(startDate, now);
    const netProfit = totalRevenue - totalExpenses;

    // Revenue by service type
    const revenueByService = await getRevenueByService(startDate, now);
    
    // Monthly revenue trend
    const monthlyRevenue = await getMonthlyRevenue(startDate, now);
    
    // Top revenue sources
    const topRevenueSources = await getTopRevenueSources(startDate, now);

    const overview = {
      totalRevenue,
      totalExpenses,
      netProfit,
      revenueGrowth: await calculateRevenueGrowth(startDate, now),
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      revenueByService,
      monthlyRevenue,
      topRevenueSources,
      period: {
        start: startDate,
        end: now,
        type: period
      }
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching finance overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch finance overview' },
      { status: 500 }
    );
  }
}

async function calculateExpenses(startDate: Date, endDate: Date): Promise<number> {
  // This is a simplified calculation. You should create an expenses table
  // For now, we'll estimate expenses as 65% of revenue
  const services = await prisma.service.findMany({
    where: {
      serviceStatus: 'Completed',
      completionDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const revenue = services.reduce((sum, service) => 
    sum + (service.serviceCost || 0), 0
  );

  return revenue * 0.65; // 65% expense ratio
}

async function getRevenueByService(startDate: Date, endDate: Date) {
  const services = await prisma.service.findMany({
    where: {
      serviceStatus: 'Completed',
      completionDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      booking: true
    }
  });

  const serviceRevenue = services.reduce((acc: any, service) => {
    const serviceType = service.booking?.reportedIssue || 'General Service';
    if (!acc[serviceType]) {
      acc[serviceType] = 0;
    }
    acc[serviceType] += service.serviceCost || 0;
    return acc;
  }, {});

  return Object.entries(serviceRevenue).map(([name, revenue]) => ({
    name,
    revenue: revenue as number,
    percentage: 0 // Will calculate after
  }));
}

async function getMonthlyRevenue(startDate: Date, endDate: Date) {
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const monthlyServices = await prisma.service.findMany({
      where: {
        serviceStatus: 'Completed',
        completionDate: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const revenue = monthlyServices.reduce((sum, service) => 
      sum + (service.serviceCost || 0), 0
    );

    months.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
      year: monthStart.getFullYear()
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

async function getTopRevenueSources(startDate: Date, endDate: Date) {
  const services = await prisma.service.findMany({
    where: {
      serviceStatus: 'Completed',
      completionDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      booking: {
        include: {
          customer: true
        }
      }
    }
  });

  const customerRevenue = services.reduce((acc: any, service) => {
    const customerName = service.booking?.customer?.name || 'Unknown Customer';
    if (!acc[customerName]) {
      acc[customerName] = 0;
    }
    acc[customerName] += service.serviceCost || 0;
    return acc;
  }, {});

  return Object.entries(customerRevenue)
    .map(([name, revenue]) => ({ name, revenue: revenue as number }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

async function calculateRevenueGrowth(startDate: Date, endDate: Date): Promise<number> {
  // Calculate previous period for comparison
  const previousStart = new Date(startDate);
  const previousEnd = new Date(endDate);
  const periodLength = endDate.getTime() - startDate.getTime();
  
  previousStart.setTime(previousStart.getTime() - periodLength);
  previousEnd.setTime(previousEnd.getTime() - periodLength);

  const currentRevenue = await getPeriodRevenue(startDate, endDate);
  const previousRevenue = await getPeriodRevenue(previousStart, previousEnd);

  if (previousRevenue === 0) return 100; // 100% growth if no previous revenue

  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
}

async function getPeriodRevenue(startDate: Date, endDate: Date): Promise<number> {
  const services = await prisma.service.findMany({
    where: {
      serviceStatus: 'Completed',
      completionDate: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  return services.reduce((sum, service) => sum + (service.serviceCost || 0), 0);
}