import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';

    // Build where clause based on search and filter
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    // Get customers with their vehicles and bookings count
    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        vehicles: {
          select: { id: true }
        },
        bookings: {
          select: { id: true, createdAt: true }
        },
        serviceReports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the response with calculated fields
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      totalVehicles: customer.vehicles.length,
      totalBookings: customer.bookings.length,
      lastServiceDate: customer.serviceReports[0]?.createdAt || null,
      createdAt: customer.createdAt,
      joinDate: customer.joinDate
    }));

    // Apply additional filters
    let filteredCustomers = formattedCustomers;
    if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filteredCustomers = formattedCustomers.filter(c => 
        new Date(c.createdAt) >= thirtyDaysAgo
      );
    } else if (filter === 'active') {
      filteredCustomers = formattedCustomers.filter(c => c.totalBookings >= 3);
    }

    return NextResponse.json(filteredCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}