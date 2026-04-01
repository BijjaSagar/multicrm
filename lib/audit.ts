import prisma from '@/lib/prisma'
import { getAuthSession } from '@/lib/api-utils'

/**
 * Log an audit event. Call this from any API mutation (create/update/delete).
 * Automatically captures user, tenant, and timestamp.
 */
export async function logAudit(params: {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | string
  entity: string
  entityId: string
  changes?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const session = await getAuthSession()
    if (!session) return

    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        changes: params.changes ? (params.changes as any) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    // Never let audit logging break the main flow
    console.error('[AuditLog] Failed to write:', error)
  }
}
