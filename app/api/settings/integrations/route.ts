import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    })

    return success({ settings: tenant?.settings || {} })
  } catch (error) {
    return serverError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId, id: userId } = session.user
    const body = await req.json()

    // Get current settings first
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    })

    const currentSettings = (tenant?.settings as any) || {}
    const newSettings = {
      ...currentSettings,
      meta: {
        ...(currentSettings.meta || {}),
        ...(body.meta || {}),
      },
      sms: {
        ...(currentSettings.sms || {}),
        ...(body.sms || {}),
      },
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: newSettings },
    })

    await logAudit({
      action: 'UPDATE',
      entity: 'TenantSettings',
      entityId: tenantId,
      changes: body,
    })

    return success({ settings: updated.settings })
  } catch (error) {
    return serverError(error)
  }
}
