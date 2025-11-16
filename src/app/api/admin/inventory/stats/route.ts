import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get total items count
    const totalItems = await prisma.stock.count();

    // Get low stock items (quantity <= minStockLevel but > 0)
    const lowStockItems = await prisma.stock.count({
      where: {
        quantity: {
          lte: prisma.stock.fields.minStockLevel,
          gt: 0
        }
      }
    });

    // Get out of stock items
    const outOfStockItems = await prisma.stock.count({
      where: { quantity: 0 }
    });

    // Get total inventory value
    const inventoryValue = await prisma.stock.aggregate({
      _sum: {
        quantity: true,
      }
    });

    // Calculate total value manually since Prisma doesn't support computed fields
    const allItems = await prisma.stock.findMany({
      select: {
        quantity: true,
        unitPrice: true
      }
    });

    const totalInventoryValue = allItems.reduce((sum, item) => {
      return sum + (item.quantity * (item.unitPrice || 0));
    }, 0);

    // Get categories
    const categories = await prisma.stock.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    const stats = {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
      categories: categories.map(cat => ({
        name: cat.category || 'Uncategorized',
        count: cat._count.id
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}