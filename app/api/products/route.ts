import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import { logAudit } from '@/lib/audit'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = { tenantId, isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { dealProducts: true } } },
    })

    return success({ products })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        tenantId,
        name: body.name,
        sku: body.sku || null,
        description: body.description || null,
        price: parseFloat(body.price),
        currency: body.currency || 'INR',
        category: body.category || null,
        unit: body.unit || 'unit',
        taxRate: body.taxRate ? parseFloat(body.taxRate) : 0,
        isActive: true,
      },
    })

    logAudit({ action: 'CREATE', entity: 'Product', entityId: product.id, changes: { name: product.name, price: product.price } })

    return success(product, 201)
  } catch (error) {
    return serverError(error)
  }
}
