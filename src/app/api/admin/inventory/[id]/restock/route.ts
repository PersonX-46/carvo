import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    console.log(`POST /api/admin/inventory/${itemId}/restock called`);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Restock body:", body);
    
    const { 
      quantity, 
      unitPrice,
      supplier,
      notes,
      reference
    } = body;

    // Validate required fields
    if (!quantity || parseInt(quantity) <= 0) {
      return NextResponse.json(
        { error: "Valid quantity is required" },
        { status: 400 }
      );
    }

    const quantityValue = parseInt(quantity);
    const unitPriceValue = unitPrice ? parseFloat(unitPrice) : null;

    // Check if item exists
    const item = await prisma.stock.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Update stock quantity
      const updatedItem = await tx.stock.update({
        where: { id: itemId },
        data: {
          quantity: item.quantity + quantityValue,
          unitPrice: unitPriceValue || item.unitPrice,
          supplier: supplier || item.supplier,
          lastRestocked: new Date(),
          updatedAt: new Date()
        }
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          stockItemId: itemId,
          type: "in",
          quantity: quantityValue,
          reason: "Restock",
          performedBy: "Admin", // In real app, get from auth session
          reference: reference || "MANUAL_RESTOCK",
          notes: notes || null
        }
      });

      // Create finance record for the purchase
      const totalCost = quantityValue * (unitPriceValue || item.unitPrice || 0);
      if (totalCost > 0) {
        await tx.finance.create({
          data: {
            adminId: 1, // Default admin ID, get from session in real app
            amount: totalCost,
            category: "inventory_purchase",
            notes: `Restocked ${quantityValue} x ${item.itemName} at RM ${unitPriceValue || item.unitPrice || 0} per unit. ${notes ? `Notes: ${notes}` : ''}`
          }
        });
      }

      return { updatedItem, movement };
    });

    console.log(`Item ${itemId} restocked successfully with ${quantityValue} units`);

    return NextResponse.json({
      success: true,
      message: "Item restocked successfully",
      item: result.updatedItem,
      movement: result.movement
    });

  } catch (error) {
    console.error("Error restocking item:", error);
    return NextResponse.json(
      { 
        error: "Failed to restock item",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}