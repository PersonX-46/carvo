import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '../../../../../../lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id);
    
    if (isNaN(paymentId)) {
      return NextResponse.json(
        { error: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rejectionReason } = body;

    if (!rejectionReason || typeof rejectionReason !== 'string') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Get admin info (from auth session)
    const verifiedBy = "Admin"; // This should come from your auth

    // Update payment with rejection
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        receiptVerified: false,
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason,
        status: 'failed',
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        booking: {
          include: {
            vehicle: true
          }
        }
      }
    });

    // Update booking status
    if (updatedPayment.bookingId) {
      await prisma.booking.update({
        where: { id: updatedPayment.bookingId },
        data: {
          paymentStatus: 'pending',
          balanceDue: updatedPayment.amount,
        }
      });
    }

    // Send rejection notification to customer
    console.log(`Receipt rejected for payment ${paymentId}: ${rejectionReason}`);

    return NextResponse.json({
      success: true,
      message: 'Receipt rejected successfully',
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error rejecting receipt:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject receipt' },
      { status: 500 }
    );
  }
}