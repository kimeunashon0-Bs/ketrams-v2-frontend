import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/apply-institution') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/verify-otp') ||
    pathname.startsWith('/set-password');

  const isProtectedRoute =
    pathname.startsWith('/student') ||
    pathname.startsWith('/institution') ||
    pathname.startsWith('/treasury') ||
    pathname.startsWith('/ministry');

  const token = request.cookies.get('token')?.value;

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    const userCookie = request.cookies.get('user')?.value;
    let role: string | undefined;

    if (userCookie) {
      try {
        role = JSON.parse(userCookie)?.role;
      } catch (error) {
        role = undefined;
      }
    }

    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : '';
    const dashboardMap: Record<string, string> = {
      STUDENT: '/student/dashboard',
      INSTITUTION: '/institution/dashboard',
      TREASURY: '/treasury/dashboard',
      MINISTRY_OFFICER: '/ministry/dashboard',
      MINISTRY: '/ministry/dashboard',
      ADMIN: '/ministry/dashboard',
    };

    const dashboardPath = dashboardMap[normalizedRole] ?? '/student/dashboard';
    const dashboardUrl = new URL(dashboardPath, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname.startsWith('/admin/')) {
    const newPath = pathname.replace('/admin/', '/ministry/');
    const redirectUrl = new URL(newPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.next();
  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
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
    '/treasury/:path*',
    '/ministry/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/apply-institution',
    '/forgot-password',
    '/verify-otp',
    '/set-password',
  ],
};