import { getAuthSession, unauthorized, success, serverError, badRequest } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

const ADMIN_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER', 'SUPPORT_MANAGER']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    if (!ADMIN_ROLES.includes(session.user.role)) return unauthorized('No permission')

    const { id } = await params
    const body = await req.json()

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target || target.tenantId !== session.user.tenantId) return unauthorized()

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName ?? target.firstName,
        lastName: body.lastName ?? target.lastName,
        phone: body.phone ?? target.phone,
        role: body.role ?? target.role,
        status: body.status ?? target.status,
        branchId: body.branchId || target.branchId,
      },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, role: true, status: true, avatar: true,
        branch: { select: { id: true, name: true } },
      },
    })

    return success(updated)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    if (!['SUPER_ADMIN', 'TENANT_ADMIN'].includes(session.user.role)) return unauthorized('No permission')

    const { id } = await params
    if (id === session.user.id) return badRequest('You cannot delete your own account')

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target || target.tenantId !== session.user.tenantId) return unauthorized()

    await prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } })

    return success({ deleted: true })
  } catch (error) {
    return serverError(error)
  }
}
