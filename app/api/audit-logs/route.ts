import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get('page') || '1')
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 100)
    const entity = searchParams.get('entity')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = { tenantId }
    if (entity) where.entity = entity
    if (action) where.action = action
    if (userId) where.userId = userId

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return success({ logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return serverError(error)
  }
}
