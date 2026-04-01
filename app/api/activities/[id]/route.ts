import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { id } = await params
    const body = await req.json()

    const activity = await prisma.activity.findFirst({
      where: { id, tenantId }
    })

    if (!activity) return notFound('Activity not found')

    const updated = await prisma.activity.update({
      where: { id },
      data: {
        subject: body.subject,
        description: body.description,
        type: body.type,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        completedAt: body.completedAt === null ? null : body.completedAt ? new Date(body.completedAt) : undefined,
        duration: body.duration,
        outcome: body.outcome,
      },
    })

    return success(updated)
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const { id } = await params

    const activity = await prisma.activity.findFirst({
      where: { id, tenantId }
    })

    if (!activity) return notFound('Activity not found')

    await prisma.activity.delete({
      where: { id },
    })

    return success({ message: 'Deleted' })
  } catch (error) {
    return serverError(error)
  }
}
