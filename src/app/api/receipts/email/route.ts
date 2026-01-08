import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerEmail, customerName, receiptData } = data;

    if (!customerEmail || customerEmail === "N/A") {
      return NextResponse.json(
        { error: "Customer email not available" },
        { status: 400 }
      );
    }

    // Create email transporter (configure with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format receipt details for email
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #059669; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>ChengService Auto Workshop</p>
            </div>
            
            <div class="section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${receiptData.customerName}</p>
              <p><strong>Vehicle:</strong> ${receiptData.vehicleModel} (${receiptData.registrationNumber})</p>
            </div>
            
            <div class="section">
              <h3>Payment Details</h3>
              <p><strong>Transaction ID:</strong> ${receiptData.transactionId}</p>
              <p><strong>Booking ID:</strong> #${receiptData.bookingId}</p>
              <p><strong>Payment Method:</strong> ${receiptData.paymentMethod}</p>
              <p><strong>Date:</strong> ${new Date(receiptData.paymentDate).toLocaleDateString()}</p>
              <p class="amount">Amount: RM ${receiptData.amount.toFixed(2)}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated receipt. No signature required.</p>
              <p>For inquiries: +6012-345 6789 | info@chengservice.com</p>
              <p>Thank you for choosing ChengService!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"ChengService" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Payment Receipt - ${receiptData.transactionId}`,
      html: receiptHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Receipt email sent successfully",
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send receipt email",
      },
      { status: 500 }
    );
  }
}