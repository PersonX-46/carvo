import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    let userData = null;

    if (user.type === 'customer') {
      userData = await prisma.customer.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true }
      });
    } else if (user.type === 'worker') {
      userData = await prisma.worker.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true }
      });
    } else if (user.type === 'admin') {
      userData = await prisma.admin.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true }
      });
    }

    return NextResponse.json({
      authenticated: true,
      type: user.type,
      customer: user.type === 'customer' ? userData : null,
      worker: user.type === 'worker' ? userData : null,
      admin: user.type === 'admin' ? userData : null
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}