import { getAuthSession, unauthorized, success, serverError, notFound } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

// GET /api/workflows/[id] — Get a single workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const { tenantId } = session.user

    const workflow = await prisma.workflow.findFirst({
      where: { id, tenantId },
      include: { actions: { orderBy: { order: 'asc' } } },
    })

    if (!workflow) return notFound('Workflow not found')
    return success(workflow)
  } catch (error) {
    return serverError(error)
  }
}

// PATCH /api/workflows/[id] — Update status, name, or trigger
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const { tenantId } = session.user
    const body = await request.json()

    const existing = await prisma.workflow.findFirst({
      where: { id, tenantId },
    })
    if (!existing) return notFound('Workflow not found')

    const updated = await prisma.workflow.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.triggerType !== undefined && { triggerType: body.triggerType }),
        ...(body.triggerConfig !== undefined && { triggerConfig: body.triggerConfig }),
      },
      include: { actions: { orderBy: { order: 'asc' } } },
    })

    return success(updated)
  } catch (error) {
    return serverError(error)
  }
}

// DELETE /api/workflows/[id] — Delete a workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { id } = await params
    const { tenantId } = session.user

    const existing = await prisma.workflow.findFirst({
      where: { id, tenantId },
    })
    if (!existing) return notFound('Workflow not found')

    // Delete actions first, then workflow
    await prisma.workflowAction.deleteMany({ where: { workflowId: id } })
    await prisma.workflow.delete({ where: { id } })

    return success({ deleted: true })
  } catch (error) {
    return serverError(error)
  }
}
