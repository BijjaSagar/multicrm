import { getAuthSession, unauthorized, success, serverError, parseSearchParams } from '@/lib/api-utils'
import { logAudit } from '@/lib/audit'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user

    const branches = await prisma.branch.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true, leads: true, contacts: true, deals: true, tickets: true } },
      },
    })

    return success({ branches })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const body = await req.json()

    const branch = await prisma.branch.create({
      data: {
        tenantId,
        name: body.name,
        code: body.code || body.name.toUpperCase().replace(/\s+/g, '_').slice(0, 10),
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country || 'India',
        phone: body.phone,
        email: body.email,
        isHeadquarters: body.isHeadquarters || false,
      },
    })

    logAudit({ action: 'CREATE', entity: 'Branch', entityId: branch.id, changes: { name: branch.name, code: branch.code } })

    return success(branch, 201)
  } catch (error) {
    return serverError(error)
  }
}
