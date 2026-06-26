'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import {
  Users, UserPlus, DollarSign, HeadphonesIcon,
  TrendingUp, ArrowUpRight, BarChart3, Clock, CheckCircle2,
  AlertTriangle, Calendar, Plus, Loader2, RefreshCw,
  PieChart, Megaphone, CheckSquare, Zap, Activity, X
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart as RechartsPieChart, Pie, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import Link from 'next/link'
import { getVerticalConfig } from '@/lib/vertical-config'

interface DashboardData {
  kpis: {
    totalLeads: number
    activeContacts: number
    openTickets: number
    totalDeals: number
    totalPipelineValue: number
    monthlyRevenue: number
    wonDealsThisMonth: number
    winRate: number
  }
  recentLeads: Array<{
    id: string
    firstName: string
    lastName: string
    company: string | null
    status: string
    source: string
    createdAt: string
    assignedTo: { firstName: string; lastName: string } | null
    customFields?: Record<string, string>
  }>
  topDeals: Array<{ id: string; title: string; value: number; stage: { name: string; color: string } | null; contact: { firstName: string; lastName: string; company: string | null } | null; assignedTo: { firstName: string; lastName: string } | null }>
  pipeline: Array<{ id: string; name: string; color: string; dealCount: number; totalValue: number }>
  ticketsByPriority: Array<{ priority: string; _count: { id: number } }>
  submissionTrends?: Array<{ day: string; count: number }>
  leadsByStatus?: Record<string, number>
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

// ─── LSC-specific status display ───────────────────────────────────────────
const educationStatusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: 'To be Enrol LSC', color: '#3B82F6' },
  CONTACTED: { label: 'Counselling', color: '#F59E0B' },
  QUALIFIED: { label: 'Applied', color: '#10B981' },
  PROPOSAL_SENT: { label: 'Documents Verifying', color: '#6366F1' },
  NEGOTIATION: { label: 'Fees Paid', color: '#8B5CF6' },
  CONVERTED: { label: 'Admitted', color: '#10B981' },
  LOST: { label: 'Lost', color: '#EF4444' },
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, sub }: {
  title: string; value: string | number; icon: React.ElementType; iconBg: string; iconColor: string; sub?: string
}) {
  return (
    <div className="stat-card animate-fade-in-up">
      <div className="stat-icon" style={{ background: iconBg }}><Icon size={24} color={iconColor} /></div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ─── Welcome Tour ───────────────────────────────────────────────────────────
function WelcomeTour({ verticalName, entityName, onDismiss }: { verticalName: string; entityName: string; onDismiss: () => void }) {
  const steps = [
    { icon: UserPlus, color: '#6366F1', title: `Add your first ${entityName}`, desc: `Go to ${entityName}s → click "Add ${entityName}" to create your first record.` },
    { icon: BarChart3, color: '#10B981', title: 'Set up your Pipeline', desc: 'Drag and drop records across stages in the Pipeline view to track progress.' },
    { icon: Users, color: '#F59E0B', title: 'Invite your team', desc: 'Go to Settings → Team to invite sales reps, managers, and agents.' },
    { icon: Zap, color: '#EF4444', title: 'Create automations', desc: 'Set up WhatsApp messages or notifications that fire automatically on status changes.' },
  ]
  return (
    <div className="card animate-fade-in-up" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(6,182,212,0.04))', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            👋 Welcome to your {verticalName} workspace!
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Your dashboard is live. Here's how to get started in 4 steps.
          </div>
        </div>
        <button onClick={onDismiss} className="btn btn-ghost btn-icon" style={{ borderRadius: '8px' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTour, setShowTour] = useState(false)

  const verticalKey = session?.user?.tenantSettings?.verticalKey || 'GENERAL'
  const verticalConfig = getVerticalConfig(verticalKey)
  const isEducation = session?.user?.enabledModules?.includes('STUDENT_MANAGEMENT') || false

  // Show welcome tour once per device after onboarding
  useEffect(() => {
    if (!session) return
    const tenantId = session.user.tenantId
    const tourKey = `tour_dismissed_${tenantId}`
    const dismissed = localStorage.getItem(tourKey)
    const onboardingCompleted = session.user.tenantSettings?.onboardingCompleted === true
    if (onboardingCompleted && !dismissed) setShowTour(true)
  }, [session])

  const dismissTour = () => {
    if (session?.user?.tenantId) {
      localStorage.setItem(`tour_dismissed_${session.user.tenantId}`, '1')
    }
    setShowTour(false)
  }

  const fetchDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard data')
      const json = await res.json()

      if (isEducation && json.recentLeads?.length > 0) {
        const leadIds = json.recentLeads.map((l: any) => l.id)
        const customRes = await fetch(`/api/custom-fields/values?entityId=${leadIds.join(',')}&entityType=LEAD`)
        if (customRes.ok) {
          const customData = await customRes.json()
          const valuesMap: Record<string, Record<string, string>> = {}
          customData.values?.forEach((v: any) => {
            if (!valuesMap[v.entityId]) valuesMap[v.entityId] = {}
            valuesMap[v.entityId][v.field.fieldName] = v.value
          })
          json.recentLeads = json.recentLeads.map((l: any) => ({ ...l, customFields: valuesMap[l.id] || {} }))
        }
      }

      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [isEducation])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spinner" />
        <span style={{ fontSize: '16px' }}>Loading {verticalConfig.dashboardTitle}...</span>
      </div>
    )
  }

  const kpis = data?.kpis || { totalLeads: 0, activeContacts: 0, openTickets: 0, totalDeals: 0, totalPipelineValue: 0, monthlyRevenue: 0, wonDealsThisMonth: 0, winRate: 0 }
  const byStatus = data?.leadsByStatus || {}

  // ─── MITSDE LSC Dashboard (Education vertical, kept as-is) ──────────────
  if (isEducation) {
    const todayLeadsCount = data?.recentLeads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length || 0

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {showTour && (
          <WelcomeTour
            verticalName={session?.user?.tenantSettings?.verticalName || 'Distance Education'}
            entityName={verticalConfig.entityName}
            onDismiss={dismissTour}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '8px', height: '24px', borderRadius: '4px', background: '#2563EB' }} />
              Partner Admissions Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Logged in as LSC Partner: <strong style={{ color: 'var(--primary-600)' }}>{session?.user?.tenantName}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}><RefreshCw size={14} /> Refresh</button>
            <Link href="/dashboard/leads">
              <button className="btn btn-primary btn-sm"><Plus size={14} /> Add Lead</button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <StatCard title="My Total Leads" value={kpis.totalLeads.toLocaleString()} icon={Users} iconBg="rgba(37,99,235,0.1)" iconColor="#2563EB" />
          <StatCard title="Today's Leads" value={todayLeadsCount} icon={UserPlus} iconBg="rgba(16,185,129,0.1)" iconColor="#10B981" />
          <StatCard title="Pending Counselling" value={byStatus['CONTACTED'] || 0} icon={Clock} iconBg="rgba(245,158,11,0.1)" iconColor="#F59E0B" />
          <StatCard title="Admitted (Won)" value={byStatus['CONVERTED'] || 0} icon={CheckCircle2} iconBg="rgba(139,92,246,0.1)" iconColor="#8B5CF6" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#2563EB" /> Lead Submission Trends
            </h3>
            <div style={{ minHeight: '260px' }}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data?.submissionTrends || []} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <RechartsTooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, stroke: '#2563EB', strokeWidth: 2, fill: 'white' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={16} color="#F59E0B" /> Announcements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '16px', background: 'rgba(37,99,235,0.03)', border: '1px dashed rgba(37,99,235,0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB' }}>Welcome to the MITSDE LSC Portal!</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>March 3, 2025</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Role-based access control and dynamic custom field forms are now live. Review your course lists in Settings.</p>
                <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 700 }}>— MITSDE Admin Team</div>
              </div>
              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.03)', border: '1px dashed rgba(16,185,129,0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>Admissions Campaign Open</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>June 20, 2026</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>PGDM and PGDBA dual specializations are now open. Attach all verification documents before submission.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#10B981" /> My Recent Leads
          </h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr><th>Lead ID</th><th>Name</th><th>Course</th><th>Specialization</th><th>Status</th><th>Date Added</th></tr>
              </thead>
              <tbody>
                {data?.recentLeads?.length ? data.recentLeads.map((lead, i) => {
                  const statusMeta = educationStatusConfig[lead.status] || { label: lead.status, color: '#64748B' }
                  return (
                    <tr key={lead.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '11px' }}>{lead.id.slice(0, 8)}…</td>
                      <td style={{ fontWeight: 600 }}>{lead.customFields?.['Salutation'] || 'Mr.'} {lead.firstName} {lead.lastName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{lead.customFields?.['Course'] || '—'}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.customFields?.['Specialization'] || '—'}</td>
                      <td><span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${statusMeta.color}15`, color: statusMeta.color }}>{statusMeta.label}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No recent leads. Click 'Add Lead' to create your first enrollment lead.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ─── Adaptive Vertical Dashboard (all other verticals) ──────────────────
  const cfg = verticalConfig
  const verticalName = session?.user?.tenantSettings?.verticalName || cfg.dashboardTitle

  // Compute vertical-specific KPI values from real data
  const primaryValue = kpis.totalLeads
  const secondaryValue = formatCurrency(Number(kpis.totalPipelineValue || 0))
  const tertiaryValue = `${kpis.winRate}%`
  const quaternaryValue = (() => {
    // Pick the most "actionable" status count for the 4th KPI
    const actionableStatus: Record<string, string> = {
      REAL_ESTATE: 'CONTACTED',       // Site Visits
      HEALTHCARE: 'NEGOTIATION',      // Follow-ups Due
      HOSPITALITY: 'PROPOSAL_SENT',   // Checked In
      FINANCE_INSURANCE: 'NEGOTIATION', // Renewal Due
      AUTOMOTIVE: 'CONTACTED',        // Test Drives
      LEGAL: 'PROPOSAL_SENT',         // Hearings Scheduled
      FITNESS_WELLNESS: 'NEGOTIATION', // Renewals Due
      EVENTS: 'PROPOSAL_SENT',        // Confirmed
      RESTAURANT: 'CONTACTED',        // Today reservations
      COWORKING: 'CONTACTED',         // Tours Scheduled
    }
    const statusKey = actionableStatus[verticalKey]
    return statusKey ? (byStatus[statusKey] || 0) : kpis.openTickets
  })()

  const kpiCards = [
    { title: cfg.kpiLabels.primary, value: primaryValue.toLocaleString(), icon: UserPlus, bg: 'rgba(99,102,241,0.1)', color: '#6366F1' },
    { title: cfg.kpiLabels.secondary, value: secondaryValue, icon: DollarSign, bg: 'rgba(16,185,129,0.1)', color: '#10B981' },
    { title: cfg.kpiLabels.tertiary, value: tertiaryValue, icon: TrendingUp, bg: 'rgba(6,182,212,0.1)', color: '#06B6D4' },
    { title: cfg.kpiLabels.quaternary, value: quaternaryValue, icon: Activity, bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
  ]

  // Pipeline breakdown using status counts
  const statusBreakdown = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: cfg.statusLabels[status] || status,
      value: count as number,
      status,
    }))
    .slice(0, 6)

  const STATUS_COLORS: Record<string, string> = {
    NEW: '#3B82F6', CONTACTED: '#F59E0B', QUALIFIED: '#10B981',
    PROPOSAL_SENT: '#6366F1', NEGOTIATION: '#8B5CF6', CONVERTED: '#10B981', LOST: '#EF4444'
  }

  return (
    <div className="animate-fade-in">
      {showTour && (
        <WelcomeTour verticalName={verticalName} entityName={cfg.entityName} onDismiss={dismissTour} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: 'var(--primary-500)' }} /> {cfg.dashboardTitle}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {cfg.dashboardSubtitle} — {session?.user?.tenantName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}><RefreshCw size={14} /> Refresh</button>
          <Link href="/dashboard/leads">
            <button className="btn btn-primary btn-sm"><Plus size={14} /> New {cfg.entityName}</button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertTriangle size={16} /> {error}</div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpiCards.map((card, i) => (
          <StatCard key={i} title={card.title} value={card.value} icon={card.icon} iconBg={card.bg} iconColor={card.color} />
        ))}
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Deals', value: kpis.totalDeals, color: '#6366F1' },
          { label: 'Won This Month', value: kpis.wonDealsThisMonth, color: '#10B981' },
          { label: 'Active Contacts', value: kpis.activeContacts, color: '#06B6D4' },
          { label: 'Open Tickets', value: kpis.openTickets, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Pipeline Value by Stage */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--primary-500)" /> {cfg.pipelineName}
          </h3>
          {data?.pipeline?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-raised)' }} contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="totalValue" radius={[6, 6, 0, 0]}>
                  {data.pipeline.map((entry, i) => <Cell key={i} fill={entry.color || '#6366F1'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <BarChart3 size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>No pipeline data yet</p>
            </div>
          )}
        </div>

        {/* Status Distribution for this vertical */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="#F59E0B" /> {cfg.entityNamePlural} by Stage
          </h3>
          {statusBreakdown.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || '#6366F1'} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <PieChart size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>No {cfg.entityNamePlural.toLowerCase()} yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Trend + Tickets Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="#6366F1" /> {cfg.entityName} Trends (7 days)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.submissionTrends || []} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <RechartsTooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 4, stroke: '#6366F1', strokeWidth: 2, fill: 'white' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeadphonesIcon size={16} color="#F59E0B" /> Tickets by Priority
          </h3>
          {data?.ticketsByPriority?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPieChart>
                <Pie data={data.ticketsByPriority.map(t => ({ name: t.priority, value: t._count.id }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.ticketsByPriority.map((entry, i) => {
                    const colors: Record<string, string> = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#F97316', URGENT: '#EF4444', CRITICAL: '#DC2626' }
                    return <Cell key={i} fill={colors[entry.priority] || '#6366F1'} />
                  })}
                </Pie>
                <RechartsTooltip contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <CheckSquare size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px' }}>No open tickets — great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Records */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} color="#10B981" /> Recent {cfg.entityNamePlural}
          </h3>
          <Link href="/dashboard/leads">
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }}>View all <ArrowUpRight size={12} /></button>
          </Link>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Assigned To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentLeads?.length ? data.recentLeads.map((lead, i) => {
                const statusLabel = cfg.statusLabels[lead.status] || lead.status
                const statusColor = STATUS_COLORS[lead.status] || '#64748B'
                return (
                  <tr key={lead.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
                    <td style={{ fontWeight: 600 }}>{lead.firstName} {lead.lastName}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{lead.company || '—'}</td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${statusColor}15`, color: statusColor }}>
                        {statusLabel}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.source?.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : '—'}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No {cfg.entityNamePlural.toLowerCase()} yet. <Link href="/dashboard/leads" style={{ color: 'var(--primary-500)' }}>Add your first {cfg.entityName.toLowerCase()}</Link>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
