// app/api/admin/workers/[id]/performance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // day, week, month, year

    if (!workerId) {
      return NextResponse.json(
        { error: "Worker ID is required" },
        { status: 400 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get worker services within period
    const services = await prisma.service.findMany({
      where: {
        workerId: workerId,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        booking: {
          select: {
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate metrics
    const totalServices = services.length;
    const completedServices = services.filter(s => s.serviceStatus === "Completed").length;
    const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;
    
    const totalRevenue = services
      .filter(s => s.serviceCost)
      .reduce((sum, service) => sum + (service.serviceCost || 0), 0);
    
    const avgServiceCost = completedServices > 0 ? totalRevenue / completedServices : 0;
    
    // Calculate average service duration
    const completedWithDuration = services.filter(s => 
      s.serviceStatus === "Completed" && s.duration
    );
    const avgDuration = completedWithDuration.length > 0 
      ? completedWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / completedWithDuration.length
      : 0;

    // Get recent customer feedback
    const feedback = await prisma.feedback.findMany({
      where: {
        service: {
          workerId: workerId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        customer: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            booking: {
              select: {
                vehicle: {
                  select: {
                    model: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format feedback
    const formattedFeedback = feedback.map(f => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      date: f.createdAt.toISOString(),
      customerName: f.customer.name,
      vehicleModel: f.service?.booking?.vehicle?.model || "Unknown"
    }));

    // Calculate average rating from feedback
    const avgRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      metrics: {
        totalServices,
        completedServices,
        completionRate: parseFloat(completionRate.toFixed(2)),
        totalRevenue,
        avgServiceCost: parseFloat(avgServiceCost.toFixed(2)),
        avgDuration: parseFloat(avgDuration.toFixed(1)),
        avgRating: parseFloat(avgRating.toFixed(1))
      },
      recentFeedback: formattedFeedback,
      servicesByStatus: {
        completed: completedServices,
        inProgress: services.filter(s => s.serviceStatus === "In Progress").length,
        pending: services.filter(s => s.serviceStatus === "Pending").length,
        cancelled: services.filter(s => s.serviceStatus === "Cancelled").length
      }
    });

  } catch (error) {
    console.error("Error fetching worker performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker performance metrics" },
      { status: 500 }
    );
  }
}