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
    const { page, limit, search, sortBy, sortOrder, status } = params
    const skip = (page - 1) * limit
    
    // Build where clause with RBAC
    const { getRBACWhere } = await import('@/lib/rbac')
    const where = {
      ...getRBACWhere(session.user, 'Deal'),
      ...(status ? { status } : {})
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          stage: { select: { id: true, name: true, color: true, probability: true } },
          pipeline: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true, company: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          branch: { select: { id: true, name: true } },
          _count: { select: { activities: true, products: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ])

    // Pipeline stats
    const pipelineStats = await prisma.deal.groupBy({
      by: ['stageId'],
      where: { tenantId, status: 'OPEN' },
      _count: { id: true },
      _sum: { value: true },
    })

    const totalValue = await prisma.deal.aggregate({
      where: { tenantId },
      _sum: { value: true },
      _count: { id: true },
    })

    const wonDeals = await prisma.deal.aggregate({
      where: { tenantId, status: 'WON' },
      _sum: { value: true },
      _count: { id: true },
    })

    return success({
      deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      pipelineStats,
      summary: {
        totalDeals: totalValue._count.id,
        totalValue: totalValue._sum.value,
        wonDeals: wonDeals._count.id,
        wonValue: wonDeals._sum.value,
      },
    })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, branchId } = session.user
    const body = await request.json()

    if (!body.title || !body.value) {
      return badRequest('Title and value are required')
    }

    // Get default pipeline
    let pipelineId = body.pipelineId
    let stageId = body.stageId

    if (!pipelineId) {
      const defaultPipeline = await prisma.pipeline.findFirst({
        where: { tenantId, isDefault: true },
        include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
      })
      if (defaultPipeline) {
        pipelineId = defaultPipeline.id
        stageId = stageId || defaultPipeline.stages[0]?.id
      }
    }

    if (!pipelineId || !stageId) {
      return badRequest('Pipeline and stage are required')
    }

    const deal = await prisma.deal.create({
      data: {
        tenantId,
        branchId,
        pipelineId,
        stageId,
        title: body.title,
        value: parseFloat(body.value),
        currency: body.currency || 'INR',
        probability: body.probability || 0,
        expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
        status: 'OPEN',
        priority: body.priority || 'MEDIUM',
        description: body.description || null,
        contactId: body.contactId || null,
        assignedToId: body.assignedToId || null,
      },
      include: {
        stage: { select: { id: true, name: true, color: true } },
        pipeline: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, company: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    logAudit({ action: 'CREATE', entity: 'Deal', entityId: deal.id, changes: { title: deal.title, value: deal.value, stageId: deal.stageId } })

    return success(deal, 201)
  } catch (error) {
    return serverError(error)
  }
}
