import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoutes = ['/student', '/institution', '/subcounty', '/admin'];

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export const config = {
  matcher: ['/student/:path*', '/institution/:path*', '/subcounty/:path*', '/admin/:path*'],
};