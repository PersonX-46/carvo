import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/customer', '/customer/dashboard', '/customer/bookings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const user = verifyToken(token);
    if (!user || user.type !== 'customer') {
      // Redirect to login if invalid token or wrong user type
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If accessing login page while already authenticated, redirect to dashboard
  if (pathname === '/login' && token) {
    const user = verifyToken(token);
    if (user && user.type === 'customer') {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/login',
  ],
};