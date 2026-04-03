import { getAuthSession, unauthorized, success, serverError, badRequest, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, branchId } = session.user
    const { id } = await params

    // 1. Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id, tenantId },
      include: { contact: true, deal: true }
    })

    if (!lead) return notFound('Lead not found')
    if (lead.convertedAt) return badRequest('Lead already converted')

    // 2. Get default pipeline and stage for the new deal
    const defaultPipeline = await prisma.pipeline.findFirst({
      where: { tenantId, isDefault: true },
      include: { stages: { orderBy: { order: 'asc' }, take: 1 } }
    })

    if (!defaultPipeline || !defaultPipeline.stages[0]) {
       return badRequest('No default pipeline or pipeline stage found. Please configure a pipeline first.')
    }

    // 3. Start a transaction for the conversion
    const result = await prisma.$transaction(async (tx) => {
      // 3a. Create or get Contact
      let contactId = lead.contact?.id
      if (!contactId) {
        const contact = await tx.contact.create({
          data: {
            tenantId,
            branchId: lead.branchId || branchId,
            leadId: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            jobTitle: lead.jobTitle,
            type: 'CUSTOMER',
            status: 'ACTIVE'
          }
        })
        contactId = contact.id
      }

      // 3b. Create Deal
      const deal = await tx.deal.create({
        data: {
          tenantId,
          branchId: lead.branchId || branchId,
          pipelineId: defaultPipeline.id,
          stageId: defaultPipeline.stages[0].id,
          contactId,
          leadId: lead.id,
          assignedToId: lead.assignedToId,
          title: lead.company ? `Deal for ${lead.company}` : `${lead.firstName} ${lead.lastName} Deal`,
          value: lead.expectedRevenue || 0,
          currency: 'INR',
          status: 'OPEN',
          priority: lead.priority || 'MEDIUM',
          description: lead.notes
        }
      })

      // 3c. Update Lead Status
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date()
        }
      })

      // 3d. Add Activity Log
      await tx.activity.create({
        data: {
          tenantId,
          branchId: lead.branchId || branchId,
          leadId: lead.id,
          dealId: deal.id,
          type: 'TASK',
          subject: 'Lead Converted to Deal',
          description: `Lead converted by ${session.user.firstName} ${session.user.lastName}`,
          userId: session.user.id,
          scheduledAt: new Date()
        }
      })

      return deal
    })

    logAudit({
      action: 'UPDATE',
      entity: 'Lead',
      entityId: lead.id,
      changes: { status: 'CONVERTED', convertedToDealId: result.id }
    })

    return success(result, 201)
  } catch (error) {
    console.error('[LEAD_CONVERT]', error)
    return serverError(error)
  }
}
