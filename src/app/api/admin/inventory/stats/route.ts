import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("GET /api/admin/inventory/stats called");

    // Get total items
    const totalItems = await prisma.stock.count();

    // Get low stock items (quantity > 0 and <= minStockLevel)
    const lowStockItems = await prisma.stock.count({
      where: {
        quantity: {
          gt: 0,
          lte: prisma.stock.fields.minStockLevel
        }
      }
    });

    // Get out of stock items
    const outOfStockItems = await prisma.stock.count({
      where: { quantity: 0 }
    });

    // Calculate total inventory value
    const allItems = await prisma.stock.findMany({
      select: {
        quantity: true,
        unitPrice: true
      }
    });

    const totalInventoryValue = allItems.reduce((total, item) => {
      return total + (item.quantity * (item.unitPrice || 0));
    }, 0);

    // Get categories with counts
    const categoriesRaw = await prisma.stock.groupBy({
      by: ['category'],
      where: {
        category: { not: null }
      },
      _count: {
        _all: true
      }
    });

    const categories = categoriesRaw.map(cat => ({
      name: cat.category || "Uncategorized",
      count: cat._count._all
    }));

    // Add uncategorized count
    const uncategorizedCount = await prisma.stock.count({
      where: { category: null }
    });
    
    if (uncategorizedCount > 0) {
      categories.push({
        name: "Uncategorized",
        count: uncategorizedCount
      });
    }

    const stats = {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalInventoryValue,
      categories
    };

    console.log("Inventory stats:", stats);
    
    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch inventory statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}