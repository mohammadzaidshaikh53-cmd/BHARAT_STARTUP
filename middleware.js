// middleware.js — Server-side auth guard for protected routes
// Uses @supabase/supabase-js cookie inspection (compatible with current stack)
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/chat',
  '/add-product',
  '/add-request',
  '/profile',
  '/rfq/create',
  '/events/create',
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/callback',
  '/reset-password',
  '/marketplace',
  '/products',
  '/suppliers',
  '/rfq',
  '/events',
  '/community',
  '/blog',
  '/discussions',
  '/ideas',
  '/qa',
  '/biographies',
  '/motivation',
  '/organizations',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookies
  // Supabase stores session in cookies with specific naming patterns
  const cookies = request.cookies;
  const hasAuthCookie =
    cookies.getAll().some((c) => c.name.includes('auth-token') || c.name.includes('sb-')) &&
    cookies.getAll().some((c) => c.value && c.value.length > 20);

  if (!hasAuthCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/chat/:path*',
    '/add-product/:path*',
    '/add-request/:path*',
    '/profile/:path*',
    '/rfq/create/:path*',
    '/events/create/:path*',
  ],
};
