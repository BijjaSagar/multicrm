import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        avatar: true, role: true, status: true,
        tenant: { select: { id: true, name: true, domain: true, plan: true, settings: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
    })

    return success({ user })
  } catch (error) {
    return serverError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const body = await req.json()

    // Profile update
    if (body.section === 'profile') {
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
        },
      })
      return success(updated)
    }

    // Organization update (tenant admin only)
    if (body.section === 'organization') {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user || !['SUPER_ADMIN', 'TENANT_ADMIN'].includes(user.role)) {
        return unauthorized()
      }
      const updated = await prisma.tenant.update({
        where: { id: session.user.tenantId },
        data: {
          name: body.name,
          settings: {
            industry: body.industry,
            currency: body.currency,
            timezone: body.timezone,
          },
        },
      })
      return success(updated)
    }

    // Password change
    if (body.section === 'password') {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) return unauthorized()

      const validPassword = await bcrypt.compare(body.currentPassword, user.password)
      if (!validPassword) {
        return Response.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      const newHash = await bcrypt.hash(body.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: newHash },
      })

      return success({ updated: true })
    }
    
    // Integrations update
    if (body.section === 'integrations') {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user || user.role !== 'TENANT_ADMIN') return unauthorized()

      const currentTenant = await prisma.tenant.findUnique({ where: { id: session.user.tenantId } })
      const currentSettings = (currentTenant?.settings as any) || {}

      const updated = await prisma.tenant.update({
        where: { id: session.user.tenantId },
        data: {
          settings: {
            ...currentSettings,
            meta: {
              ...currentSettings.meta,
              displayName: body.metaDisplayName,
              appId: body.metaAppId,
              verifyToken: body.metaVerifyToken,
              accessToken: body.metaAccessToken,
            },
            sms: {
              ...currentSettings.sms,
              provider: body.smsProvider,
              apiKey: body.smsApiKey,
              senderId: body.smsSenderId,
              templateId: body.smsTemplateId,
            }
          }
        }
      })
      return success(updated)
    }

    return success({ message: 'No section specified' })
  } catch (error) {
    return serverError(error)
  }
}
