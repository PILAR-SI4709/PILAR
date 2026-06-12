import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('pilar_token')?.value;
  const { pathname } = request.nextUrl;

  // Hanya proteksi halaman yang butuh login
  const protectedRoutes = ['/dashboard', '/profile', '/sertifikat', '/settings'];
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/sertifikat/:path*',
    '/settings/:path*',
  ],
};