import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// POST /api/team/invite — Create / invite a new team member
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, role } = session.user

    // Only admins and managers can invite
    const allowed = ['SUPER_ADMIN', 'TENANT_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER', 'SUPPORT_MANAGER']
    if (!allowed.includes(role)) {
      return unauthorized('You do not have permission to invite members.')
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, role: memberRole, branchId } = body

    if (!firstName || !lastName || !email) {
      return badRequest('First name, last name, and email are required')
    }

    // Check if email already exists in tenant
    const existing = await prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    })
    if (existing) {
      return badRequest('A user with this email already exists in your organization')
    }

    // Generate a temporary password (user should change on first login)
    const tempPassword = `Welcome@${Math.random().toString(36).slice(-6)}`
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        branchId: branchId || null,
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: memberRole || 'SALES_REP',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    logAudit({
      action: 'CREATE',
      entity: 'User',
      entityId: newUser.id,
      changes: { firstName, lastName, email, role: memberRole },
    })

    return success({ user: newUser, tempPassword }, 201)
  } catch (error) {
    console.error('TEAM_INVITE_ERROR:', error)
    return serverError(error)
  }
}
