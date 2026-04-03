import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { success, unauthorized, badRequest, serverError } from '@/lib/api-utils'

/**
 * DELETE /api/settings/custom-fields/[id]
 * Remove a custom field definition.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return unauthorized()
  if (session.user.role !== 'TENANT_ADMIN') {
    return badRequest('Only admins can manage custom fields')
  }

  const { id } = await params

  try {
    // Ensure the field belongs to the tenant
    const field = await prisma.customFieldDefinition.findFirst({
      where: { id, tenantId: session.user.tenantId }
    })

    if (!field) return badRequest('Field not found or unauthorized')

    await prisma.customFieldDefinition.delete({
      where: { id }
    })

    return success({ message: 'Field deleted successfully' })
  } catch (err) {
    return serverError(err)
  }
}
