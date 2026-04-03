import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { success, badRequest, serverError } from '@/lib/api-utils'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 1. Validate inputs
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return badRequest(result.error.issues[0].message)
    }

    const { firstName, lastName, email, password, companyName } = result.data

    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email } }
    })

    if (existingUser) {
      return badRequest('An account with this email already exists')
    }

    // 3. Create Tenant, Branch, and User in a transaction
    const hashedPassword = await bcrypt.hash(password, 12)
    const tenantSlug = slugify(companyName)

    // Check if slug exists, if so append random
    let finalSlug = tenantSlug
    const slugExists = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (slugExists) {
        finalSlug = `${tenantSlug}-${Math.random().toString(36).substring(2, 7)}`
    }

    const newUser = await prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug: finalSlug,
          plan: 'STARTER',
          status: 'TRIAL'
        }
      })

      // Create main Branch
      const branch = await tx.branch.create({
        data: {
          tenantId: tenant.id,
          name: 'Headquarters',
          code: 'HQ',
          isHeadquarters: true,
          status: 'ACTIVE'
        }
      })

      // Create Admin User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: 'TENANT_ADMIN',
          status: 'ACTIVE'
        }
      })

      return user
    })

    return success({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    }, 201)

  } catch (error) {
    return serverError(error)
  }
}
