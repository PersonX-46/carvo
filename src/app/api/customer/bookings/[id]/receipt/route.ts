import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '../../../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: Promise<{ id: string }>
) {
  try {
    // Await the params since it's now a Promise in Next.js 15+
    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      );
    }
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        vehicle: true,
        customer: true,
        service: {
          include: {
            worker: true
          }
        },
        payment: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if payment exists and is verified
    if (!booking.payment) {
      return NextResponse.json(
        { 
          error: 'Payment not found',
          canGenerateReceipt: false,
          message: 'No payment record found for this booking'
        },
        { status: 404 }
      );
    }

    // Check if receipt is verified by admin
    if (!booking.payment.receiptVerified) {
      // Check if payment is still pending or rejected
      const paymentStatus = booking.payment.status;
      
      return NextResponse.json(
        { 
          error: 'Receipt not verified',
          canGenerateReceipt: false,
          status: paymentStatus,
          receiptUrl: booking.payment.receiptUrl,
          receiptVerified: booking.payment.receiptVerified,
          verifiedBy: booking.payment.verifiedBy,
          verifiedAt: booking.payment.verifiedAt,
          rejectionReason: booking.payment.rejectionReason,
          message: paymentStatus === 'pending' 
            ? 'Your payment receipt is pending verification by admin. Please wait for verification.'
            : paymentStatus === 'rejected'
            ? `Receipt rejected: ${booking.payment.rejectionReason || 'No reason provided'}`
            : 'Receipt verification required before generating official receipt'
        },
        { status: 403 } // Forbidden
      );
    }

    // Only generate receipt if verified
    const receiptData = {
      receiptNumber: `REC-${String(booking.id).padStart(6, '0')}`,
      transactionId: booking.payment?.transactionId || `TRX-${String(booking.id).padStart(8, '0')}`,
      date: booking.payment?.verifiedAt || booking.payment?.paymentDate || new Date().toISOString(),
      customerName: booking.customer.name,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,
      vehicle: {
        model: booking.vehicle.model,
        registration: booking.vehicle.registrationNumber,
      },
      paymentMethod: booking.payment?.paymentMethod || 'Online Payment',
      amount: booking.finalCost || 0,
      amountPaid: booking.amountPaid || 0,
      balanceDue: booking.balanceDue || 0,
      serviceDetails: {
        date: booking.bookingDate,
        issue: booking.reportedIssue,
        technician: booking.service?.worker?.name || 'Not Assigned',
        notes: booking.service?.repairNotes || '',
      },
      paymentDetails: {
        status: booking.payment.status,
        verifiedBy: booking.payment.verifiedBy,
        verifiedAt: booking.payment.verifiedAt,
        transactionId: booking.payment.transactionId,
      },
      workshopInfo: {
        name: "ChengService",
        address: "123 Workshop Street, Kuala Lumpur",
        phone: "03-1234 5678",
        email: "info@chengservice.com",
      },
      canGenerateReceipt: true
    };

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate receipt',
        canGenerateReceipt: false,
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}