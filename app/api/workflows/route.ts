import { getAuthSession, unauthorized, success, serverError, parseSearchParams, badRequest } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

// GET /api/workflows - List all workflows for the tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    
    const workflows = await prisma.workflow.findMany({
      where: { tenantId },
      include: {
        actions: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return success({ workflows })
  } catch (error) {
    console.error('[Workflow API] GET error:', error)
    return serverError(error)
  }
}

// POST /api/workflows - Create a new workflow (Simple implementation for creating a basic automation)
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    const body = await request.json()
    const { name, triggerType, triggerConfig, actions } = body

    if (!name || !triggerType) {
      return badRequest('Name and trigger type are required')
    }

    const workflow = await prisma.workflow.create({
      data: {
        tenantId,
        name,
        triggerType,
        triggerConfig: triggerConfig || {},
        status: 'ACTIVE',
        actions: {
          create: actions?.map((action: any, index: number) => ({
            type: action.type,
            config: action.config || {},
            order: index
          })) || [
            // Default action if none provided
            { type: 'NOTIFICATION', config: { message: 'Workflow triggered' }, order: 0 }
          ]
        }
      },
      include: {
        actions: true
      }
    })

    return success(workflow, 201)
  } catch (error) {
    console.error('[Workflow API] POST error:', error)
    return serverError(error)
  }
}
