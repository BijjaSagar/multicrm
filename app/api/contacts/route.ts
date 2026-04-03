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
      ...getRBACWhere(session.user, 'Contact'),
      ...(status ? { status } : {})
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

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true } },
          _count: { select: { deals: true, tickets: true, activities: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    const stats = await prisma.contact.groupBy({
      by: ['type'],
      where: { tenantId },
      _count: { id: true },
    })

    return success({
      contacts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats,
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

    if (!body.firstName || !body.lastName) {
      return badRequest('First name and last name are required')
    }

    const contact = await prisma.contact.create({
      data: {
        tenantId,
        branchId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        phone: body.phone || null,
        mobile: body.mobile || null,
        company: body.company || null,
        jobTitle: body.jobTitle || null,
        department: body.department || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'India',
        postalCode: body.postalCode || null,
        website: body.website || null,
        linkedin: body.linkedin || null,
        type: body.type || 'CUSTOMER',
        status: 'ACTIVE',
        notes: body.notes || null,
      },
      include: {
        branch: { select: { id: true, name: true } },
      },
    })

    logAudit({ action: 'CREATE', entity: 'Contact', entityId: contact.id, changes: { firstName: contact.firstName, lastName: contact.lastName, email: contact.email } })

    return success(contact, 201)
  } catch (error) {
    return serverError(error)
  }
}
