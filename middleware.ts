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
  '/dashboard/attendance': 'HR_RECRUITMENT',
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnAuth = pathname.startsWith('/auth')

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/auth/login', req.nextUrl))
  }

  if (isOnAuth && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Vertical Module Guard
  if (isLoggedIn && isOnDashboard) {
    const requiredModule = Object.entries(MODULE_ROUTES).find(([route]) => 
      pathname.startsWith(route)
    )?.[1]

    if (requiredModule) {
      const enabledModules = (req.auth?.user as any)?.enabledModules || []
      if (!enabledModules.includes(requiredModule)) {
        return Response.redirect(new URL('/dashboard?error=module_required', req.nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
