import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '../../../../../../lib/auth';

const prisma = new PrismaClient();

// GET AI chat history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const chats = await prisma.aIChat.findMany({
      where: { customerId: user.id },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ chats });

  } catch (error) {
    console.error('Get AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// SAVE AI chat message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { question, answer, type } = await request.json();

    const chat = await prisma.aIChat.create({
      data: {
        customerId: user.id,
        question,
        answer: answer || null,
        type: type || 'user',
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      message: 'Chat saved successfully',
      chat
    }, { status: 201 });

  } catch (error) {
    console.error('Save AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}