import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. IGNORE API ROUTES
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('favicon.ico')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  // 2. ADMIN GUARD
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // 3. USER GUARD (Protect Dashboard)
  const isProtected = [
    '/dashboard', '/deposit', '/withdrawal', '/trade', '/settings'
  ].some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 4. [DISABLED] LOGIN GUARD
  // We commented this out. If a user goes to /auth/login, we LET THEM.
  // This prevents the infinite "Logout -> Dashboard" loop.
  /* const isLoginPage = pathname === '/auth/login' || pathname === '/login' || pathname === '/admin/login';
  if (isLoginPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith('/admin') ? '/admin/users' : '/dashboard';
    return NextResponse.redirect(url);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};