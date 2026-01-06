import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billplz_id, paid, paid_at, transaction_id } = body;

    // Verify payment with Billplz
    if (billplz_id) {
      const verifyResponse = await fetch(
        `https://www.billplz.com/api/v3/bills/${billplz_id}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              process.env.BILLPLZ_API_KEY + ":"
            ).toString("base64")}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.paid) {
        // Extract booking ID from description or metadata
        const bookingId = parseInt(verifyData.description?.match(/#(\d+)/)?.[1] || "0");

        if (bookingId) {
          // Update booking as paid
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "Paid",
            },
          });

          // Create payment record
          await prisma.finance.create({
            data: {
              adminId: 1,
              amount: verifyData.amount / 100, // Convert from cents
              category: "payment_received",
              notes: `Payment received via ${verifyData.payment_method} for Booking #${bookingId}. Reference: ${billplz_id}`,
            },
          });

          // Send confirmation email/SMS
          await sendPaymentConfirmation(bookingId, verifyData);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function sendPaymentConfirmation(bookingId: number, paymentData: any) {
  // Send email or SMS confirmation
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, vehicle: true },
  });

  if (booking) {
    // Send WhatsApp message
    const message = `✅ Payment Confirmed!

Dear ${booking.customer.name},

Your payment of RM ${(paymentData.amount / 100).toFixed(2)} has been received successfully.

📋 Details:
• Booking #${bookingId}
• Vehicle: ${booking.vehicle.model} (${booking.vehicle.registrationNumber})
• Payment Method: ${paymentData.payment_method}
• Transaction ID: ${paymentData.id}
• Date: ${new Date(paymentData.paid_at).toLocaleDateString()}

Thank you for your payment!

Best regards,
Cheng Service Team`;

    // You can implement WhatsApp sending here
    console.log("Payment confirmation message:", message);
  }
}