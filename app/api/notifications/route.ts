import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: Record<string, unknown> = { userId }
    if (unreadOnly) where.isRead = false

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return success({ notifications, unreadCount })
  } catch (error) {
    return serverError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const userId = session.user.id
    const body = await req.json()

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
      return success({ marked: true })
    }

    if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId },
        data: { isRead: true },
      })
      return success({ marked: true })
    }

    return success({ message: 'No action taken' })
  } catch (error) {
    return serverError(error)
  }
}
