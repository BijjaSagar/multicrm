import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized, badRequest, serverError } from '@/lib/api-utils'

/**
 * GET /api/custom-fields/values?entityId=...&entityType=...
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const entityId = searchParams.get('entityId')
  const entityType = searchParams.get('entityType')

  if (!entityId || !entityType) return badRequest('Missing entity parameters')

  try {
    const values = await (prisma as any).customFieldValue.findMany({
      where: {
        tenantId: session.user.tenantId,
        entityId,
      },
      include: { field: true }
    })

    return success({ values })
  } catch (err) {
    return serverError(err)
  }
}

/**
 * POST /api/custom-fields/values
 * Save custom field values (upsert).
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()

  try {
    const body = await req.json()
    const { entityId, values } = body // values: { fieldId: value }

    if (!entityId || !values) return badRequest('Missing parameters')

    // Upsert each value
    const results = await Promise.all(
      Object.entries(values).map(async ([fieldId, val]) => {
        // Find if exists
        const existing = await (prisma as any).customFieldValue.findFirst({
          where: { tenantId: session.user.tenantId, entityId, fieldId }
        })

        if (existing) {
          return (prisma as any).customFieldValue.update({
            where: { id: existing.id },
            data: { value: String(val) }
          })
        } else {
          return (prisma as any).customFieldValue.create({
            data: {
              tenantId: session.user.tenantId,
              fieldId,
              entityId,
              value: String(val)
            }
          })
        }
      })
    )

    return success({ results })
  } catch (err) {
    return serverError(err)
  }
}
