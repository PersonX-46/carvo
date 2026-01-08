import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all payments
    const payments = await prisma.payment.findMany({
      select: {
        amount: true,
        status: true,
        paymentDate: true,
      },
    });

    // Calculate stats
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum: any, p: { amount: any; }) => sum + p.amount, 0);

    const pendingPayments = payments.filter((p: { status: string; }) => p.status === 'pending').length;
    const completedPayments = payments.filter((p: { status: string; }) => p.status === 'completed').length;
    const failedPayments = payments.filter((p: { status: string; }) => p.status === 'failed').length;

    // Monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = payments
      .filter(p => 
        p.status === 'completed' && 
        p.paymentDate && 
        p.paymentDate >= startOfMonth
      )
      .reduce((sum: any, p: { amount: any; }) => sum + p.amount, 0);

    const averagePayment = completedPayments > 0 
      ? totalRevenue / completedPayments 
      : 0;

    return NextResponse.json({
      success: true,
      totalRevenue,
      pendingPayments,
      completedPayments,
      failedPayments,
      monthlyRevenue,
      averagePayment,
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment stats',
        totalRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0,
        failedPayments: 0,
        monthlyRevenue: 0,
        averagePayment: 0,
      },
      { status: 500 }
    );
  }
}