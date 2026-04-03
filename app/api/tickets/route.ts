import { getAuthSession, unauthorized, success, serverError, badRequest, parseSearchParams } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, branchId, role } = session.user
    const params = parseSearchParams(request.url)
    const { page, limit, search, sortBy, sortOrder, status, priority } = params
    const skip = (page - 1) * limit

    // Build where clause with RBAC
    const { getRBACWhere } = await import('@/lib/rbac')
    const where = {
      ...getRBACWhere(session.user, 'Ticket'),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {})
    }
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { ticketNumber: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ])

    const stats = await prisma.ticket.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
    })

    const priorityStats = await prisma.ticket.groupBy({
      by: ['priority'],
      where: { tenantId, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      _count: { id: true },
    })

    return success({
      tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
      priorityStats,
    })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, branchId, id: userId } = session.user
    const body = await request.json()

    if (!body.subject || !body.description) {
      return badRequest('Subject and description are required')
    }

    // Generate ticket number
    const count = await prisma.ticket.count({ where: { tenantId } })
    const ticketNumber = `MCR-${String(count + 1).padStart(4, '0')}`

    const ticket = await prisma.ticket.create({
      data: {
        tenantId,
        branchId,
        createdById: userId,
        ticketNumber,
        subject: body.subject,
        description: body.description,
        category: body.category || 'GENERAL',
        priority: body.priority || 'MEDIUM',
        status: 'OPEN',
        channel: body.channel || 'PORTAL',
        contactId: body.contactId || null,
        assignedToId: body.assignedToId || null,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    logAudit({ action: 'CREATE', entity: 'Ticket', entityId: ticket.id, changes: { subject: ticket.subject, priority: ticket.priority } })

    return success(ticket, 201)
  } catch (error) {
    return serverError(error)
  }
}
