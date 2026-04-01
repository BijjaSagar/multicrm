'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, Users,
  DollarSign, Target, Activity, Loader2, RefreshCw, AlertCircle, PieChart as PieIcon,
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'

interface AnalyticsData {
  monthlyTrends: Array<{ month: string; revenue: number; leads: number; deals: number }>
  leadSources: Array<{ source: string; _count: { id: number } }>
  topPerformers: Array<{ firstName: string; lastName: string; _count: { deals: number }; totalRevenue: number }>
  kpis: { totalRevenue: number; totalLeads: number; avgDealSize: number; conversionRate: number }
  forecast: { revenue: number, leads: number, confidence: number }
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

const sourceColors: Record<string, string> = {
  WEBSITE: '#6366F1', LINKEDIN: '#3B82F6', REFERRAL: '#10B981', GOOGLE_ADS: '#F59E0B',
  COLD_CALL: '#EF4444', EMAIL_CAMPAIGN: '#8B5CF6', SOCIAL_MEDIA: '#06B6D4', OTHER: '#6B7280',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('month')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spinner" /> Loading analytics...
      </div>
    )
  }

  const kpis = data?.kpis || { totalRevenue: 0, totalLeads: 0, avgDealSize: 0, conversionRate: 0 }
  const monthlyData = data?.monthlyTrends || []
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)
  const totalSourceLeads = data?.leadSources?.reduce((s, l) => s + l._count.id, 0) || 1

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: 'var(--primary-500)' }} /> Analytics
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Insights and performance metrics for your team</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['week', 'month', 'quarter', 'year'].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics}><RefreshCw size={14} /></button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Revenue', value: formatCurrency(kpis.totalRevenue), icon: DollarSign, color: '#10B981' },
          { label: 'New Leads', value: kpis.totalLeads.toLocaleString(), icon: Users, color: '#6366F1' },
          { label: 'Conversion Rate', value: `${kpis.conversionRate}%`, icon: Target, color: '#F59E0B' },
          { label: 'Avg Deal Size', value: formatCurrency(kpis.avgDealSize), icon: Activity, color: '#06B6D4' },
        ].map((kpi, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div className="stat-icon" style={{ background: `${kpi.color}15` }}><kpi.icon size={24} color={kpi.color} /></div>
            <div>
              <div className="stat-label">{kpi.label}</div>
              <div className="stat-value">{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Forecasting Header */}
      {data?.forecast && (
        <div className="card animate-fade-in-up" style={{ 
          background: 'linear-gradient(90deg, #1E293B, #0F172A)', 
          border: '1px solid rgba(99,102,241,0.2)',
          padding: '20px 24px', 
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="#6366F1" />
              </div>
              <div>
                 <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 800 }}>Predictive Intelligence</h3>
                 <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Projected performance based on {data.monthlyTrends.length} months of historical multi-channel data</p>
              </div>
           </div>
           
           <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Revenue Forecast</div>
                 <div style={{ color: '#10B981', fontSize: '20px', fontWeight: 900 }}>{formatCurrency(data.forecast.revenue)}</div>
              </div>
              <div>
                 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>New Leads Expected</div>
                 <div style={{ color: '#6366F1', fontSize: '20px', fontWeight: 900 }}>+{data.forecast.leads}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Confidence Score</div>
                 <div style={{ color: '#F59E0B', fontSize: '20px', fontWeight: 900 }}>{data.forecast.confidence}%</div>
              </div>
           </div>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Revenue Chart */}
        <div className="card" style={{ height: '400px' }}>
          <div className="card-header" style={{ marginBottom: '20px' }}>
            <h3 className="card-title">Revenue & Lead Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
              <Tooltip 
                contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}
                itemStyle={{ fontSize: '13px', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              <Area type="monotone" dataKey="leads" stroke="#10B981" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="card" style={{ height: '400px' }}>
          <div className="card-header">
            <h3 className="card-title">Lead Source Mix</h3>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={data?.leadSources || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="_count.id"
                nameKey="source"
              >
                {data?.leadSources?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={sourceColors[entry.source] || '#6366F1'} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Performers</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This {period}</span>
        </div>
        {data?.topPerformers && data.topPerformers.length > 0 ? (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead><tr><th>Rank</th><th>Team Member</th><th>Deals Closed</th><th>Revenue</th><th>Performance</th></tr></thead>
              <tbody>
                {data.topPerformers.map((performer, i) => {
                  const maxPerf = Math.max(...data.topPerformers.map(p => p.totalRevenue), 1)
                  const perfPct = (performer.totalRevenue / maxPerf) * 100
                  return (
                    <tr key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
                      <td>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: i === 0 ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : i === 1 ? 'linear-gradient(135deg, #94A3B8, #64748B)' : i === 2 ? 'linear-gradient(135deg, #D97706, #B45309)' : 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i < 3 ? 'white' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700 }}>
                          {i + 1}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                            {performer.firstName[0]}{performer.lastName[0]}
                          </div>
                          <span style={{ fontWeight: 600 }}>{performer.firstName} {performer.lastName}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '15px' }}>{performer._count.deals}</td>
                      <td style={{ fontWeight: 700, color: '#10B981' }}>{formatCurrency(performer.totalRevenue)}</td>
                      <td>
                        <div style={{ width: '100px', height: '6px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${perfPct}%`, background: '#6366F1', borderRadius: '3px' }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p>No performance data available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
