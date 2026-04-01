import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const broadcasts = await prisma.broadcast.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { firstName: true, lastName: true } }
      }
    })

    return success(broadcasts)
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const body = await req.json()
    const { name, type, segment, templateId, content } = body

    if (!name || !type || !segment) {
      return badRequest('Missing required fields')
    }

    // 1. Fetch recipients based on segment
    let targets: { id: string, name: string, phone: string | null, email: string | null }[] = []

    if (segment === 'ALL_LEADS') {
      targets = await prisma.lead.findMany({
        where: { tenantId: session.user.tenantId, status: { notIn: ['CONVERTED', 'LOST', 'JUNK'] } },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true }
      }).then((leads: any[]) => leads.map(l => ({ ...l, name: `${l.firstName} ${l.lastName}` })))
    } else if (segment === 'CUSTOMERS') {
      targets = await prisma.contact.findMany({
        where: { tenantId: session.user.tenantId, type: 'CUSTOMER' },
        select: { id: true, firstName: true, lastName: true, phone: true, email: true }
      }).then((contacts: any[]) => contacts.map(c => ({ ...c, name: `${c.firstName} ${c.lastName}` })))
    }

    if (targets.length === 0) {
      return badRequest('No recipients found for the selected segment')
    }

    // 2. Create the broadcast
    const broadcast = await prisma.broadcast.create({
      data: {
        tenantId: session.user.tenantId,
        createdById: session.user.id,
        name,
        type,
        segment,
        templateId,
        content,
        recipientCount: targets.length,
        status: 'SCHEDULED', // Move to scheduled for background processing
      }
    })

    // 3. Prepare recipients
    await prisma.recipient.createMany({
      data: targets.map(t => ({
        broadcastId: broadcast.id,
        leadId: segment === 'ALL_LEADS' ? t.id : undefined,
        contactId: segment === 'CUSTOMERS' ? t.id : undefined,
        target: type === 'WHATSAPP' ? (t.phone || '') : (t.email || ''),
        status: 'PENDING'
      }))
    })

    // Note: In a real production system, we would trigger a background worker here (e.g., BullMQ, Inngest)
    // For this implementation, the system is ready to be picked up by the worker.

    return success(broadcast)
  } catch (error) {
    return serverError(error)
  }
}
