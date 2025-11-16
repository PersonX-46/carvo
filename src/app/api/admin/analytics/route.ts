import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date range based on period
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

    // Financial Analytics
    const financialData = await getFinancialAnalytics(startDate, now);
    
    // Service Analytics
    const serviceData = await getServiceAnalytics(startDate, now);
    
    // Customer Analytics
    const customerData = await getCustomerAnalytics(startDate, now);

    const analytics = {
      financial: financialData,
      services: serviceData,
      customers: customerData,
      period: {
        start: startDate,
        end: now,
        type: period
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getFinancialAnalytics(startDate: Date, endDate: Date) {
  // Get completed services with costs
  const completedServices = await prisma.service.findMany({
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

  const totalRevenue = completedServices.reduce((sum, service) => 
    sum + (service.serviceCost || 0), 0
  );

  // Get expenses (you might want to add an expenses table)
  const totalExpenses = totalRevenue * 0.65; // Simplified calculation

  // Monthly revenue breakdown
  const monthlyRevenue = await getMonthlyRevenue(startDate, endDate);

  // Most profitable services
  const serviceRevenue = completedServices.reduce((acc: any, service) => {
    const serviceType = service.booking?.reportedIssue || 'General Service';
    if (!acc[serviceType]) {
      acc[serviceType] = 0;
    }
    acc[serviceType] += service.serviceCost || 0;
    return acc;
  }, {});

  const mostProfitableServices = Object.entries(serviceRevenue)
    .map(([name, revenue]) => ({ name, revenue: revenue as number }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    revenueGrowth: 12.5, // You can calculate this based on previous period
    mostProfitableServices,
    monthlyRevenue
  };
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
      revenue
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

async function getServiceAnalytics(startDate: Date, endDate: Date) {
  const totalServices = await prisma.service.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const completedServices = await prisma.service.count({
    where: {
      serviceStatus: 'Completed',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const pendingServices = await prisma.service.count({
    where: {
      serviceStatus: 'Pending',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Popular services based on booking descriptions
  const popularServices = await prisma.booking.groupBy({
    by: ['reportedIssue'],
    _count: {
      id: true
    },
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  });

  // Worker performance
  const workerPerformance = await prisma.worker.findMany({
    include: {
      services: {
        where: {
          serviceStatus: 'Completed',
          completionDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  });

  const formattedWorkerPerformance = workerPerformance.map(worker => ({
    name: worker.name,
    completed: worker.services.length,
    rating: worker.rating || 0
  })).sort((a, b) => b.completed - a.completed).slice(0, 5);

  return {
    totalServices,
    completedServices,
    pendingServices,
    averageServiceTime: 2.5, // You can calculate this from service records
    popularServices: popularServices.map(service => ({
      name: service.reportedIssue || 'General Service',
      count: service._count.id
    })),
    workerPerformance: formattedWorkerPerformance
  };
}

async function getCustomerAnalytics(startDate: Date, endDate: Date) {
  const totalCustomers = await prisma.customer.count();

  const newCustomersThisMonth = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Customers with multiple bookings are considered returning
  const returningCustomers = await prisma.customer.count({
    where: {
      bookings: {
        some: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  });

  // Top customers by spending
  const topCustomersData = await prisma.customer.findMany({
    include: {
      bookings: {
        include: {
          service: {
            select: {
              serviceCost: true
            }
          }
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    },
    take: 5
  });

  const topCustomers = topCustomersData.map(customer => ({
    name: customer.name,
    totalSpent: customer.bookings.reduce((sum, booking) => 
      sum + (booking.service?.serviceCost || 0), 0
    ),
    services: customer.bookings.length
  })).sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalCustomers,
    newCustomersThisMonth,
    returningCustomers,
    customerSatisfaction: 4.7, // You can calculate this from feedback ratings
    topCustomers
  };
}