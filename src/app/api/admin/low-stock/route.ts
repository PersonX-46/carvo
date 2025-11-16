import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const lowStockItems = await prisma.stock.findMany({
      where: {
        quantity: {
          lte: prisma.stock.fields.minStockLevel
        }
      },
      orderBy: {
        quantity: 'asc'
      },
      take: 10
    });

    const formattedItems = lowStockItems.map(item => ({
      id: item.id,
      itemName: item.itemName,
      category: item.category || 'Uncategorized',
      quantity: item.quantity,
      unitPrice: item.unitPrice || 0,
      minStockLevel: item.minStockLevel,
      supplier: item.supplier
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}