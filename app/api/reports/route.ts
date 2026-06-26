import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { getRBACWhere } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
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
      const [byStage, bySource, topRepsRaw, recentDeals] = await Promise.all([
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
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.user.findMany({
          where: { tenantId },
          select: {
            firstName: true,
            lastName: true,
            assignedDeals: {
              where: { status: 'WON', tenantId },
              select: { value: true },
            },
          },
        }),
        prisma.deal.findMany({
          where: baseWhere,
          select: { createdAt: true, value: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        }),
      ])

      // Build monthly trend from raw deals
      const monthlyMap: Record<string, { month: string; count: number; total: number }> = {}
      recentDeals.forEach((d: any) => {
        const month = new Date(d.createdAt).toISOString().slice(0, 7)
        if (!monthlyMap[month]) monthlyMap[month] = { month, count: 0, total: 0 }
        monthlyMap[month].count++
        monthlyMap[month].total += Number(d.value || 0)
      })
      const monthly = Object.values(monthlyMap)
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12)

      // Build top reps
      const topReps = topRepsRaw
        .map((u: any) => ({
          firstName: u.firstName,
          lastName: u.lastName,
          dealCount: u.assignedDeals.length,
          totalValue: u.assignedDeals.reduce((s: number, d: any) => s + Number(d.value || 0), 0),
        }))
        .filter((r: any) => r.dealCount > 0)
        .sort((a: any, b: any) => b.totalValue - a.totalValue)
        .slice(0, 10)

      return success({ monthly, byStage, bySource, topReps })
    }

    if (type === 'support') {
      const [byStatus, byPriority, resolvedTickets, openTickets] = await Promise.all([
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
        prisma.ticket.findMany({
          where: { ...baseWhere, resolvedAt: { not: null } },
          select: { createdAt: true, resolvedAt: true },
          take: 200,
        }),
        prisma.ticket.count({
          where: { ...baseWhere, status: { notIn: ['CLOSED', 'RESOLVED'] } },
        }),
      ])

      // Avg resolution in hours (computed in JS, no raw SQL)
      const avgHours = resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum: number, t: any) => {
            const hrs = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000
            return sum + hrs
          }, 0) / resolvedTickets.length
        : null

      const avgResolution = avgHours !== null ? [{ avgHours }] : []

      return success({ byStatus, byPriority, avgResolution, openTickets })
    }

    return success({ message: 'Unknown report type' })
  } catch (error) {
    return serverError(error)
  }
}
