import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })

    if (!lead) return notFound('Lead not found')
    return success(lead)
  } catch (error) {
    return serverError(error)
  }
}

import { sendWhatsappMessage } from '@/lib/whatsapp'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.lead.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: { tenant: true }
    })

    if (!existing) return notFound('Lead not found')

    const updateData: any = { ...body }
    if (body.expectedRevenue) updateData.expectedRevenue = parseFloat(body.expectedRevenue)

    const lead = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    logAudit({ action: 'UPDATE', entity: 'Lead', entityId: id, changes: body })

    // Trigger WhatsApp Automation for Leads
    if (body.status && body.status !== existing.status && lead.phone) {
      const tenantSettings = (existing.tenant.settings as any) || {}
      const whatsappEnabled = !!tenantSettings.sms?.apiKey

      if (whatsappEnabled) {
        try {
          if (body.status === 'CONTACTED') {
            await sendWhatsappMessage(
              lead.phone,
              `Hello ${lead.firstName}, this is ${session.user.firstName} from ${existing.tenant.name}. I just received your inquiry and would love to chat!`,
              session.user.tenantId
            )
          } else if (body.status === 'QUALIFIED') {
            await sendWhatsappMessage(
              lead.phone,
              `Great news ${lead.firstName}! You've been qualified for our premium services. One of our experts will reach out to you shortly.`,
              session.user.tenantId
            )
          }
        } catch (waError) {
          console.error('Lead WhatsApp Automation failed:', waError)
        }
      }
    }

    return success(lead)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const existing = await prisma.lead.findFirst({
      where: { id, tenantId: session.user.tenantId }
    })

    if (!existing) return notFound('Lead not found')

    await prisma.lead.delete({ where: { id } })
    logAudit({ action: 'DELETE', entity: 'Lead', entityId: id })

    return success({ message: 'Lead deleted' })
  } catch (error) {
    return serverError(error)
  }
}
