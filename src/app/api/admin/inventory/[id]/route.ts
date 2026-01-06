import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    console.log(`GET /api/admin/inventory/${itemId} called`);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    // Get item with movements
    const item = await prisma.stock.findUnique({
      where: { id: itemId },
      include: {
        movements: {
          orderBy: { date: "desc" },
          take: 20
        }
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    console.log(`Found item: ${item.itemName}`);

    // Transform data
    const responseData = {
      ...item,
      movements: item.movements.map(movement => ({
        id: movement.id,
        stockItemId: movement.stockItemId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        date: movement.date,
        performedBy: movement.performedBy,
        reference: movement.reference,
        createdAt: movement.createdAt
      }))
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch inventory item",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// PUT update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    console.log(`PUT /api/admin/inventory/${itemId} called`);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Update body:", body);
    
    const { 
      itemName, 
      category, 
      unitPrice, 
      minStockLevel,
      supplier,
      supplierContact,
      location,
      notes
    } = body;

    // Check if item exists
    const existingItem = await prisma.stock.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Update item data
    const updateData: any = {};
    
    if (itemName) updateData.itemName = itemName;
    if (category !== undefined) updateData.category = category || null;
    if (unitPrice !== undefined) {
      updateData.unitPrice = unitPrice ? parseFloat(unitPrice) : null;
    }
    if (minStockLevel !== undefined) {
      updateData.minStockLevel = parseInt(minStockLevel) || 5;
    }
    if (supplier !== undefined) updateData.supplier = supplier || null;
    if (supplierContact !== undefined) updateData.supplierContact = supplierContact || null;
    if (location !== undefined) updateData.location = location || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const updatedItem = await prisma.stock.update({
      where: { id: itemId },
      data: updateData
    });

    console.log(`Item ${itemId} updated successfully`);

    return NextResponse.json({
      success: true,
      message: "Inventory item updated successfully",
      item: updatedItem
    });

  } catch (error) {
    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { 
        error: "Failed to update inventory item",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const itemId = parseInt(resolvedParams.id);
    console.log(`DELETE /api/admin/inventory/${itemId} called`);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }

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

    // Check if item has any stock movements
    const hasMovements = await prisma.stockMovement.count({
      where: { stockItemId: itemId }
    });

    if (hasMovements > 0) {
      // Delete movements first (cascade should handle this, but being explicit)
      await prisma.stockMovement.deleteMany({
        where: { stockItemId: itemId }
      });
    }

    // Delete the item
    await prisma.stock.delete({
      where: { id: itemId }
    });

    console.log(`Item ${itemId} deleted successfully`);

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete inventory item",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}