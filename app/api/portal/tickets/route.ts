import { success, serverError, notFound, badRequest, unauthorized } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

/**
 * GET /api/portal/tickets
 * Public/Customer facing ticket fetch using email + ticket number for "pseudo-auth"
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get('number')
    const email = searchParams.get('email')

    if (!ticketNumber || !email) {
      return badRequest('Ticket number and registered email are required')
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        ticketNumber,
        contact: {
          email: { equals: email }
        }
      },
      include: {
        contact: { select: { firstName: true, lastName: true, company: true } },
        assignedTo: { select: { firstName: true, lastName: true, avatar: true } },
        comments: {
          where: { isInternal: false }, // Customers should never see internal notes
          include: { 
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' }
        },
        tenant: { select: { name: true, logo: true } }
      }
    })

    if (!ticket) return notFound('No matching ticket found with those credentials')

    return success(ticket)
  } catch (error) {
    return serverError(error)
  }
}

/**
 * POST /api/portal/tickets/comment
 * Allow customers to reply to their tickets
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticketId, email, content } = body

    if (!ticketId || !email || !content) return badRequest('Missing required fields')

    // Verify ticket ownership again for security
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, contact: { email } }
    })

    if (!ticket) return unauthorized('Unauthorized access to this ticket')

    // Since customers don't have User records, we might need a system user or handle it differently
    // In this multi-tenant CRM, we'll associate it with the ticket but mark as customer comment
    // Actually, comments table requires userId. 
    // Optimization: We'll find the Tenant Admin to act as proxy or use a null userId if schema allows (it doesn't).
    
    // FIX: Get the assignee as the target for the notification
    const comment = await prisma.comment.create({
      data: {
        ticketId,
        content,
        userId: ticket.assignedToId || ticket.createdById, // Use assignee as parent user for customer replies
        isInternal: false
      }
    })

    // Update ticket status to OPEN/REOPENED when customer replies
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'OPEN', updatedAt: new Date() }
    })

    return success(comment)
  } catch (error) {
    return serverError(error)
  }
}
