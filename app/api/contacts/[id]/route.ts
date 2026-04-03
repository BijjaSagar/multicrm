import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const { getRBACWhere, canAccess } = await import('@/lib/rbac')
    const contact = await prisma.contact.findFirst({
      where: { id, ...getRBACWhere(session.user, 'Contact') },
      include: {
        branch: { select: { id: true, name: true } },
        deals: { include: { stage: true }, orderBy: { createdAt: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' }, take: 10 },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
        lead: true,
      },
    })

    if (!contact) return notFound('Contact not found')
    if (!canAccess(session.user, 'READ', 'Contact', contact)) return unauthorized('Access Denied')
    return success(contact)
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

    const { canAccess } = await import('@/lib/rbac')
    const existing = await prisma.contact.findFirst({ where: { id, tenantId: session.user.tenantId } })
    if (!existing) return notFound('Contact not found')
    if (!canAccess(session.user, 'UPDATE', 'Contact', existing)) return unauthorized('Access Denied')

    const contact = await prisma.contact.update({
      where: { id },
      data: body,
    })

    logAudit({ action: 'UPDATE', entity: 'Contact', entityId: id, changes: body })

    return success(contact)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const { canAccess } = await import('@/lib/rbac')
    const existing = await prisma.contact.findFirst({ where: { id, tenantId: session.user.tenantId } })
    if (!existing) return notFound('Contact not found')
    if (!canAccess(session.user, 'DELETE', 'Contact', existing)) return unauthorized('Access Denied')

    await prisma.contact.delete({ where: { id } })
    logAudit({ action: 'DELETE', entity: 'Contact', entityId: id })
    return success({ message: 'Contact deleted' })
  } catch (error) {
    return serverError(error)
  }
}
