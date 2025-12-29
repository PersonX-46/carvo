// app/api/customer/[id]/price-approvals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Bookings with price estimates but not yet approved/rejected
    const pendingApprovals = await prisma.booking.findMany({
      where: {
        customerId,
        status: "Confirmed",
        estimatedCost: { not: null },
        OR: [
          { priceApproved: false, priceRejected: false },
          { priceApproved: null, priceRejected: null }
        ]
      },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true,
                rating: true,
                totalServices: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Approved price estimates
    const approvedBookings = await prisma.booking.findMany({
      where: {
        customerId,
        priceApproved: true
      },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true,
                rating: true,
                totalServices: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Rejected price estimates
    const rejectedBookings = await prisma.booking.findMany({
      where: {
        customerId,
        priceRejected: true
      },
      include: {
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true,
                rating: true,
                totalServices: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    return NextResponse.json({
      pendingApprovals,
      approvedBookings,
      rejectedBookings
    });

  } catch (error) {
    console.error("Error fetching price approvals:", error);
    return NextResponse.json(
      { error: "Failed to fetch price approvals" },
      { status: 500 }
    );
  }
}