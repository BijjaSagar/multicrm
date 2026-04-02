import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  try {
    // Parse DATABASE_URL
    const url = new URL(databaseUrl)
    
    // AWS RDS MySQL passwords often contain special characters like '!'
    // We must ensure the password is correctly encoded for the driver
    const password = decodeURIComponent(url.password)
    
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: password,
      database: url.pathname.slice(1),
      connectionLimit: 10,
      idleTimeout: 30000,
      connectTimeout: 10000, // 10 seconds for cross-cloud connection
    })
    
    console.log('Prisma RDS Client initialized for host:', url.hostname)
    return new PrismaClient({ adapter })
  } catch (error) {
    console.error('Failed to initialize Prisma RDS Client:', error)
    throw error
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
