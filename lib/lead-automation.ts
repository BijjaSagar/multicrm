import prisma from './prisma'

/**
 * Lead Scoring Logic (Auto-calculate)
 * - Base Profile (Email, Phone, Company) = +30
 * - Activities logged = +10 each
 * - Priority: HIGH(+20), CRITICAL(+40)
 * - Status: QUALIFIED(+30)
 */
export async function calculateLeadScore(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      _count: { select: { activities: true } }
    }
  })

  if (!lead) return 0

  let score = 0

  // 1. Profile Completeness
  if (lead.email) score += 10
  if (lead.phone) score += 10
  if (lead.company) score += 10
  if (lead.jobTitle) score += 5

  // 2. Activities (engagement)
  score += (lead._count.activities * 10)

  // 3. Priority Weight
  if (lead.priority === 'HIGH') score += 20
  if (lead.priority === 'CRITICAL') score += 40
  if (lead.priority === 'URGENT') score += 50

  // 4. Status Weight
  if (lead.status === 'QUALIFIED') score += 30
  if (lead.status === 'CONTACTED') score += 10
  if (lead.status === 'PROPOSAL_SENT') score += 40

  // Cap at 100
  const finalScore = Math.min(score, 100)

  await prisma.lead.update({
    where: { id: leadId },
    data: { score: finalScore }
  })

  return finalScore
}

/**
 * Lead Assignment Logic (Round-Robin)
 * Assigns a lead to the next available SALES_REP in the tenant's branch
 */
export async function assignLeadRoundRobin(tenantId: string, branchId?: string | null) {
  // Find all active sales reps in this context
  const salesReps = await prisma.user.findMany({
    where: {
      tenantId,
      branchId: branchId || undefined,
      role: 'SALES_REP',
      status: 'ACTIVE'
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' }
  })

  if (salesReps.length === 0) return null

  // Find the last assigned lead for this tenant 
  // (we use metadata in tenant settings to track current pointer)
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  })

  const settings = (tenant?.settings as any) || {}
  const lastIndex = settings.assignmentPointer || 0
  const nextIndex = (lastIndex + 1) % salesReps.length

  // Update pointer for next time
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: {
        ...settings,
        assignmentPointer: nextIndex
      }
    }
  })

  return salesReps[nextIndex].id
}
