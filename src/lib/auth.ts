import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'chengmeng-service-secret-key';

export interface User {
  id: number;
  email: string;
  name: string;
  type: 'customer' | 'worker' | 'admin';
  phone?: string;
  [key: string]: any;
}

// Token functions
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}

// Password functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Cookie functions
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

// User functions
export async function getCurrentUser(): Promise<User | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

export function getCurrentUserFromRequest(request: NextRequest): User | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Simple verification functions (no async, just check type)
export function verifyUserType(user: User | null, type: 'customer' | 'worker' | 'admin'): boolean {
  return user !== null && user.type === type;
}

export function verifyCustomerFromRequest(request: NextRequest): User | null {
  const user = getCurrentUserFromRequest(request);
  return verifyUserType(user, 'customer') ? user : null;
}

export function verifyWorkerFromRequest(request: NextRequest): User | null {
  const user = getCurrentUserFromRequest(request);
  return verifyUserType(user, 'worker') ? user : null;
}

export function verifyAdminFromRequest(request: NextRequest): User | null {
  const user = getCurrentUserFromRequest(request);
  return verifyUserType(user, 'admin') ? user : null;
}

// Login helpers
export async function loginUser(type: 'customer' | 'worker' | 'admin', userData: any): Promise<User | null> {
  const user: User = {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    type: type,
    phone: userData.phone,
  };
  
  const token = generateToken(user);
  await setAuthCookie(token);
  
  return user;
}

// Logout
export async function logout() {
  await removeAuthCookie();
}