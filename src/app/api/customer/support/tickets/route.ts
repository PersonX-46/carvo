import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

// GET all support tickets for current customer
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { customerId: user.id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });

  } catch (error) {
    console.error('Get support tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE new support ticket
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subject, category, priority, description } = await request.json();

    const ticket = await prisma.supportTicket.create({
      data: {
        customerId: user.id,
        subject,
        category,
        priority,
        description,
        status: 'open',
        messages: {
          create: [{
            sender: 'customer',
            message: description,
            timestamp: new Date()
          }]
        }
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json({
      message: 'Support ticket created successfully',
      ticket
    }, { status: 201 });

  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}