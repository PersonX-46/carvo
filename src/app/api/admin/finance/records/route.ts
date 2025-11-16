import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all';
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (type !== 'all') {
      whereClause.category = type;
    }

    const [records, totalCount] = await Promise.all([
      prisma.finance.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        include: {
          admin: {
            select: {
              name: true
            }
          }
        },
        skip,
        take: limit
      }),
      prisma.finance.count({ where: whereClause })
    ]);

    const formattedRecords = records.map(record => ({
      id: record.id,
      amount: record.amount,
      category: record.category,
      date: record.date,
      notes: record.notes,
      createdBy: record.admin?.name || 'System',
      createdAt: record.createdAt
    }));

    return NextResponse.json({
      records: formattedRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching financial records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminId = 1; // From auth context

    const record = await prisma.finance.create({
      data: {
        adminId,
        amount: parseFloat(body.amount),
        category: body.category,
        date: new Date(body.date),
        notes: body.notes
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
      message: 'Financial record created successfully',
      record: {
        id: record.id,
        amount: record.amount,
        category: record.category,
        date: record.date,
        notes: record.notes,
        createdBy: record.admin?.name
      }
    });
  } catch (error) {
    console.error('Error creating financial record:', error);
    return NextResponse.json(
      { error: 'Failed to create financial record' },
      { status: 500 }
    );
  }
}