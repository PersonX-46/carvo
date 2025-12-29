// app/api/bookings/[id]/price-approval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const { approved, reason } = await request.json();

    if (approved === undefined) {
      return NextResponse.json(
        { error: "Approval status is required" },
        { status: 400 }
      );
    }

    if (!approved && !reason) {
      return NextResponse.json(
        { error: "Reason is required when rejecting price" },
        { status: 400 }
      );
    }

    // Update the booking with price approval status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        priceApproved: approved,
        priceRejected: !approved,
        rejectionReason: !approved ? reason : null,
        // If approved, we can also update the service status
        ...(approved && {
          service: {
            update: {
              serviceStatus: "Price Approved"
            }
          }
        }),
        // If rejected, update service status and add notes
        ...(!approved && {
          service: {
            update: {
              serviceStatus: "Price Rejected",
              repairNotes: reason ? `Customer feedback: ${reason}` : undefined
            }
          }
        })
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Here you can add notification logic:
    // - Send email to customer
    // - Send notification to worker
    // - Send WhatsApp message if needed

    return NextResponse.json({
      message: approved ? "Price approved successfully" : "Price rejected successfully",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error updating price approval:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update price approval" },
      { status: 500 }
    );
  }
}