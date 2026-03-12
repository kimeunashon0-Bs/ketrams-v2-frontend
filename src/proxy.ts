// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes – no auth required
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/apply-institution') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/set-password');

  // Protected routes – require valid token
  const isProtectedRoute =
    pathname.startsWith('/student') ||
    pathname.startsWith('/institution') ||
    pathname.startsWith('/subcounty') ||
    pathname.startsWith('/admin');

  const token = request.cookies.get('token')?.value;

  // 1. No token + protected route → redirect to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Token exists + auth page → redirect to appropriate dashboard
  if (token && isAuthPage) {
    // Optionally decode token to get user role
    // For now, default to student dashboard
    const dashboardUrl = new URL('/student/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. For protected routes, apply aggressive no‑cache headers
  const response = NextResponse.next();
  if (isProtectedRoute) {
    // Prevent browser and proxy caching
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }
  return response;
}

export const config = {
  matcher: [
    '/student/:path*',
    '/institution/:path*',
    '/subcounty/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/apply-institution',
    '/forgot-password',
    '/verify-otp',
    '/set-password',
  ],
};