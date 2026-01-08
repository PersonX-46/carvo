// app/api/admin/payments/[id]/verify-receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id);
    const body = await request.json();
    const { verified, rejectionReason } = body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true
      }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (!payment.receiptUrl) {
      return NextResponse.json(
        { success: false, error: 'No receipt uploaded for this payment' },
        { status: 400 }
      );
    }

    // Update payment with verification status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        receiptVerified: verified,
        verifiedBy: verified ? 'Admin' : null,
        verifiedAt: verified ? new Date() : null,
        rejectionReason: !verified && rejectionReason ? rejectionReason : null,
        status: verified ? 'completed' : payment.status,
        completedDate: verified ? new Date() : payment.completedDate,
        updatedAt: new Date(),
      }
    });

    // Update booking payment status if receipt is verified
    if (verified && payment.booking) {
      const totalPaid = payment.booking.amountPaid || 0;
      const finalCost = payment.booking.finalCost || 0;
      const balanceDue = Math.max(0, finalCost - totalPaid);
      
      let paymentStatus = 'paid';
      if (balanceDue > 0) {
        paymentStatus = 'partially_paid';
      }

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: paymentStatus,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: verified ? 'Receipt verified successfully' : 'Receipt rejected',
      payment: updatedPayment,
    });

  } catch (error: any) {
    console.error('Error verifying receipt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify receipt' },
      { status: 500 }
    );
  }
}