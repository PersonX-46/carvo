import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all inventory items
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/inventory called");
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
    const category = searchParams.get("category") || "all";

    console.log("Search params:", { search, filter, category });

    // Build where clause
    const where: any = {};

    // Add search filter
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { supplier: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } }
      ];
    }

    // Add category filter
    if (category !== "all") {
      where.category = category;
    }

    // Add stock level filters
    if (filter === "low_stock") {
      where.quantity = {
        gt: 0, // Not zero
        lte: prisma.stock.fields.minStockLevel // Less than or equal to min stock level
      };
    } else if (filter === "out_of_stock") {
      where.quantity = 0;
    } else if (filter === "need_reorder") {
      where.quantity = {
        lte: prisma.stock.fields.minStockLevel
      };
    }

    // Fetch inventory items
    const stockItems = await prisma.stock.findMany({
      where,
      include: {
        movements: {
          take: 5,
          orderBy: { date: "desc" }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    console.log(`Found ${stockItems.length} inventory items`);

    // Transform data for response
    const transformedItems = stockItems.map(item => ({
      id: item.id,
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      minStockLevel: item.minStockLevel,
      supplier: item.supplier,
      supplierContact: item.supplierContact,
      location: item.location,
      notes: item.notes,
      lastRestocked: item.lastRestocked,
      updatedAt: item.updatedAt,
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
    }));

    return NextResponse.json(transformedItems);

  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch inventory",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST create new inventory item
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/inventory called");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    const { 
      itemName, 
      category, 
      quantity, 
      unitPrice, 
      minStockLevel,
      supplier,
      supplierContact,
      location,
      notes
    } = body;

    // Validate required fields
    if (!itemName) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // Parse numeric values
    const quantityValue = parseInt(quantity) || 0;
    const unitPriceValue = unitPrice ? parseFloat(unitPrice) : null;
    const minStockLevelValue = parseInt(minStockLevel) || 5;

    // Create new stock item
    const newItem = await prisma.stock.create({
      data: {
        itemName,
        category: category || null,
        quantity: quantityValue,
        unitPrice: unitPriceValue,
        minStockLevel: minStockLevelValue,
        supplier: supplier || null,
        supplierContact: supplierContact || null,
        location: location || null,
        notes: notes || null,
        lastRestocked: quantityValue > 0 ? new Date() : null,
      },
    });

    console.log(`Inventory item created: ${newItem.id}`);

    // If initial quantity > 0, create a stock movement
    if (quantityValue > 0) {
      await prisma.stockMovement.create({
        data: {
          stockItemId: newItem.id,
          type: "in",
          quantity: quantityValue,
          reason: "Initial stock",
          performedBy: "Admin",
          reference: "SYSTEM_INIT"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Inventory item created successfully",
      item: newItem
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { 
        error: "Failed to create inventory item",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}