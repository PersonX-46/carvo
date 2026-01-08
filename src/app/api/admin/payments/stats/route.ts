// app/api/admin/payments/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all payments
    const payments = await prisma.payment.findMany({
      include: {
        customer: true,
        booking: true
      }
    });

    // Calculate statistics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const monthlyPayments = payments.filter(p => 
      p.paymentDate && p.paymentDate >= startOfMonth
    );
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    
    const receiptsUploaded = payments.filter(p => p.receiptUrl).length;
    const receiptsVerified = payments.filter(p => p.receiptVerified).length;
    const receiptsPending = receiptsUploaded - receiptsVerified;

    const averagePayment = payments.length > 0 ? totalRevenue / payments.length : 0;

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      completedPayments,
      failedPayments,
      receiptsUploaded,
      receiptsVerified,
      receiptsPending,
      averagePayment,
      totalPayments: payments.length,
    });

  } catch (error: any) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}