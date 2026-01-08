import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
    }

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        booking: {
          include: {
            vehicle: {
              select: {
                model: true,
                registrationNumber: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    // Transform data
    const transformedPayments = payments.map((payment: typeof payments[number]) => ({
      id: payment.id,
      bookingId: payment.bookingId,
      customerId: payment.customerId,
      customerName: payment.customer?.name || 'Unknown',
      vehicleModel: payment.booking?.vehicle?.model || 'Unknown',
      registrationNumber: payment.booking?.vehicle?.registrationNumber || 'Unknown',
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate?.toISOString() || new Date().toISOString(),
      completedDate: payment.completedDate?.toISOString() || null,
      paymentDetails: payment.paymentDetails,
    }));

    return NextResponse.json({
      success: true,
      payments: transformedPayments,
      count: transformedPayments.length,
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payments',
        payments: [],
      },
      { status: 500 }
    );
  }
}