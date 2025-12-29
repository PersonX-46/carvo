import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'carvo-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt:', { email });

    // Find worker by email
    const worker = await prisma.worker.findUnique({
      where: { email },
    });

    if (!worker) {
      console.log('Worker not found for email:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Found worker:', { 
      id: worker.id, 
      email: worker.email
    });

    // Use bcrypt to compare the password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, worker.password);

    if (!isPasswordValid) {
      console.log('Password mismatch for worker:', worker.email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if worker is active
    if (worker.status !== 'active') {
      return NextResponse.json(
        { error: 'Your account is not active. Please contact administrator.' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: worker.id, 
        email: worker.email, 
        name: worker.name, 
        type: 'worker' 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Return worker info (without password)
    const { password: _, ...workerWithoutPassword } = worker;

    console.log('Login successful for worker:', worker.email);

    return NextResponse.json({
      success: true,
      worker: workerWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Worker login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}