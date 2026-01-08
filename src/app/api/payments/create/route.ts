// app/api/payments/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      bookingId, 
      amount, 
      paymentMethod, 
      customerId, 
      receiptUrl,
      paymentDetails,
      transactionId 
    } = body;

    console.log('Processing payment for booking:', bookingId);
    console.log('Amount:', amount);
    console.log('Payment method:', paymentMethod);
    console.log('Receipt URL:', receiptUrl);

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    let payment;

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId: bookingId }
    });

    // Prepare payment details
    let finalPaymentDetails = paymentDetails || {};
    
    // If receipt URL is provided, use it
    let finalReceiptUrl = receiptUrl;
    if (receiptUrl && !finalReceiptUrl) {
      finalReceiptUrl = receiptUrl;
    }

    if (existingPayment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: parseFloat(amount),
          paymentMethod: paymentMethod,
          status: 'completed',
          transactionId: transactionId,
          paymentDate: new Date(),
          completedDate: new Date(),
          receiptUrl: finalReceiptUrl || existingPayment.receiptUrl,
          paymentDetails: JSON.stringify(finalPaymentDetails),
          updatedAt: new Date(),
        }
      });
      console.log('Updated existing payment:', payment.id);
    } else {
      // Create new payment
      payment = await prisma.payment.create({
        data: {
          bookingId: bookingId,
          customerId: customerId,
          amount: parseFloat(amount),
          paymentMethod: paymentMethod,
          status: 'completed',
          transactionId: transactionId,
          paymentDate: new Date(),
          completedDate: new Date(),
          receiptUrl: finalReceiptUrl,
          paymentDetails: JSON.stringify(finalPaymentDetails),
        }
      });
      console.log('Created new payment:', payment.id);
    }

    // Calculate payment status for booking
    const totalPaid = (booking.amountPaid || 0) + parseFloat(amount);
    const finalCost = booking.finalCost || 0;
    const balanceDue = Math.max(0, finalCost - totalPaid);
    
    let paymentStatus = 'unpaid';
    if (balanceDue === 0 && finalCost > 0) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    // Update booking payment status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: paymentStatus,
        amountPaid: totalPaid,
        balanceDue: balanceDue,
      }
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        receiptUrl: payment.receiptUrl,
        receiptVerified: payment.receiptVerified,
        paymentDetails: payment.paymentDetails ? JSON.parse(payment.paymentDetails) : null,
      },
      booking: {
        id: updatedBooking.id,
        paymentStatus: updatedBooking.paymentStatus,
        amountPaid: updatedBooking.amountPaid,
        balanceDue: updatedBooking.balanceDue,
        finalCost: updatedBooking.finalCost,
      }
    });

  } catch (error: any) {
    console.error('Payment processing error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Payment record already exists for this booking'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Payment processing failed'
    }, { status: 500 });
  }
}