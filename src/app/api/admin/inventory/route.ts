import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const category = searchParams.get('category') || 'all';

    // Build where clause based on search and filters
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category !== 'all') {
      whereClause.category = category;
    }

    // Apply stock level filters
    if (filter === 'low_stock') {
      whereClause.quantity = {
        lte: prisma.stock.fields.minStockLevel,
        gt: 0
      };
    } else if (filter === 'out_of_stock') {
      whereClause.quantity = 0;
    } else if (filter === 'need_reorder') {
      whereClause.quantity = {
        lte: prisma.stock.fields.minStockLevel
      };
    }

    const stockItems = await prisma.stock.findMany({
      where: whereClause,
      orderBy: { itemName: 'asc' }
    });

    return NextResponse.json(stockItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const stockItem = await prisma.stock.create({
      data: {
        itemName: body.itemName,
        category: body.category,
        quantity: parseInt(body.quantity),
        unitPrice: parseFloat(body.unitPrice),
        minStockLevel: parseInt(body.minStockLevel),
        supplier: body.supplier,
        supplierContact: body.supplierContact,
        location: body.location,
        notes: body.notes,
        lastRestocked: new Date()
      }
    });

    return NextResponse.json(stockItem);
  } catch (error) {
    console.error('Error creating stock item:', error);
    return NextResponse.json(
      { error: 'Failed to create stock item' },
      { status: 500 }
    );
  }
}