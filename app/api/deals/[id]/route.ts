import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const deal = await prisma.deal.findFirst({
      where: { id, tenantId: session.user.tenantId },
      include: {
        stage: true,
        pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
        contact: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
        branch: { select: { id: true, name: true } },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
        products: { include: { product: true } },
      },
    })

    if (!deal) return notFound('Deal not found')
    return success(deal)
  } catch (error) {
    return serverError(error)
  }
}

import { sendWhatsappMessage, sendWhatsappTemplate } from '@/lib/whatsapp'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.deal.findFirst({ 
      where: { id, tenantId: session.user.tenantId },
      include: { 
        contact: true,
        stage: true,
        tenant: true
      }
    })
    if (!existing) return notFound('Deal not found')

    const updateData: Record<string, unknown> = { ...body }
    if (body.value) updateData.value = parseFloat(body.value)
    if (body.expectedCloseDate) updateData.expectedCloseDate = new Date(body.expectedCloseDate)
    if (body.status === 'WON') updateData.actualCloseDate = new Date()

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        stage: { select: { id: true, name: true, color: true } },
        contact: { select: { id: true, firstName: true, lastName: true, company: true, phone: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    logAudit({ action: 'UPDATE', entity: 'Deal', entityId: id, changes: updateData })

    // Trigger WhatsApp Automation if stage changed and contact has phone
    if (body.stageId && body.stageId !== existing.stageId && deal.contact?.phone) {
      const tenantSettings = (existing.tenant.settings as any) || {}
      const whatsappEnabled = !!tenantSettings.sms?.apiKey
      
      if (whatsappEnabled) {
        const stageName = deal.stage?.name.toUpperCase()
        try {
          if (stageName === 'CLOSED WON' || body.status === 'WON') {
            await sendWhatsappMessage(
              deal.contact.phone,
              `Congratulations ${deal.contact.firstName}! Your deal "${deal.title}" has been successfully closed. We look forward to working with you!`,
              session.user.tenantId
            )
          } else if (stageName?.includes('PROPOSAL')) {
            const templateId = tenantSettings.sms?.templateId
            if (templateId) {
                // Use template if DLT template ID is configured
                await sendWhatsappTemplate(deal.contact.phone, templateId, [deal.contact.firstName, deal.title], session.user.tenantId)
            } else {
                await sendWhatsappMessage(
                  deal.contact.phone,
                  `Hi ${deal.contact.firstName}, your proposal for "${deal.title}" is ready for review. Please check your email for details.`,
                  session.user.tenantId
                )
            }
          }
        } catch (waError) {
          console.error('WhatsApp Automation failed:', waError)
        }
      }
    }

    return success(deal)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const existing = await prisma.deal.findFirst({ where: { id, tenantId: session.user.tenantId } })
    if (!existing) return notFound('Deal not found')

    await prisma.deal.delete({ where: { id } })
    logAudit({ action: 'DELETE', entity: 'Deal', entityId: id })
    return success({ message: 'Deal deleted' })
  } catch (error) {
    return serverError(error)
  }
}
