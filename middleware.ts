if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'd5beb04276614e1b26979f26b7b2c5a4810f723e30fa9cb9dab9196733a94c6c';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const MODULE_ROUTES: Record<string, string> = {
  '/dashboard/students': 'STUDENT_MANAGEMENT',
  '/dashboard/patients': 'PATIENT_MANAGEMENT',
  '/dashboard/properties': 'PROPERTY_MANAGEMENT',
  '/dashboard/subscribers': 'SUBSCRIBER_MANAGEMENT',
  '/dashboard/inbox': 'COMMUNICATION_HUB',
  '/dashboard/campaigns': 'CAMPAIGN_MANAGER',
  '/dashboard/knowledge-base': 'KNOWLEDGE_BASE',
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnAuth = pathname.startsWith('/auth')

  let response: NextResponse

  if (isOnDashboard && !isLoggedIn) {
    response = NextResponse.redirect(new URL('/auth/login', req.nextUrl))
  } else if (isOnAuth && isLoggedIn) {
    response = NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  } else if (isLoggedIn && isOnDashboard) {
    const requiredModule = Object.entries(MODULE_ROUTES).find(([route]) => 
      pathname.startsWith(route)
    )?.[1]

    if (requiredModule) {
      const enabledModules = (req.auth?.user as any)?.enabledModules || []
      if (!enabledModules.includes(requiredModule)) {
        response = NextResponse.redirect(new URL('/dashboard?error=module_required', req.nextUrl))
      } else {
        response = NextResponse.next()
      }
    } else {
      response = NextResponse.next()
    }
  } else {
    response = NextResponse.next()
  }

  // Force disable caching for all requests handled by middleware (dashboard, auth pages)
  // This prevents LiteSpeed Cache (Hostinger) from caching RSC JSON payloads and serving them for HTML pages.
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
})

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
