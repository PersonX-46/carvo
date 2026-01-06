import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// For Touch 'n Go and FPX, you might need to use a Malaysian payment gateway
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;

interface PaymentRequest {
  bookingId: number;
  amount: number;
  paymentMethod: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleModel: string;
  registrationNumber: string;
  description: string;
  bankCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    const {
      bookingId,
      amount,
      paymentMethod,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      vehicleModel,
      registrationNumber,
      description,
      bankCode,
    } = body;

    console.log("Received payment request:", body);

    // Validate required fields
    if (!bookingId || !amount || !paymentMethod || !customerId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        vehicle: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "Completed") {
      return NextResponse.json(
        { success: false, error: "Service must be completed before payment" },
        { status: 400 }
      );
    }

    // Check if already paid
    const existingPayment = await prisma.finance.findFirst({
      where: {
        adminId: 1,
        notes: { contains: `Booking #${bookingId}` },
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: "Payment already processed for this booking" },
        { status: 400 }
      );
    }

    // Handle different payment methods
    let paymentResult: any;

    switch (paymentMethod.toLowerCase()) {
      case "card":
        // Stripe Credit/Debit Card
        paymentResult = await handleStripePayment({
          amount,
          customerEmail,
          customerName,
          bookingId,
          vehicleModel,
          registrationNumber,
          description,
        });
        break;

      case "tng":
        // Touch 'n Go eWallet
        paymentResult = await handleTngPayment({
          amount,
          customerEmail,
          customerPhone,
          customerName,
          description,
        });
        break;

      case "fpx":
        // FPX Online Banking
        paymentResult = await handleFpxPayment({
          amount,
          customerEmail,
          customerPhone,
          customerName,
          description,
          bankCode,
        });
        break;

      case "grabpay":
      case "boost":
      case "shopee":
        // Other eWallets
        paymentResult = await handleEwalletPayment({
          amount,
          customerEmail,
          customerPhone,
          customerName,
          description,
          ewalletType: paymentMethod,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Unsupported payment method" },
          { status: 400 }
        );
    }

    // Create payment record in database
    const paymentRecord = await prisma.finance.create({
      data: {
        adminId: 1,
        amount: amount,
        category: "service_payment",
        notes: `Payment for Booking #${bookingId} - ${vehicleModel} (${registrationNumber}) via ${paymentMethod.toUpperCase()}. Customer: ${customerName}`,
      },
    });

    // Update booking payment status - you need to add a payment status field to your Booking model
    // For now, let's add a note in the service
    if (booking.service) {
      await prisma.service.update({
        where: { id: booking.service.id },
        data: {
          repairNotes: `${booking.service.repairNotes || ''}\n\n[PAID] Payment received via ${paymentMethod} on ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // Create payment transaction record
    const transaction = await prisma.finance.create({
      data: {
        adminId: 1,
        amount: amount,
        category: "payment_received",
        notes: `Payment received for booking ${bookingId} - ${paymentMethod}. Reference: ${paymentResult.reference || 'N/A'}`,
      },
    });

    console.log("Payment processed successfully:", {
      transactionId: transaction.id,
      paymentResult,
    });

    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully",
      paymentUrl: paymentResult.paymentUrl,
      sessionId: paymentResult.sessionId,
      reference: paymentResult.reference,
      transactionId: transaction.id,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      },
      { status: 500 }
    );
  }
}

// Stripe Payment Handler
interface StripePaymentParams {
  amount: number;
  customerEmail: string;
  customerName: string;
  bookingId: number;
  vehicleModel: string;
  registrationNumber: string;
  description: string;
}

async function handleStripePayment(params: StripePaymentParams) {
  const { amount, customerEmail, customerName, bookingId, vehicleModel, registrationNumber, description } = params;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: "Car Service Payment",
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
      customer_email: customerEmail,
      metadata: {
        bookingId: bookingId.toString(),
        customerName,
        vehicleModel,
        registrationNumber,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url,
      reference: session.id,
    };
  } catch (error) {
    console.error("Stripe payment error:", error);
    throw new Error("Failed to create Stripe payment session");
  }
}

// Touch 'n Go Payment Handler
interface TngPaymentParams {
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  description: string;
}

async function handleTngPayment(params: TngPaymentParams) {
  const { amount, customerEmail, customerPhone, customerName, description } = params;

  // For production, use actual TnG API or a gateway like Billplz
  // This is a mock implementation for development
  
  if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) {
    console.warn("Billplz credentials not set. Using mock payment.");
    return {
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/mock-success`,
      reference: `TNG_MOCK_${Date.now()}`,
    };
  }

  try {
    const billplzResponse = await fetch("https://www.billplz.com/api/v3/bills", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(BILLPLZ_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: BILLPLZ_COLLECTION_ID,
        email: customerEmail,
        mobile: customerPhone,
        name: customerName,
        amount: amount * 100, // Convert to cents
        description: description,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      }),
    });

    const billplzData = await billplzResponse.json();

    if (!billplzResponse.ok) {
      throw new Error(billplzData.error?.message || "Billplz API error");
    }

    return {
      paymentUrl: billplzData.url,
      reference: billplzData.id,
    };
  } catch (error) {
    console.error("TnG payment error:", error);
    throw new Error("Failed to create Touch 'n Go payment");
  }
}

// FPX Payment Handler
interface FpxPaymentParams extends TngPaymentParams {
  bankCode?: string;
}

async function handleFpxPayment(params: FpxPaymentParams) {
  const { amount, customerEmail, customerPhone, customerName, description, bankCode } = params;

  // Mock implementation for development
  if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) {
    console.warn("Billplz credentials not set. Using mock payment.");
    return {
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/mock-success`,
      reference: `FPX_MOCK_${Date.now()}_${bankCode || 'maybank'}`,
    };
  }

  try {
    const billplzResponse = await fetch("https://www.billplz.com/api/v3/bills", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(BILLPLZ_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: BILLPLZ_COLLECTION_ID,
        email: customerEmail,
        mobile: customerPhone,
        name: customerName,
        amount: amount * 100,
        description: description,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      }),
    });

    const billplzData = await billplzResponse.json();

    if (!billplzResponse.ok) {
      throw new Error(billplzData.error?.message || "Billplz API error");
    }

    return {
      paymentUrl: billplzData.url,
      reference: billplzData.id,
    };
  } catch (error) {
    console.error("FPX payment error:", error);
    throw new Error("Failed to create FPX payment");
  }
}

// Generic eWallet handler
interface EwalletPaymentParams extends TngPaymentParams {
  ewalletType: string;
}

async function handleEwalletPayment(params: EwalletPaymentParams) {
  const { amount, customerEmail, customerPhone, customerName, description, ewalletType } = params;

  // Mock implementation for development
  if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) {
    console.warn("Billplz credentials not set. Using mock payment.");
    return {
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/mock-success`,
      reference: `${ewalletType.toUpperCase()}_MOCK_${Date.now()}`,
    };
  }

  try {
    const billplzResponse = await fetch("https://www.billplz.com/api/v3/bills", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(BILLPLZ_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: BILLPLZ_COLLECTION_ID,
        email: customerEmail,
        mobile: customerPhone,
        name: customerName,
        amount: amount * 100,
        description: description,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      }),
    });

    const billplzData = await billplzResponse.json();

    if (!billplzResponse.ok) {
      throw new Error(billplzData.error?.message || "Billplz API error");
    }

    return {
      paymentUrl: billplzData.url,
      reference: billplzData.id,
    };
  } catch (error) {
    console.error(`${ewalletType} payment error:`, error);
    throw new Error(`Failed to create ${ewalletType} payment`);
  }
}