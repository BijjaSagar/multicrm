import { getAuthSession, unauthorized, success, serverError, parseSearchParams } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, role } = session.user
    const params = parseSearchParams(request.url)
    const { search } = params

    if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER'].includes(role)) {
      return unauthorized()
    }

    const where: Record<string, unknown> = { tenantId }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
        _count: {
          select: {
            assignedLeads: true,
            assignedDeals: true,
            assignedTickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return success({ users })
  } catch (error) {
    return serverError(error)
  }
}
