import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { getRBACWhere } from '@/lib/rbac'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId, role, branchId } = session.user
    const rbacWhere = getRBACWhere(session.user)
    const baseWhere: any = { ...rbacWhere, tenantId }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'overview'

    if (type === 'overview') {
      const [leads, contacts, deals, tickets, wonDeals, lostDeals] = await Promise.all([
        prisma.lead.count({ where: baseWhere }),
        prisma.contact.count({ where: baseWhere }),
        prisma.deal.count({ where: baseWhere }),
        prisma.ticket.count({ where: baseWhere }),
        prisma.deal.count({ where: { ...baseWhere, status: 'WON' } }),
        prisma.deal.count({ where: { ...baseWhere, status: 'LOST' } }),
      ])
      return success({ leads, contacts, deals, tickets, wonDeals, lostDeals })
    }

    if (type === 'sales') {
      const branchFilter = (role === 'SALESPERSON' && branchId) ? Prisma.sql`AND branchId = ${branchId}` : Prisma.empty
      
      const [monthly, byStage, bySource, topReps] = await Promise.all([
        prisma.$queryRaw`
          SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count, COALESCE(SUM(value), 0) as total
          FROM Deal WHERE tenantId = ${tenantId} ${branchFilter}
          GROUP BY month ORDER BY month DESC LIMIT 12
        `,
        prisma.deal.groupBy({
          by: ['status'],
          where: baseWhere,
          _count: { id: true },
          _sum: { value: true },
        }),
        prisma.lead.groupBy({
          by: ['source'],
          where: baseWhere,
          _count: { id: true },
        }),
        prisma.$queryRaw`
          SELECT u.firstName, u.lastName, COUNT(d.id) as dealCount, COALESCE(SUM(d.value), 0) as totalValue
          FROM User u LEFT JOIN Deal d ON d.assignedToId = u.id AND d.status = 'WON'
          WHERE u.tenantId = ${tenantId} ${branchFilter} AND d.id IS NOT NULL
          GROUP BY u.id, u.firstName, u.lastName ORDER BY totalValue DESC LIMIT 10
        `,
      ])
      return success({ monthly, byStage, bySource, topReps })
    }

    if (type === 'support') {
      const [byStatus, byPriority, avgResolution, openTickets] = await Promise.all([
        prisma.ticket.groupBy({
          by: ['status'],
          where: baseWhere,
          _count: { id: true },
        }),
        prisma.ticket.groupBy({
          by: ['priority'],
          where: baseWhere,
          _count: { id: true },
        }),
        prisma.$queryRaw`
          SELECT AVG(TIMESTAMPDIFF(HOUR, createdAt, resolvedAt)) as avgHours
          FROM Ticket WHERE tenantId = ${tenantId} 
          ${(role === 'SALESPERSON' && branchId) ? Prisma.sql`AND branchId = ${branchId}` : Prisma.empty}
          AND resolvedAt IS NOT NULL
        `,
        prisma.ticket.count({ where: { ...baseWhere, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
      ])
      return success({ byStatus, byPriority, avgResolution, openTickets })
    }

    return success({ message: 'Unknown report type' })
  } catch (error) {
    return serverError(error)
  }
}
