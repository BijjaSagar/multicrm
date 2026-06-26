import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    const q = request.nextUrl.searchParams.get('q')?.trim() || ''

    if (q.length < 2) return success({ results: [] })

    const where = (extra: object) => ({
      tenantId,
      ...extra,
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { company: { contains: q } },
      ],
    })

    const [leads, contacts, deals, tickets] = await Promise.all([
      prisma.lead.findMany({
        where: where({}),
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, company: true, status: true },
      }),
      prisma.contact.findMany({
        where: where({}),
        take: 5,
        select: { id: true, firstName: true, lastName: true, email: true, company: true },
      }),
      prisma.deal.findMany({
        where: { tenantId, title: { contains: q } },
        take: 5,
        select: { id: true, title: true, value: true, status: true },
      }),
      prisma.ticket.findMany({
        where: { tenantId, OR: [{ subject: { contains: q } }, { ticketNumber: { contains: q } }] },
        take: 5,
        select: { id: true, subject: true, status: true, priority: true, ticketNumber: true },
      }),
    ])

    const results = [
      ...leads.map(r => ({ type: 'lead', id: r.id, label: `${r.firstName} ${r.lastName}`, sub: r.email || r.company || '', badge: r.status, href: `/dashboard/leads/${r.id}` })),
      ...contacts.map(r => ({ type: 'contact', id: r.id, label: `${r.firstName} ${r.lastName}`, sub: r.email || r.company || '', badge: null, href: `/dashboard/contacts` })),
      ...deals.map(r => ({ type: 'deal', id: r.id, label: r.title, sub: r.value ? `₹${Number(r.value).toLocaleString('en-IN')}` : '', badge: r.status, href: `/dashboard/deals/${r.id}` })),
      ...tickets.map(r => ({ type: 'ticket', id: r.id, label: r.subject, sub: r.ticketNumber || '', badge: r.priority, href: `/dashboard/tickets` })),
    ]

    return success({ results, query: q })
  } catch (error) {
    return serverError(error)
  }
}
