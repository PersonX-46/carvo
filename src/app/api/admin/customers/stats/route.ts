import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get total customers
    const totalCustomers = await prisma.customer.count();

    // Get total vehicles
    const totalVehicles = await prisma.vehicle.count();

    // Get total bookings
    const totalBookings = await prisma.booking.count();

    // Get recent customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get active customers (bookings in last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Count distinct customers with bookings in last 90 days
    const activeCustomersResult = await prisma.booking.groupBy({
      by: ['customerId'],
      where: {
        createdAt: {
          gte: ninetyDaysAgo
        }
      }
    });
    const activeCustomers = activeCustomersResult.length;

    return NextResponse.json({
      totalCustomers,
      totalVehicles,
      totalBookings,
      recentCustomers,
      activeCustomers
    });

  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer statistics" },
      { status: 500 }
    );
  }
}