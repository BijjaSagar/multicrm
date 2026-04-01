import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user

    const pipelines = await prisma.pipeline.findMany({
      where: { tenantId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            deals: {
              where: { status: 'OPEN' },
              include: {
                contact: { select: { id: true, firstName: true, lastName: true, company: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true, avatar: true } },
              },
              orderBy: { value: 'desc' },
            },
            _count: { select: { deals: true } },
          },
        },
      },
    })

    return success({ pipelines })
  } catch (error) {
    return serverError(error)
  }
}
