import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { startOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const { tenantId } = session.user
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'month'

    // 1. KPI Calculation
    const [totalLeads, deals] = await Promise.all([
      prisma.lead.count({ where: { tenantId } }),
      prisma.deal.findMany({ 
        where: { tenantId, status: 'WON' },
        select: { value: true }
      })
    ])

    const totalRevenue = deals.reduce((sum: number, deal: any) => sum + Number(deal.value), 0)
    const avgDealSize = deals.length > 0 ? totalRevenue / (deals.length || 1) : 0
    
    // Simple conversion rate: Leads converted to Won Deals
    const convertedLeadsCount = await prisma.lead.count({ 
      where: { tenantId, status: 'CONVERTED' } 
    })
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeadsCount / totalLeads) * 100) : 0

    // 2. Lead Sources distribution
    const leadSources = await prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: { id: true }
    })

    // 3. Monthly Trends (Last 6 Months)
    const monthlyTrends = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const start = startOfMonth(subMonths(now, i))
      const end = startOfMonth(subMonths(now, i - 1))
      const monthLabel = format(start, 'MMM')

      const [monthLeads, monthDeals] = await Promise.all([
        prisma.lead.count({
          where: { tenantId, createdAt: { gte: start, lt: end } }
        }),
        prisma.deal.findMany({
          where: { tenantId, status: 'WON', updatedAt: { gte: start, lt: end } },
          select: { value: true }
        })
      ])

      monthlyTrends.push({
        month: monthLabel,
        leads: monthLeads,
        deals: monthDeals.length,
        revenue: monthDeals.reduce((sum: number, d: any) => sum + Number(d.value), 0)
      })
    }

    // 4. Top Performers (Sales Reps)
    const usersWithDeals = await prisma.user.findMany({
      where: { tenantId, role: 'SALES_REP' },
      select: {
        firstName: true,
        lastName: true,
        assignedDeals: {
          where: { status: 'WON' },
          select: { value: true }
        }
      }
    })

    const topPerformers = usersWithDeals.map((user: any) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      _count: { deals: user.assignedDeals.length },
      totalRevenue: user.assignedDeals.reduce((sum: number, d: any) => sum + Number(d.value), 0)
    })).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue).slice(0, 5)

    // 5. AI-Powered Forecasting (Linear Regression for Phase 4)
    const revArray = monthlyTrends.map(t => Number(t.revenue))
    const leadArray = monthlyTrends.map(t => t.leads)
    
    const calculatePrediction = (arr: number[]) => {
      if (arr.length < 2) return 0
      const n = arr.length
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
      for (let i = 0; i < n; i++) {
        sumX += i
        sumY += arr[i]
        sumXY += i * arr[i]
        sumX2 += i * i
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      return Math.max(0, slope * n + intercept) // Predict next point
    }

    const nextMonthRevenue = calculatePrediction(revArray)
    const nextMonthLeads = calculatePrediction(leadArray)
    
    // Variance-based confidence score (Higher consistency = Higher confidence)
    const revAvg = revArray.reduce((p, c) => p + c, 0) / revArray.length
    const variance = revArray.reduce((p, c) => p + Math.pow(c - revAvg, 2), 0) / revArray.length
    const confidence = Math.max(60, Math.min(98, 100 - (Math.sqrt(variance) / (revAvg || 1)) * 10))

    // 6. Automation ROI
    const automationStats = await prisma.workflow.aggregate({
      where: { tenantId, status: 'ACTIVE' },
      _sum: { executionCount: true }
    })

    return success({
      kpis: {
        totalRevenue,
        totalLeads,
        avgDealSize,
        conversionRate
      },
      leadSources,
      monthlyTrends,
      topPerformers,
      forecast: {
        revenue: Math.round(nextMonthRevenue),
        leads: Math.round(nextMonthLeads),
        confidence: Math.round(confidence)
      },
      automation: {
        totalExecutions: automationStats._sum.executionCount || 0
      }
    })
  } catch (error) {
    return serverError(error)
  }
}
