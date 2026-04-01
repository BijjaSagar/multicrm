import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user

    const templates = await prisma.emailTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })

    return success({ templates })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()
    const { tenantId } = session.user
    const body = await req.json()

    const template = await prisma.emailTemplate.create({
      data: {
        tenantId,
        name: body.name,
        subject: body.subject,
        body: body.body,
        category: body.category,
        variables: body.variables,
        isActive: body.isActive ?? true,
      },
    })

    return success(template, 201)
  } catch (error) {
    return serverError(error)
  }
}
