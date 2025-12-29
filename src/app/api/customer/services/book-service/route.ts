import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Services with price ranges instead of fixed prices
    const services = [
      {
        id: 1,
        name: "Oil Change",
        description: "Complete engine oil and filter replacement",
        priceRange: {
          min: 80,
          max: 200,
          typical: 120
        },
        estimatedDuration: 1,
        category: "Maintenance"
      },
      {
        id: 2,
        name: "Brake Service",
        description: "Brake pad replacement and brake system check",
        priceRange: {
          min: 150,
          max: 500,
          typical: 250
        },
        estimatedDuration: 2,
        category: "Safety"
      },
      {
        id: 3,
        name: "AC Service",
        description: "AC system cleaning and gas refill",
        priceRange: {
          min: 120,
          max: 350,
          typical: 180
        },
        estimatedDuration: 1.5,
        category: "Comfort"
      },
      {
        id: 4,
        name: "Tire Service",
        description: "Tire rotation, balancing and pressure check",
        priceRange: {
          min: 50,
          max: 150,
          typical: 80
        },
        estimatedDuration: 1,
        category: "Maintenance"
      },
      {
        id: 5,
        name: "Battery Service",
        description: "Battery testing and replacement",
        priceRange: {
          min: 150,
          max: 500,
          typical: 200
        },
        estimatedDuration: 1,
        category: "Electrical"
      },
      {
        id: 6,
        name: "General Service",
        description: "Comprehensive vehicle checkup and maintenance",
        priceRange: {
          min: 100,
          max: 300,
          typical: 150
        },
        estimatedDuration: 2,
        category: "Maintenance"
      },
      {
        id: 7,
        name: "Engine Tune-up",
        description: "Spark plugs, filters, and engine optimization",
        priceRange: {
          min: 200,
          max: 800,
          typical: 350
        },
        estimatedDuration: 3,
        category: "Performance"
      },
      {
        id: 8,
        name: "Suspension Service",
        description: "Shock absorbers and suspension system check",
        priceRange: {
          min: 250,
          max: 1000,
          typical: 450
        },
        estimatedDuration: 2.5,
        category: "Safety"
      }
    ];

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}