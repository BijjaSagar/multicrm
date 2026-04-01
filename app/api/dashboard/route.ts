import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user

    // Parallel fetches for dashboard stats
    const [
      leadCount,
      contactCount,
      openTickets,
      dealStats,
      recentLeads,
      recentDeals,
      pipelineStages,
      ticketStats,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.contact.count({ where: { tenantId, status: 'ACTIVE' } }),
      prisma.ticket.count({ where: { tenantId, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
      prisma.deal.aggregate({
        where: { tenantId },
        _sum: { value: true },
        _count: { id: true },
      }),
      prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { assignedTo: { select: { firstName: true, lastName: true } } },
      }),
      prisma.deal.findMany({
        where: { tenantId },
        orderBy: { value: 'desc' },
        take: 6,
        include: {
          stage: { select: { name: true, color: true } },
          contact: { select: { firstName: true, lastName: true, company: true } },
          assignedTo: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.pipelineStage.findMany({
        where: { pipeline: { tenantId, isDefault: true } },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { deals: true } },
          deals: { where: { status: 'OPEN' }, select: { value: true } },
        },
      }),
      prisma.ticket.groupBy({
        by: ['priority'],
        where: { tenantId, status: { notIn: ['CLOSED', 'RESOLVED'] } },
        _count: { id: true },
      }),
      prisma.deal.aggregate({
        where: {
          tenantId,
          status: 'WON',
          actualCloseDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { value: true },
        _count: { id: true },
      }),
    ])

    // Calculate win rate
    const wonDeals = await prisma.deal.count({ where: { tenantId, status: 'WON' } })
    const totalClosedDeals = await prisma.deal.count({ where: { tenantId, status: { in: ['WON', 'LOST'] } } })
    const winRate = totalClosedDeals > 0 ? Math.round((wonDeals / totalClosedDeals) * 100) : 0

    return success({
      kpis: {
        totalLeads: leadCount,
        activeContacts: contactCount,
        openTickets,
        totalDeals: dealStats._count.id,
        totalPipelineValue: dealStats._sum.value,
        monthlyRevenue: monthlyRevenue._sum.value || 0,
        wonDealsThisMonth: monthlyRevenue._count.id,
        winRate,
      },
      recentLeads,
      topDeals: recentDeals,
      pipeline: pipelineStages.map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        dealCount: stage._count.deals,
        totalValue: stage.deals.reduce((sum: number, d: any) => sum + Number(d.value), 0),
      })),
      ticketsByPriority: ticketStats,
    })
  } catch (error) {
    return serverError(error)
  }
}
