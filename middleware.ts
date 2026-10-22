import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes, static assets, and auth pages pass through
  if (
    pathname === '/' ||
    pathname === '/portal' ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/tests') ||
    pathname.startsWith('/packages') ||
    pathname.startsWith('/home-collection') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/patient/login') ||
    pathname.startsWith('/patient/register') ||
    pathname.startsWith('/patient/forgot-password') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/driver/login') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
