import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const itemId = parseInt(params.id);

    const stockItem = await prisma.stock.findUnique({
      where: { id: itemId },
      include: {
        movements: {
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    });

    if (!stockItem) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stockItem);
  } catch (error) {
    console.error('Error fetching stock item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const itemId = parseInt(params.id);
    const body = await request.json();

    const updatedItem = await prisma.stock.update({
      where: { id: itemId },
      data: {
        itemName: body.itemName,
        category: body.category,
        quantity: parseInt(body.quantity),
        unitPrice: parseFloat(body.unitPrice),
        minStockLevel: parseInt(body.minStockLevel),
        supplier: body.supplier,
        supplierContact: body.supplierContact,
        location: body.location,
        notes: body.notes
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating stock item:', error);
    return NextResponse.json(
      { error: 'Failed to update stock item' },
      { status: 500 }
    );
  }
}