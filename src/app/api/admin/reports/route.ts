import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let whereClause: any = {};

    if (type !== 'all') {
      whereClause.type = type;
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const formattedReports = reports.map(report => ({
      id: report.id,
      type: report.type,
      title: report.title,
      description: report.description || '',
      dateRange: report.dateRange || '',
      generatedBy: report.admin?.name || 'System',
      status: report.status,
      downloadUrl: report.downloadUrl,
      data: report.data ? JSON.parse(report.data) : {},
      createdAt: report.createdAt
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminId = 1; // You'll get this from auth context

    const report = await prisma.report.create({
      data: {
        type: body.type,
        title: body.title,
        description: body.description,
        dateRange: body.dateRange,
        generatedBy: 'Admin User', // You can get this from auth
        status: 'completed',
        downloadUrl: body.downloadUrl,
        data: JSON.stringify(body.data || {}),
        adminId: adminId
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}