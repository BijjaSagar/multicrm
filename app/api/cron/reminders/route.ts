import { success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

/**
 * GET /api/cron/reminders
 * This should be called by a cron job (Vercal/Hobby/Etc) 
 * but for development we can use it to trigger overdue check.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    // Safe check if running in production
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

    const now = new Date()

    // Find all incomplete activities that are past their scheduled date
    const overdueActivities = await prisma.activity.findMany({
      where: {
        completedAt: null,
        scheduledAt: { lt: now },
      },
      include: { user: true }
    })

    const results = []

    for (const act of overdueActivities) {
      if (!act.userId) continue
      
      // Prevent spamming (only notify once a day if overdue)
      const lastNotify = await prisma.notification.findFirst({
        where: {
          userId: act.userId,
          title: 'Task Overdue!',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })

      if (!lastNotify) {
        await createNotification({
          userId: act.userId!,
          title: 'Task Overdue!',
          message: `Scheduled: ${act.scheduledAt?.toLocaleString()}. Task "${act.subject}" is pending.`,
          type: 'WARNING',
          link: '/dashboard/calendar'
        })
        results.push(act.id)
      }
    }

    return success({ processed: overdueActivities.length, notified: results.length })
  } catch (error) {
    return serverError(error)
  }
}
