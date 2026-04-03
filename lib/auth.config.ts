import type { NextAuthConfig } from "next-auth"

export const authConfig = {
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
        return Response.redirect(new URL('/dashboard', nextUrl))
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
