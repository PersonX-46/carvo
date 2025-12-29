import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.type !== 'worker') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get worker details
    const worker = await prisma.worker.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        phone: true,
        status: true,
        specialization: true,
        salary: true,
        hireDate: true,
        totalServices: true,
        currentWorkload: true,
        rating: true,
        createdAt: true,
      }
    });

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ worker });
  } catch (error) {
    console.error('Worker auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}