import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized, badRequest, serverError } from '@/lib/api-utils'

/**
 * GET /api/settings/custom-fields
 * List custom field definitions for the tenant.
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()

  const { searchParams } = new URL(req.url)
  const entityType = searchParams.get('entityType')

  try {
    const fields = await prisma.customFieldDefinition.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { displayOrder: 'asc' },
    })

    return success({ fields })
  } catch (err) {
    return serverError(err)
  }
}

/**
 * POST /api/settings/custom-fields
 * Create a new custom field definition.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return unauthorized()
  // Only admins can manage fields
  if (session.user.role !== 'TENANT_ADMIN') {
    return badRequest('Only admins can manage custom fields')
  }

  try {
    const body = await req.json()
    const { entityType, fieldName, fieldType, options, isRequired } = body

    if (!entityType || !fieldName || !fieldType) {
      return badRequest('Missing required fields')
    }

    const field = await prisma.customFieldDefinition.create({
      data: {
        tenantId: session.user.tenantId,
        entityType,
        fieldName,
        fieldType,
        options: options || undefined,
        isRequired: !!isRequired,
      },
    })

    return success({ field }, 201)
  } catch (err) {
    return serverError(err)
  }
}
