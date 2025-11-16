import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const itemId = parseInt(params.id);
    const body = await request.json();

    // Get current stock item
    const stockItem = await prisma.stock.findUnique({
      where: { id: itemId }
    });

    if (!stockItem) {
      return NextResponse.json(
        { error: 'Stock item not found' },
        { status: 404 }
      );
    }

    const newQuantity = stockItem.quantity + parseInt(body.quantity);
    const newUnitPrice = parseFloat(body.unitPrice);

    // Update stock item
    const updatedItem = await prisma.stock.update({
      where: { id: itemId },
      data: {
        quantity: newQuantity,
        unitPrice: newUnitPrice,
        lastRestocked: new Date()
      }
    });

    // Create stock movement record
    const stockMovement = await prisma.stockMovement.create({
      data: {
        stockItemId: itemId,
        type: 'in',
        quantity: parseInt(body.quantity),
        reason: body.notes || 'Restock',
        performedBy: 'Admin User', // You can get this from auth
        reference: body.reference
      }
    });

    return NextResponse.json({
      item: updatedItem,
      movement: stockMovement
    });
  } catch (error) {
    console.error('Error restocking item:', error);
    return NextResponse.json(
      { error: 'Failed to restock item' },
      { status: 500 }
    );
  }
}