// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import Stripe from 'stripe';

// const prisma = new PrismaClient();

// // Initialize payment providers
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-12-15'
// });

// // For Malaysia, you'll need to sign up with these providers:
// // 1. Touch 'n Go eWallet (https://developer.touchngo.com.my/)
// // 2. FPX (via banks like Maybank, CIMB, or payment gateways like iPay88)
// // 3. Stripe (for international cards - available in Malaysia!)

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { bookingId, amount, paymentMethod, customerId, description } = body;

//     // Validate input
//     if (!bookingId || !amount || !paymentMethod || !customerId) {
//       return NextResponse.json(
//         { success: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Create payment record
//     const payment = await prisma.payment.create({
//       data: {
//         bookingId,
//         amount,
//         paymentMethod,
//         customerId,
//         status: 'pending',
//         referenceNumber: `PAY-${Date.now()}-${bookingId}`,
//         paymentProvider: getProviderForMethod(paymentMethod)
//       }
//     });

//     // Generate invoice number
//     const invoiceNumber = `INV-${new Date().getFullYear()}-${String(bookingId).padStart(6, '0')}`;
    
//     // Update booking
//     await prisma.booking.update({
//       where: { id: bookingId },
//       data: { invoiceNumber }
//     });

//     // Handle different payment methods
//     let paymentUrl = '';
//     let sessionId = '';

//     switch (paymentMethod.toLowerCase()) {
//       case 'card':
//         // Stripe Checkout for cards
//         const session = await stripe.checkout.sessions.create({
//           payment_method_types: ['card'],
//           line_items: [{
//             price_data: {
//               currency: 'myr',
//               product_data: {
//                 name: `Car Service - ${vehicleModel}`,
//                 description: `Booking #${bookingId} - ${description}`,
//               },
//               unit_amount: Math.round(amount * 100), // Convert to sen
//             },
//             quantity: 1,
//           }],
//           mode: 'payment',
//           success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//           cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
//           metadata: {
//             bookingId: bookingId.toString(),
//             paymentId: payment.id.toString(),
//             customerId: customerId.toString()
//           }
//         });
        
//         sessionId = session.id;
//         paymentUrl = session.url || '';
//         break;

//       case 'tng':
//       case 'touchngo':
//         // Touch 'n Go eWallet Integration
//         // You need to sign up at: https://developer.touchngo.com.my/
//         const tngResponse = await createTouchNGoPayment({
//           bookingId,
//           amount,
//           paymentId: payment.id,
//           description
//         });
        
//         paymentUrl = tngResponse.paymentUrl;
//         break;

//       case 'fpx':
//         // FPX Online Banking Integration
//         // Can use iPay88, Billplz, or direct bank integration
//         const fpxResponse = await createFPXPayment({
//           bookingId,
//           amount,
//           paymentId: payment.id,
//           description
//         });
        
//         paymentUrl = fpxResponse.paymentUrl;
//         break;

//       default:
//         throw new Error('Invalid payment method');
//     }

//     // Update payment with provider reference
//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: {
//         transactionId: sessionId || payment.id.toString(),
//         paymentDate: new Date()
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       sessionId,
//       paymentUrl,
//       paymentId: payment.id,
//       referenceNumber: payment.referenceNumber
//     });

//   } catch (error) {
//     console.error('Payment creation error:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to create payment' },
//       { status: 500 }
//     );
//   }
// }

// // Helper functions for Malaysian payment providers
// function getProviderForMethod(method: string): string {
//   switch (method.toLowerCase()) {
//     case 'card': return 'stripe';
//     case 'tng': return 'touchngo';
//     case 'fpx': return 'fpx';
//     default: return 'unknown';
//   }
// }

// // Touch 'n Go eWallet Implementation
// async function createTouchNGoPayment(params: {
//   bookingId: number;
//   amount: number;
//   paymentId: number;
//   description: string;
// }) {
//   // You'll need to sign up for TnG Developer account
//   // Documentation: https://developer.touchngo.com.my/
  
//   const tngApiKey = process.env.TNG_API_KEY;
//   const tngApiSecret = process.env.TNG_API_SECRET;
  
//   if (!tngApiKey || !tngApiSecret) {
//     throw new Error('Touch \'n Go API credentials not configured');
//   }

//   // Example API call (you'll need to implement based on TnG documentation)
//   const tngRequest = {
//     amount: params.amount,
//     currency: "MYR",
//     order_id: `BOOKING-${params.bookingId}`,
//     payment_id: `PAY-${params.paymentId}`,
//     description: params.description,
//     redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/tng-callback`,
//     callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/tng-webhook`
//   };

//   // This is a placeholder - you need to implement actual TnG API call
//   // const response = await fetch('https://api.touchngo.com.my/v1/payments', {
//   //   method: 'POST',
//   //   headers: {
//   //     'Authorization': `Bearer ${tngApiKey}`,
//   //     'Content-Type': 'application/json',
//   //   },
//   //   body: JSON.stringify(tngRequest)
//   // });
  
//   // For now, return a placeholder URL
//   return {
//     paymentUrl: `https://checkout.touchngo.com.my/pay?amount=${params.amount}&order=BOOKING-${params.bookingId}&ref=PAY-${params.paymentId}`
//   };
// }

// // FPX Online Banking Implementation
// async function createFPXPayment(params: {
//   bookingId: number;
//   amount: number;
//   paymentId: number;
//   description: string;
// }) {
//   // You can use iPay88, Billplz, or direct FPX integration
//   // iPay88 is popular in Malaysia: https://www.ipay88.com/
  
//   const fpxMerchantCode = process.env.FPX_MERCHANT_CODE;
//   const fpxMerchantKey = process.env.FPX_MERCHANT_KEY;
  
//   if (!fpxMerchantCode || !fpxMerchantKey) {
//     throw new Error('FPX merchant credentials not configured');
//   }

//   // Generate signature (example for iPay88 format)
//   const amountFormatted = params.amount.toFixed(2);
//   const refNo = `BOOKING-${params.bookingId}`;
  
//   // This is simplified - actual implementation requires proper signature generation
//   const signature = generateFPXSignature({
//     merchantCode: fpxMerchantCode,
//     refNo,
//     amount: amountFormatted,
//     currency: "MYR"
//   }, fpxMerchantKey);

//   // Return payment URL (iPay88 example)
//   return {
//     paymentUrl: `https://payment.ipay88.com.my/epayment/entry.asp?MerchantCode=${fpxMerchantCode}&RefNo=${refNo}&Amount=${amountFormatted}&Currency=MYR&Signature=${signature}`
//   };
// }

// function generateFPXSignature(params: any, merchantKey: string): string {
//   // Implement actual signature generation based on your payment gateway
//   // This is a simplified example
//   const stringToSign = `${params.merchantCode}${params.refNo}${params.amount}${params.currency}`;
//   // Use crypto library for actual implementation
//   return Buffer.from(stringToSign + merchantKey).toString('base64');
// }