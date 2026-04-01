import prisma from './prisma'

/**
 * Global internal notification dispatcher
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'INFO',
  link = null
}: {
  userId: string
  title: string
  message: string
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TASK_DUE' | 'LEAD_ASSIGNED' | 'DEAL_UPDATE' | 'TICKET_UPDATE' | 'SLA_BREACH' | 'SYSTEM'
  link?: string | null
}) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
      isRead: false
    }
  })
}

/**
 * Task Reminder Logic
 * Can be called via a cron or manually during status updates
 */
export async function notifyTaskOverdue(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { user: true }
  })

  if (!activity || !activity.userId || activity.completedAt) return

  await createNotification({
    userId: activity.userId,
    title: 'Task Overdue!',
    message: `Your task "${activity.subject}" was scheduled for ${activity.scheduledAt?.toLocaleString()}. Please complete it as soon as possible.`,
    type: 'WARNING',
    link: '/dashboard/calendar'
  })
}

/**
 * New Lead Notification
 */
export async function notifyNewLead(leadId: string, assignedUserId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return

  await createNotification({
    userId: assignedUserId,
    title: 'New Lead Assigned',
    message: `You've been assigned a new lead: ${lead.firstName} ${lead.lastName} (${lead.company || 'N/A'})`,
    type: 'SUCCESS',
    link: `/dashboard/leads`
  })
}
