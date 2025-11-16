import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const customerId = parseInt(params.id);

    // Get customer with all related data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        vehicles: {
          include: {
            bookings: {
              include: {
                service: {
                  select: {
                    serviceCost: true,
                    serviceStatus: true
                  }
                }
              },
              orderBy: { bookingDate: 'desc' },
              take: 10
            }
          }
        },
        bookings: {
          include: {
            vehicle: {
              select: {
                model: true,
                registrationNumber: true
              }
            },
            service: {
              select: {
                serviceCost: true,
                serviceStatus: true
              }
            }
          },
          orderBy: { bookingDate: 'desc' },
          take: 10
        },
        serviceReports: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Format vehicles data
    const vehicles = customer.vehicles.map(vehicle => ({
      id: vehicle.id,
      customerId: vehicle.customerId,
      model: vehicle.model,
      registrationNumber: vehicle.registrationNumber,
      year: vehicle.year,
      type: vehicle.type,
      color: vehicle.color,
      engineCapacity: vehicle.engineCapacity,
      mileage: vehicle.mileage
    }));

    // Format bookings data
    const bookings = customer.bookings.map(booking => ({
      id: booking.id,
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      vehicleModel: booking.vehicle.model,
      registrationNumber: booking.vehicle.registrationNumber,
      bookingDate: booking.bookingDate,
      status: booking.status,
      reportedIssue: booking.reportedIssue,
      estimatedCost: booking.service?.serviceCost || booking.estimatedCost,
      serviceStatus: booking.service?.serviceStatus
    }));

    // Calculate customer stats
    const totalVehicles = customer.vehicles.length;
    const totalBookings = customer.bookings.length;
    const lastServiceDate = customer.serviceReports[0]?.createdAt || null;

    const customerDetails = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      totalVehicles,
      totalBookings,
      lastServiceDate,
      createdAt: customer.createdAt,
      joinDate: customer.joinDate,
      vehicles,
      bookings
    };

    return NextResponse.json(customerDetails);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}