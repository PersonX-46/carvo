// src/app/api/customer/support/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { question, answer, type, metadata } = body;

    // Validate required fields
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save chat to database
    const chat = await prisma.aIChat.create({
      data: {
        customerId: user.id,
        question: question,
        answer: answer || null,
        type: type || 'user',
      },
    });

    return NextResponse.json({
      success: true,
      chat: chat
    });

  } catch (error) {
    console.error('Error saving AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to save chat' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'customer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get chat history
    const chats = await prisma.aIChat.findMany({
      where: {
        customerId: user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Last 50 messages
    });

    return NextResponse.json({
      success: true,
      chats: chats.reverse() // Return in chronological order
    });

  } catch (error) {
    console.error('Error fetching AI chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}