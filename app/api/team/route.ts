import { getAuthSession, unauthorized, success, serverError, parseSearchParams } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, role, branchId } = session.user
    const params = parseSearchParams(request.url)
    const { search } = params

    // Expand role access
    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER', 'SUPPORT_MANAGER']
    if (!allowedRoles.includes(role)) {
      return unauthorized('You do not have permission to view team members.')
    }

    const where: any = { tenantId }
    
    // If branch manager, only show their branch
    if (role === 'BRANCH_MANAGER' && branchId) {
      where.branchId = branchId
    }

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
    console.error('TEAM_FETCH_ERROR:', error)
    return serverError(error)
  }
}
