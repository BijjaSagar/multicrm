import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const where: Record<string, unknown> = { tenantId: undefined }
    // Activities are tenant-scoped via the user
    const userIds = await prisma.user.findMany({ where: { tenantId }, select: { id: true } })
    const ids = userIds.map(u => u.id)

    const dateFilter: Record<string, unknown> = {}
    if (start) dateFilter.gte = new Date(start)
    if (end) dateFilter.lte = new Date(end)

    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: ids },
        ...(start || end ? { scheduledAt: dateFilter } : {}),
      },
      orderBy: { scheduledAt: 'asc' },
      take: 200,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, title: true } },
        ticket: { select: { id: true, ticketNumber: true, subject: true } },
      },
    })

    return success({ activities })
  } catch (error) {
    return serverError(error)
  }
}

import { calculateLeadScore } from '@/lib/lead-automation'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const body = await req.json()

    const activity = await prisma.activity.create({
      data: {
        tenantId,
        userId: session.user.id,
        branchId: session.user.branchId || undefined,
        type: body.type || 'TASK',
        subject: body.subject,
        description: body.description,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        duration: body.duration,
        leadId: body.leadId,
        contactId: body.contactId,
        dealId: body.dealId,
        ticketId: body.ticketId,
      },
    })

    // Recalculate Lead Score if associated with a lead
    if (activity.leadId) {
      await calculateLeadScore(activity.leadId)
    }

    return success(activity, 201)
  } catch (error) {
    return serverError(error)
  }
}
