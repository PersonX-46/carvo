import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { bookingId, amount, paymentMethod, paymentDetails, customerId } = data;

    // Validate input
    if (!bookingId || !amount || !paymentMethod || !customerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const bookingExists = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId.toString()) },
    });

    if (!bookingExists) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('Creating payment for booking:', bookingId);
    console.log('Payment amount:', amount);
    console.log('Payment method:', paymentMethod);

    // Use capital P - Payment (matching your Prisma schema)
    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId.toString()),
        customerId: parseInt(customerId.toString()),
        amount: parseFloat(amount.toString()),
        paymentMethod: paymentMethod,
        status: 'pending',
        paymentDate: new Date(),
        paymentDetails: JSON.stringify(paymentDetails || {}),
      },
    });

    console.log('Payment created:', payment);

    // Update booking payment status
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId.toString()) },
      select: { amountPaid: true, finalCost: true }
    });

    const currentPaid = booking?.amountPaid || 0;
    const newAmountPaid = currentPaid + parseFloat(amount.toString());
    const finalCost = booking?.finalCost || parseFloat(amount.toString());
    const balanceDue = finalCost - newAmountPaid;

    // Determine payment status
    let paymentStatus = 'partially_paid';
    if (Math.abs(balanceDue) < 0.01) {
      paymentStatus = 'paid';
    } else if (newAmountPaid === 0) {
      paymentStatus = 'unpaid';
    }

    console.log('Updating booking payment status:', {
      currentPaid,
      newAmountPaid,
      finalCost,
      balanceDue,
      paymentStatus
    });

    // Update booking
    await prisma.booking.update({
      where: { id: parseInt(bookingId.toString()) },
      data: {
        paymentStatus: paymentStatus,
        amountPaid: newAmountPaid,
        balanceDue: Math.max(0, balanceDue),
      },
    });

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark payment as completed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        completedDate: new Date(),
        transactionId: `TRX-${Date.now()}-${payment.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: `TRX-${Date.now()}-${payment.id}`,
      paymentId: payment.id,
      message: 'Payment processed successfully',
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        details: error instanceof Error ? error.stack : 'Unknown error',
      },
      { status: 500 }
    );
  }
}