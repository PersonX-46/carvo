import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { type, title, description, dateRange } = await request.json();
    const adminId = 1; // From auth context

    // Generate report data based on type
    let reportData = {};
    let downloadUrl = '';

    switch (type) {
      case 'financial':
        reportData = await generateFinancialReport(dateRange);
        downloadUrl = `/api/admin/reports/export/financial?range=${dateRange}`;
        break;
      case 'service':
        reportData = await generateServiceReport(dateRange);
        downloadUrl = `/api/admin/reports/export/service?range=${dateRange}`;
        break;
      case 'customer':
        reportData = await generateCustomerReport(dateRange);
        downloadUrl = `/api/admin/reports/export/customer?range=${dateRange}`;
        break;
      case 'inventory':
        reportData = await generateInventoryReport();
        downloadUrl = `/api/admin/reports/export/inventory`;
        break;
      case 'worker':
        reportData = await generateWorkerReport(dateRange);
        downloadUrl = `/api/admin/reports/export/worker?range=${dateRange}`;
        break;
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        type,
        title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        description: description || `Automatically generated ${type} report`,
        dateRange: dateRange || `${new Date().toISOString().split('T')[0]}`,
        generatedBy: 'Admin User',
        status: 'completed',
        downloadUrl,
        data: JSON.stringify(reportData),
        adminId
      },
      include: {
        admin: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Report generated successfully',
      report: {
        id: report.id,
        type: report.type,
        title: report.title,
        description: report.description,
        dateRange: report.dateRange,
        generatedBy: report.admin?.name || 'System',
        status: report.status,
        downloadUrl: report.downloadUrl,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generateFinancialReport(dateRange: string) {
  // Implement financial report generation logic
  const response = await fetch(`http://localhost:3000/api/admin/analytics?period=month`);
  const analytics = await response.json();
  return analytics.financial;
}

async function generateServiceReport(dateRange: string) {
  // Implement service report generation logic
  const response = await fetch(`http://localhost:3000/api/admin/analytics?period=month`);
  const analytics = await response.json();
  return analytics.services;
}

async function generateCustomerReport(dateRange: string) {
  // Implement customer report generation logic
  const response = await fetch(`http://localhost:3000/api/admin/analytics?period=month`);
  const analytics = await response.json();
  return analytics.customers;
}

async function generateInventoryReport() {
  const stockItems = await prisma.stock.findMany();
  const totalValue = stockItems.reduce((sum, item) => 
    sum + (item.quantity * (item.unitPrice || 0)), 0
  );

  const lowStockItems = stockItems.filter(item => 
    item.quantity <= item.minStockLevel
  );

  return {
    totalItems: stockItems.length,
    totalValue,
    lowStockItems: lowStockItems.length,
    stockItems: stockItems.map(item => ({
      name: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      value: item.quantity * (item.unitPrice || 0)
    }))
  };
}

async function generateWorkerReport(dateRange: string) {
  const workers = await prisma.worker.findMany({
    include: {
      services: {
        where: {
          serviceStatus: 'Completed'
        },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: true
            }
          }
        }
      }
    }
  });

  const workerPerformance = workers.map(worker => ({
    name: worker.name,
    completedServices: worker.services.length,
    totalRevenue: worker.services.reduce((sum, service) => 
      sum + (service.serviceCost || 0), 0
    ),
    averageRating: worker.rating || 0,
    specialization: worker.specialization,
    currentWorkload: worker.currentWorkload
  }));

  return {
    totalWorkers: workers.length,
    workerPerformance,
    averageCompletionRate: workers.reduce((sum, worker) => 
      sum + worker.services.length, 0
    ) / workers.length
  };
}