import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Next.js Middleware runs in Edge runtime where Node.js 'net' is not available.
  // We MUST NOT initialize the MariaDB driver here.
  if (process.env.NEXT_RUNTIME === 'edge') {
    return new Proxy({} as any, {
      get() {
        throw new Error('Prisma cannot be used in the Edge runtime (Middleware).')
      }
    }) as unknown as PrismaClient
  }
  
  try {
    // Parse DATABASE_URL
    const url = new URL(databaseUrl)
    
    // AWS RDS MySQL passwords often contain special characters like '!'
    // We must ensure the password is correctly encoded for the driver
    const password = decodeURIComponent(url.password)
    
    // Use dynamic require to prevent MariaDB driver from being bundled for Edge
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: password,
      database: url.pathname.slice(1),
      connectionLimit: 10,
      idleTimeout: 30000,
      connectTimeout: 10000, 
    })
    
    console.log('Prisma RDS Client initialized for host:', url.hostname)
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to initialize Prisma RDS Client:', error)
    throw error
  }
}

function getPrismaInstance(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma
  globalForPrisma.prisma = createPrismaClient()
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    // This Proxy allows us to defer initialization of the full Prisma client
    // until its properties are actually accessed.
    const instance = getPrismaInstance()
    const value = Reflect.get(instance, prop, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

export default prisma
