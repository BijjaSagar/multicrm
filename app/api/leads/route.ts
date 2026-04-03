import { getAuthSession, unauthorized, success, serverError, badRequest, parseSearchParams } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { NextRequest } from 'next/server'

// GET /api/leads - List leads with filtering, search, pagination
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
      ...getRBACWhere(session.user, 'Lead'),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {})
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { activities: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    // Aggregate stats
    const stats = await prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { id: true },
      _sum: { expectedRevenue: true },
    })

    return success({
      leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
    })
  } catch (error) {
    return serverError(error)
  }
}

import { triggerWorkflow } from '@/lib/workflow-engine'
import { calculateLeadScore, assignLeadRoundRobin } from '@/lib/lead-automation'

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, branchId, id: userId } = session.user
    const body = await request.json()

    const { firstName, lastName, email, phone, company, jobTitle, source, priority, expectedRevenue, notes, assignedToId } = body

    if (!firstName || !lastName) {
      return badRequest('First name and last name are required')
    }

    // Lead Assignment Logic
    let autoAssignedId = assignedToId
    if (!autoAssignedId) {
      autoAssignedId = await assignLeadRoundRobin(tenantId, branchId)
    }

    const lead = await prisma.lead.create({
      data: {
        tenantId,
        branchId,
        createdById: userId,
        assignedToId: autoAssignedId || null,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        company: company || null,
        jobTitle: jobTitle || null,
        source: source || 'OTHER',
        priority: priority || 'MEDIUM',
        expectedRevenue: expectedRevenue ? parseFloat(expectedRevenue) : null,
        notes: notes || null,
        status: 'NEW',
        score: 0,
      },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    })

    // Auto-calculate initial score
    await calculateLeadScore(lead.id)

    // Trigger Business Automations (Phase 3 Integration)
    await triggerWorkflow(tenantId, 'LEAD_CREATED', lead)

    // Internal Notification for new lead
    if (autoAssignedId) {
      const { notifyNewLead } = await import('@/lib/notifications')
      await notifyNewLead(lead.id, autoAssignedId)
    }

    logAudit({ action: 'CREATE', entity: 'Lead', entityId: lead.id, changes: { firstName, lastName, email, company, assignedToId: autoAssignedId } })

    return success(lead, 201)
  } catch (error) {
    return serverError(error)
  }
}
