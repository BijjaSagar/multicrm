import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth session cookie (next-auth.session-token or __Secure-next-auth.session-token)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value

  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnAuth = pathname.startsWith('/auth')

  if (isOnDashboard && !sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isOnAuth && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
