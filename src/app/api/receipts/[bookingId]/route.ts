// src/app/api/payments/receipt/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;
    
    // In a real app, fetch from database
    // For now, simulate
    const receipt = {
      bookingId: parseInt(bookingId),
      transactionId: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      amount: 250.00,
      paymentMethod: "Credit Card",
      status: "Completed",
      vehicle: "Toyota Vios",
      registrationNumber: "ABC1234",
      customerName: "John Doe",
      serviceType: "Oil Change",
      receiptNumber: `RC-${Date.now()}`
    };

    return NextResponse.json({
      success: true,
      receipt
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch receipt',
      },
      { status: 500 }
    );
  }
}