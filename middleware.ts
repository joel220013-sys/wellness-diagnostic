import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public routes, static assets, and Next.js internal files
  if (
    pathname === '/' ||
    pathname === '/portal' ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/tests') ||
    pathname.startsWith('/packages') ||
    pathname.startsWith('/home-collection') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow unauthenticated authentication pages
  if (
    pathname === '/admin/login' ||
    pathname === '/driver/login' ||
    pathname === '/patient/login' ||
    pathname === '/patient/register' ||
    pathname === '/patient/forgot-password'
  ) {
    return NextResponse.next();
  }

  // 3. Inspect Authentication Session Cookies
  const roleCookie = request.cookies.get('wellness_auth_role')?.value;
  const sessionCookie = request.cookies.get('wellness_auth_session')?.value;

  let userRole: string | null = roleCookie || null;
  if (!userRole && sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      userRole = parsed?.role || null;
    } catch {
      userRole = null;
    }
  }

  // 4. Protect Admin Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!userRole) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'admin') {
      // User is logged in but lacks admin privileges
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return NextResponse.next();
  }

  // 5. Protect Driver / Phlebotomist Routes (/driver/*)
  if (pathname.startsWith('/driver')) {
    if (!userRole) {
      const loginUrl = new URL('/driver/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'driver' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
    return NextResponse.next();
  }

  // 6. Protect Patient Routes (/patient/*)
  if (pathname.startsWith('/patient')) {
    if (!userRole) {
      const loginUrl = new URL('/patient/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
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
