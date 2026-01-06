import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const workerId = parseInt(resolvedParams.id);

    if (isNaN(workerId)) {
      return NextResponse.json(
        { error: "Invalid worker ID" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month"; // month, week, year

    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get completed services in period
    const completedServices = await prisma.service.findMany({
      where: {
        workerId,
        serviceStatus: "Completed",
        completionDate: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        booking: true
      }
    });

    // Calculate statistics
    const totalServices = completedServices.length;
    const totalRevenue = completedServices.reduce((sum, service) => 
      sum + (service.serviceCost || 0), 0
    );
    const avgServiceCost = totalServices > 0 ? totalRevenue / totalServices : 0;

    // Get average completion time
    const servicesWithDuration = completedServices.filter(s => s.duration);
    const avgCompletionTime = servicesWithDuration.length > 0 
      ? servicesWithDuration.reduce((sum, s) => sum + (s.duration || 0), 0) / servicesWithDuration.length
      : 0;

    // Get rating distribution (if you have feedback system)
    const feedback = await prisma.feedback.findMany({
      where: {
        // You might need to adjust this based on your schema
        // This assumes feedback is linked to services
      }
    });

    // Get recent activity
    const recentActivity = await prisma.service.findMany({
      where: { workerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        booking: {
          include: {
            vehicle: {
              select: {
                model: true,
                registrationNumber: true
              }
            },
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      statistics: {
        totalServices,
        totalRevenue,
        avgServiceCost: parseFloat(avgServiceCost.toFixed(2)),
        avgCompletionTime: parseFloat(avgCompletionTime.toFixed(2)),
        currentWorkload: completedServices.filter(s => 
          s.serviceStatus === "In Progress"
        ).length,
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        serviceStatus: activity.serviceStatus,
        vehicleModel: activity.booking?.vehicle?.model || "Unknown",
        customerName: activity.booking?.customer?.name || "Unknown",
        createdAt: activity.createdAt.toISOString(),
      })),
    });

  } catch (error) {
    console.error("Error fetching worker performance:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch worker performance data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}