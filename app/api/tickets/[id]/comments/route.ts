import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id: ticketId } = await params
    const body = await request.json()

    if (!body.content) return badRequest('Comment content is required')

    const comment = await prisma.comment.create({
      data: {
        ticketId,
        userId: session.user.id,
        content: body.content,
        isInternal: body.isInternal || false,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    })

    // Notify assignee if someone else comments
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (ticket && ticket.assignedToId && ticket.assignedToId !== session.user.id) {
       const { createNotification } = await import('@/lib/notifications')
       await createNotification({
         userId: ticket.assignedToId,
         title: 'New Ticket Comment',
         message: `New comment on ${ticket.ticketNumber}: "${body.content.substring(0, 50)}..."`,
         type: 'INFO',
         link: `/dashboard/tickets`
       })
    }

    return success(comment)
  } catch (error) {
    return serverError(error)
  }
}
