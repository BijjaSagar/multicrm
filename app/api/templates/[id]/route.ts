import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { id } = await params
    const body = await req.json()

    const template = await prisma.emailTemplate.updateMany({
      where: { id, tenantId },
      data: { ...body, updatedAt: new Date() },
    })

    return success(template)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { id } = await params

    await prisma.emailTemplate.deleteMany({ where: { id, tenantId } })
    return success({ deleted: true })
  } catch (error) {
    return serverError(error)
  }
}
