// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Fetch payments with related data
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        booking: {
          select: {
            id: true,
            vehicle: {
              select: {
                model: true,
                registrationNumber: true,
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    // Format the response with receipt data
    const formattedPayments = payments.map(payment => {
      let uploadedReceipt = undefined;
      
      // Use the receiptUrl field if it exists
      if (payment.receiptUrl) {
        uploadedReceipt = {
          url: payment.receiptUrl,
          fileName: payment.receiptUrl.split('/').pop() || 'receipt.jpg',
          fileType: payment.receiptUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          uploadedAt: payment.paymentDate?.toISOString() || new Date().toISOString(),
          verified: payment.receiptVerified || false,
          verifiedBy: payment.verifiedBy || undefined,
          verifiedAt: payment.verifiedAt?.toISOString() || undefined,
          rejectionReason: payment.rejectionReason || undefined,
        };
      } 
      // Fallback to paymentDetails if receiptUrl doesn't exist
      else if (payment.paymentDetails) {
        try {
          const details = JSON.parse(payment.paymentDetails);
          if (details.receiptUrl) {
            uploadedReceipt = {
              url: details.receiptUrl,
              fileName: details.receiptFileName || 'receipt.jpg',
              fileType: details.receiptFileType || 'image/jpeg',
              uploadedAt: details.uploadedAt || payment.paymentDate?.toISOString() || new Date().toISOString(),
              verified: false,
            };
          }
        } catch (e) {
          console.error('Error parsing payment details:', e);
        }
      }

      return {
        id: payment.id,
        bookingId: payment.bookingId,
        customerId: payment.customerId,
        customerName: payment.customer?.name || 'Unknown',
        vehicleModel: payment.booking?.vehicle?.model || 'N/A',
        registrationNumber: payment.booking?.vehicle?.registrationNumber || 'N/A',
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate?.toISOString() || new Date().toISOString(),
        completedDate: payment.completedDate?.toISOString() || null,
        paymentDetails: payment.paymentDetails,
        receiptUrl: payment.receiptUrl,
        receiptVerified: payment.receiptVerified,
        uploadedReceipt: uploadedReceipt,
      };
    });

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      count: payments.length,
    });

  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}