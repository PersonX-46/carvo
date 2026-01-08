// app/api/upload/receipt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    const bookingId = formData.get('bookingId') as string;
    const customerId = formData.get('customerId') as string;

    if (!file || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'File and booking ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed. Use JPG, PNG, or PDF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `receipt-${bookingId}-${timestamp}-${originalName}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create URL for accessing the file
    const fileUrl = `/uploads/receipts/${fileName}`;

    // Get booking to know the amount
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      select: { finalCost: true, customerId: true }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if payment exists for this booking
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId: parseInt(bookingId) }
    });

    let updatedPayment;
    
    if (existingPayment) {
      // Update existing payment with receipt URL
      updatedPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          receiptUrl: fileUrl,
          receiptVerified: false,
          updatedAt: new Date(),
          // Also store in paymentDetails for backward compatibility
          paymentDetails: JSON.stringify({
            ...(existingPayment.paymentDetails ? JSON.parse(existingPayment.paymentDetails) : {}),
            receiptUrl: fileUrl,
            receiptFileName: fileName,
            receiptFileType: file.type,
            receiptFileSize: file.size,
            uploadedAt: new Date().toISOString(),
          }),
        }
      });
    } else {
      // Create new payment with receipt URL
      updatedPayment = await prisma.payment.create({
        data: {
          bookingId: parseInt(bookingId),
          customerId: parseInt(customerId || booking.customerId.toString()),
          amount: booking.finalCost || 0,
          paymentMethod: 'duitnow',
          status: 'pending',
          receiptUrl: fileUrl,
          receiptVerified: false,
          // Also store in paymentDetails for backward compatibility
          paymentDetails: JSON.stringify({
            receiptUrl: fileUrl,
            receiptFileName: fileName,
            receiptFileType: file.type,
            receiptFileSize: file.size,
            uploadedAt: new Date().toISOString(),
          }),
        }
      });
    }

    // Update booking payment status to pending (awaiting admin verification)
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        paymentStatus: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully',
      fileUrl: fileUrl,
      fileName: fileName,
      fileType: file.type,
      fileSize: file.size,
      payment: updatedPayment,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}