import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'carvo-secret-key';

export interface User {
  id: number;
  email: string;
  name: string;
  type: string;
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}