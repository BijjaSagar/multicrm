if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'd5beb04276614e1b26979f26b7b2c5a4810f723e30fa9cb9dab9196733a94c6c';
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
}

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      tenantId: string
      branchId: string | null
      avatar: string | null
      tenantName: string
      tenantSlug: string
      enabledModules: string[]
      tenantSettings?: any
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
    branchId: string | null
    avatar: string | null
    tenantName: string
    tenantSlug: string
    enabledModules: string[]
    tenantSettings?: any
  }

  interface JWT {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
    branchId: string | null
    avatar: string | null
    tenantName: string
    tenantSlug: string
    enabledModules: string[]
    tenantSettings?: any
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'd5beb04276614e1b26979f26b7b2c5a4810f723e30fa9cb9dab9196733a94c6c',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        // Lazy load prisma and bcrypt to keep middleware clean
        const prisma = (await import('@/lib/prisma')).default
        const bcrypt = await import('bcryptjs')

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
            status: 'ACTIVE',
          },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                settings: true,
              },
            },
          },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
          throw new Error('Your organization account is suspended')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          branchId: user.branchId,
          avatar: user.avatar,
          tenantName: user.tenant.name,
          tenantSlug: user.tenant.slug,
          tenantSettings: user.tenant.settings,
          enabledModules: [], 
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (user) {
        try {
          const prisma = (await import('@/lib/prisma')).default
          // Log automated attendance start
          await prisma.attendance.create({
            data: {
              userId: user.id,
              tenantId: user.tenantId,
              branchId: user.branchId,
              status: 'ACTIVE',
              checkIn: new Date(),
              metadata: {
                event: 'LOGIN_AUTO_CHECKIN',
              },
            },
          })
          
          // Log to audit logs as well
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              tenantId: user.tenantId,
              action: 'LOGIN',
              entity: 'USER',
              entityId: user.id,
              changes: {
                message: `User logged in and attendance started.`,
              },
            },
          })
        } catch (error) {
          console.error('Attendance track error:', error)
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email!
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.tenantId = user.tenantId
        token.branchId = user.branchId
        token.avatar = user.avatar
        token.tenantName = user.tenantName
        token.tenantSlug = user.tenantSlug
        token.tenantSettings = user.tenantSettings
      }

      // Fetch enabled modules and settings for the tenant on initial login OR when session is updated
      if (user || trigger === 'update') {
        const tenantId = user?.tenantId || (token.tenantId as string)
        if (tenantId) {
          const prisma = (await import('@/lib/prisma')).default

          // Fetch modules independently — failure here must not block settings refresh
          try {
            const modules = await (prisma as any).tenantModule.findMany({
              where: {
                tenantId,
                isEnabled: true
              },
              select: { moduleKey: true }
            })
            token.enabledModules = modules.map((m: { moduleKey: string }) => m.moduleKey)
          } catch (error) {
            console.error('Error fetching tenant modules:', error)
            if (!token.enabledModules) token.enabledModules = []
          }

          // Always fetch fresh tenant settings — kept separate so a module fetch failure
          // never prevents onboardingCompleted (or other setting changes) from being reflected.
          try {
            const tenant = await prisma.tenant.findUnique({
              where: { id: tenantId },
              select: { settings: true }
            })
            token.tenantSettings = tenant?.settings || null
          } catch (error) {
            console.error('Error fetching tenant settings:', error)
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as string,
        tenantId: token.tenantId as string,
        branchId: token.branchId as string | null,
        avatar: token.avatar as string | null,
        tenantName: token.tenantName as string,
        tenantSlug: token.tenantSlug as string,
        enabledModules: (token.enabledModules as string[]) || [],
        tenantSettings: token.tenantSettings as any,
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnAuth = nextUrl.pathname.startsWith('/auth')

      if (isOnDashboard && !isLoggedIn) {
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
  trustHost: true,
}

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)
