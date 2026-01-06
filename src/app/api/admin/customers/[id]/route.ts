import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Fetch customer with detailed information
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        joinDate: true,
        createdAt: true,
        // Count vehicles and bookings
        _count: {
          select: {
            vehicles: true,
            bookings: true
          }
        },
        // Get vehicles
        vehicles: {
          select: {
            id: true,
            model: true,
            registrationNumber: true,
            year: true,
            type: true,
            color: true,
            engineCapacity: true,
            mileage: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        // Get bookings with vehicle info
        bookings: {
          select: {
            id: true,
            bookingDate: true,
            status: true,
            reportedIssue: true,
            estimatedCost: true,
            vehicle: {
              select: {
                id: true,
                model: true,
                registrationNumber: true
              }
            },
            service: {
              select: {
                serviceStatus: true
              }
            }
          },
          orderBy: {
            bookingDate: 'desc'
          },
          take: 10
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get last service date
    const lastService = await prisma.booking.findFirst({
      where: {
        customerId: customerId,
        status: "Completed"
      },
      select: {
        bookingDate: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Transform the data to match your component's expected format
    const { _count, ...customerWithoutCount } = customer;
    const responseData = {
      ...customerWithoutCount,
      totalVehicles: _count.vehicles,
      totalBookings: _count.bookings,
      lastServiceDate: lastService?.bookingDate || null,
      // Transform vehicles to match expected format
      vehicles: customer.vehicles.map(vehicle => ({
        id: vehicle.id,
        customerId: customerId,
        model: vehicle.model,
        registrationNumber: vehicle.registrationNumber,
        year: vehicle.year,
        type: vehicle.type,
        color: vehicle.color,
        engineCapacity: vehicle.engineCapacity,
        mileage: vehicle.mileage
      })),
      // Transform bookings to match expected format
      bookings: customer.bookings.map(booking => ({
        id: booking.id,
        customerId: customerId,
        vehicleId: booking.vehicle?.id || 0,
        vehicleModel: booking.vehicle?.model || "Unknown",
        registrationNumber: booking.vehicle?.registrationNumber || "Unknown",
        bookingDate: booking.bookingDate,
        status: booking.status,
        reportedIssue: booking.reportedIssue,
        estimatedCost: booking.estimatedCost,
        serviceStatus: booking.service?.serviceStatus || null
      }))
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch customer details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another customer
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: email,
        NOT: {
          id: customerId
        }
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Email is already registered by another customer" },
        { status: 400 }
      );
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        email,
        phone,
        address
      }
    });

    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer
    });

  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { 
        error: "Failed to update customer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const customerId = parseInt(resolvedParams.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            bookings: true,
            vehicles: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if customer has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        customerId: customerId,
        status: {
          in: ["Pending", "Confirmed", "In Progress"]
        }
      }
    });

    if (activeBookings) {
      return NextResponse.json(
        { 
          error: "Cannot delete customer with active bookings",
          bookingsCount: customer._count.bookings,
          vehiclesCount: customer._count.vehicles
        },
        { status: 400 }
      );
    }

    // Delete customer (cascade will delete related vehicles, bookings, etc.)
    await prisma.customer.delete({
      where: { id: customerId }
    });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete customer",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}