// app/api/worker/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workerId = searchParams.get("workerId");

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    const parsedWorkerId = parseInt(workerId);

    // FIXED: Now showing bookings assigned to this worker, not all pending bookings
    const assignedBookings = await prisma.booking.findMany({
      where: {
        workerId: parsedWorkerId,
        status: "Confirmed", // Bookings assigned by admin
        OR: [
          { priceApproved: false },
          { priceApproved: null }
        ],
        
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // PRICE PENDING: Worker submitted price, waiting for customer approval
    const pricePendingBookings = await prisma.booking.findMany({
      where: {
        workerId: parsedWorkerId,
        estimatedCost: { not: null },
        // Price not approved AND not rejected
        priceApproved: false,
        priceRejected: false,
        status: { not: "Completed" }
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // PRICE APPROVED: Customer approved the price
    const priceApprovedBookings = await prisma.booking.findMany({
      where: {
        workerId: parsedWorkerId,
        priceApproved: true,
        priceRejected: false,
        status: { not: "Completed" }
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // PRICE REJECTED: Customer rejected the price
    const priceRejectedBookings = await prisma.booking.findMany({
      where: {
        workerId: parsedWorkerId,
        priceRejected: true,
        priceApproved: false,
        status: { not: "Completed" }
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // IN PROGRESS: Work has started
    const inProgressBookings = await prisma.booking.findMany({
      where: {
        status: "In Progress",
        workerId: parsedWorkerId
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // COMPLETED: Work is done
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: "Completed",
        workerId: parsedWorkerId
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            mileage: true
          }
        },
        service: {
          include: {
            worker: {
              select: {
                name: true
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
      assignedBookings,
      pricePendingBookings,
      priceApprovedBookings,
      priceRejectedBookings,
      inProgressBookings,
      completedBookings,
      totalAssigned: assignedBookings.length
    });

  } catch (error) {
    console.error("Error fetching worker bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}