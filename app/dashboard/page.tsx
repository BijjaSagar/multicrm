'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Users, UserPlus, DollarSign, HeadphonesIcon,
  TrendingUp, TrendingDown, ArrowUpRight,
  BarChart3, Clock, CheckCircle2, AlertTriangle,
  Calendar, Plus, Loader2, RefreshCw, PieChart,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart as RechartsPieChart, Pie, Legend
} from 'recharts'

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
  recentLeads: Array<{ id: string; firstName: string; lastName: string; company: string | null; status: string; source: string; createdAt: string; assignedTo: { firstName: string; lastName: string } | null }>
  topDeals: Array<{ id: string; title: string; value: number; stage: { name: string; color: string } | null; contact: { firstName: string; lastName: string; company: string | null } | null; assignedTo: { firstName: string; lastName: string } | null }>
  pipeline: Array<{ id: string; name: string; color: string; dealCount: number; totalValue: number }>
  ticketsByPriority: Array<{ priority: string; _count: { id: number } }>
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

function StatCard({ title, value, icon: Icon, iconBg, iconColor }: { title: string; value: string | number; icon: React.ElementType; iconBg: string; iconColor: string }) {
  return (
    <div className="stat-card animate-fade-in-up">
      <div className="stat-icon" style={{ background: iconBg }}><Icon size={24} color={iconColor} /></div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spinner" />
        <span style={{ fontSize: '16px' }}>Loading dashboard...</span>
      </div>
    )
  }

  const kpis = data?.kpis || { totalLeads: 0, activeContacts: 0, openTickets: 0, totalDeals: 0, totalPipelineValue: 0, monthlyRevenue: 0, wonDealsThisMonth: 0, winRate: 0 }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: 'var(--primary-500)' }} /> Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Welcome back, {session?.user?.firstName || 'User'}. Here&apos;s your CRM overview.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}><RefreshCw size={14} /> Refresh</button>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertTriangle size={16} /> {error}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard title="Total Leads" value={kpis.totalLeads.toLocaleString()} icon={UserPlus} iconBg="rgba(99, 102, 241, 0.1)" iconColor="#6366F1" />
        <StatCard title="Active Contacts" value={kpis.activeContacts.toLocaleString()} icon={Users} iconBg="rgba(6, 182, 212, 0.1)" iconColor="#06B6D4" />
        <StatCard title="Revenue (MTD)" value={formatCurrency(kpis.monthlyRevenue)} icon={DollarSign} iconBg="rgba(16, 185, 129, 0.1)" iconColor="#10B981" />
        <StatCard title="Open Tickets" value={kpis.openTickets.toLocaleString()} icon={HeadphonesIcon} iconBg="rgba(245, 158, 11, 0.1)" iconColor="#F59E0B" />
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Pipeline Value', value: formatCurrency(kpis.totalPipelineValue || 0), color: '#6366F1' },
          { label: 'Total Deals', value: kpis.totalDeals, color: '#06B6D4' },
          { label: 'Win Rate', value: `${kpis.winRate}%`, color: '#10B981' },
          { label: 'Won This Month', value: kpis.wonDealsThisMonth, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Pipeline */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--primary-500)" /> Pipeline Value by Stage
          </h3>
          {data?.pipeline && data.pipeline.length > 0 ? (
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val>=1000?val/1000+'k':val}`} />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--surface-raised)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', padding: '12px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }}>
                            <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{payload[0].payload.name}</p>
                            <p style={{ color: payload[0].payload.color, fontWeight: 700, fontSize: '14px' }}>{formatCurrency(payload[0].value as number)}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{payload[0].payload.dealCount} deals</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="totalValue" radius={[6, 6, 0, 0]}>
                    {data.pipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'var(--primary-500)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', margin: 'auto' }}>
              <BarChart3 size={32} style={{ opacity: 0.3, marginBottom: '8px', margin: '0 auto' }} />
              <p>No pipeline data yet</p>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#F59E0B" /> Open Tickets by Priority
          </h3>
          {data?.ticketsByPriority && data.ticketsByPriority.length > 0 ? (
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.ticketsByPriority.map(t => ({ name: t.priority, value: t._count.id }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}
                    dataKey="value" stroke="none"
                  >
                    {data.ticketsByPriority.map((entry, index) => {
                      const colors: Record<string, string> = { LOW: '#10B981', MEDIUM: '#F59E0B', HIGH: '#F97316', URGENT: '#EF4444' }
                      return <Cell key={`cell-${index}`} fill={colors[entry.priority] || '#6366F1'} />
                    })}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', margin: 'auto' }}>
              <PieChart size={32} style={{ opacity: 0.3, marginBottom: '8px', margin: '0 auto' }} />
              <p>No open tickets. Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Deals */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="#10B981" /> Top Deals
        </h3>
        {data?.topDeals && data.topDeals.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr><th>Deal</th><th>Contact</th><th>Value</th><th>Stage</th><th>Owner</th></tr>
              </thead>
              <tbody>
                {data.topDeals.map((deal, i) => (
                  <tr key={deal.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}>
                    <td style={{ fontWeight: 600 }}>{deal.title}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—'}
                      {deal.contact?.company && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{deal.contact.company}</div>}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{formatCurrency(Number(deal.value))}</td>
                    <td>
                      {deal.stage && (
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${deal.stage.color}15`, color: deal.stage.color }}>{deal.stage.name}</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {deal.assignedTo ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <DollarSign size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p>No deals yet. Create your first deal to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
