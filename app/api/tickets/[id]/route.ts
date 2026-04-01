import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const ticket = await prisma.ticket.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        contact: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })

    if (!ticket) return notFound('Ticket not found')
    return success(ticket)
  } catch (error) {
    return serverError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.ticket.findFirst({ where: { id, tenantId: session.user.tenantId } })
    if (!existing) return notFound('Ticket not found')

    const updateData: Record<string, unknown> = { ...body }
    if (body.status === 'RESOLVED') updateData.resolvedAt = new Date()
    if (body.status === 'CLOSED') updateData.closedAt = new Date()

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    logAudit({ action: 'UPDATE', entity: 'Ticket', entityId: id, changes: updateData })

    return success(ticket)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const existing = await prisma.ticket.findFirst({ where: { id, tenantId: session.user.tenantId } })
    if (!existing) return notFound('Ticket not found')

    await prisma.ticket.delete({ where: { id } })
    logAudit({ action: 'DELETE', entity: 'Ticket', entityId: id })
    return success({ message: 'Ticket deleted' })
  } catch (error) {
    return serverError(error)
  }
}
