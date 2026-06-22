if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'd5beb04276614e1b26979f26b7b2c5a4810f723e30fa9cb9dab9196733a94c6c';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

import { NextResponse } from "next/server"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'd5beb04276614e1b26979f26b7b2c5a4810f723e30fa9cb9dab9196733a94c6c',
  providers: [], // Providers are added in the full auth.ts
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname.startsWith('/auth')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      }
      
      if (isOnAuth && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
      }
      
      return true
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
} satisfies NextAuthConfig;
