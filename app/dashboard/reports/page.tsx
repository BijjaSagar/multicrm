'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, BarChart3, DollarSign, HeadphonesIcon, Users, UserPlus,
  Loader2, AlertCircle, TrendingUp, TrendingDown, Download,
  PieChart, Target, Trophy, Clock,
} from 'lucide-react'

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/reports?type=${activeTab}`)
      if (!res.ok) throw new Error('Failed to load report')
      const d = await res.json()
      setData(d)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchReport() }, [fetchReport])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sales', label: 'Sales Report', icon: DollarSign },
    { id: 'support', label: 'Support Report', icon: HeadphonesIcon },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} style={{ color: '#10B981' }} /> Reports
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Business intelligence & insights</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '4px', marginBottom: '20px', display: 'flex', gap: '4px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 200ms',
              background: activeTab === tab.id ? 'var(--primary-500)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
            }}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner" /> Generating report...
        </div>
      ) : data && (
        <div className="animate-fade-in">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Leads', value: (data.leads as number) || 0, icon: UserPlus, color: '#6366F1' },
                  { label: 'Contacts', value: (data.contacts as number) || 0, icon: Users, color: '#06B6D4' },
                  { label: 'Open Deals', value: (data.deals as number) || 0, icon: Target, color: '#F59E0B' },
                  { label: 'Tickets', value: (data.tickets as number) || 0, icon: HeadphonesIcon, color: '#EF4444' },
                ].map((kpi, i) => (
                  <div key={i} className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <kpi.icon size={20} color={kpi.color} />
                      </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: kpi.color, marginBottom: '4px' }}>{kpi.value}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} color="#F59E0B" /> Deal Outcomes
                  </h3>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: '20px', borderRadius: '12px', background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)' }}>
                      <div style={{ fontSize: '36px', fontWeight: 700, color: '#10B981' }}>{(data.wonDeals as number) || 0}</div>
                      <div style={{ fontSize: '13px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><TrendingUp size={14} /> Won</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: '20px', borderRadius: '12px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.15)' }}>
                      <div style={{ fontSize: '36px', fontWeight: 700, color: '#EF4444' }}>{(data.lostDeals as number) || 0}</div>
                      <div style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><TrendingDown size={14} /> Lost</div>
                    </div>
                  </div>
                  {((data.wonDeals as number) || 0) + ((data.lostDeals as number) || 0) > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: 'var(--surface-bg)', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1' }}>
                        {Math.round(((data.wonDeals as number) / (((data.wonDeals as number) || 0) + ((data.lostDeals as number) || 0))) * 100)}% Win Rate
                      </span>
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PieChart size={18} color="#6366F1" /> Quick Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { label: 'Conversion Rate', value: `${(data.leads as number) > 0 ? Math.round(((data.contacts as number) / (data.leads as number)) * 100) : 0}%`, desc: 'Leads → Contacts' },
                      { label: 'Pipeline Value', value: `${(data.deals as number)} deals`, desc: 'Active opportunities' },
                      { label: 'Support Load', value: `${(data.tickets as number)} tickets`, desc: 'Total support requests' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#6366F1' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SALES TAB */}
          {activeTab === 'sales' && (
            <>
              <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Deal Status Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {(data.byStage as Array<{ status: string; _count: { id: number }; _sum: { value: number | null } }>)?.map((stage, i) => {
                    const colors: Record<string, string> = { OPEN: '#6366F1', WON: '#10B981', LOST: '#EF4444', NEGOTIATION: '#F59E0B' }
                    return (
                      <div key={i} className="animate-fade-in-up" style={{ padding: '18px', borderRadius: '12px', border: '1px solid var(--surface-border)', textAlign: 'center', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
                        <div style={{ fontSize: '28px', fontWeight: 700, color: colors[stage.status] || '#8B5CF6' }}>{stage._count.id}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{stage.status}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{formatCurrency(Number(stage._sum.value) || 0)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Lead Sources</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(data.bySource as Array<{ source: string; _count: { id: number } }>)?.map((src, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{src.source || 'Unknown'}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1' }}>{src._count.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={16} color="#F59E0B" /> Top Performers</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(data.topReps as Array<{ firstName: string; lastName: string; dealCount: number; totalValue: number }>)?.map((rep, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg, hsl(${i * 50 + 200}, 63%, 55%), hsl(${i * 50 + 240}, 63%, 45%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700 }}>
                          {rep.firstName[0]}{rep.lastName[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>{rep.firstName} {rep.lastName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{Number(rep.dealCount)} deals won</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>{formatCurrency(Number(rep.totalValue))}</div>
                      </div>
                    ))}
                    {!(data.topReps as Array<unknown>)?.length && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No sales data yet</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="card animate-fade-in-up" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeadphonesIcon size={20} color="#EF4444" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#EF4444' }}>{(data.openTickets as number) || 0}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Open Tickets</div>
                </div>
                <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '80ms', animationFillMode: 'backwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16,185,129,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} color="#10B981" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#10B981' }}>
                    {(() => {
                      const arr = data.avgResolution as Array<{ avgHours: number }>
                      return arr?.[0]?.avgHours ? `${Math.round(Number(arr[0].avgHours))}h` : 'N/A'
                    })()}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg Resolution Time</div>
                </div>
                <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '160ms', animationFillMode: 'backwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={20} color="#6366F1" />
                    </div>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#6366F1' }}>
                    {(() => {
                      const statuses = data.byStatus as Array<{ status: string; _count: { id: number } }>
                      const total = statuses?.reduce((s, x) => s + x._count.id, 0) || 0
                      const resolved = statuses?.find(s => s.status === 'RESOLVED' || s.status === 'CLOSED')?._count.id || 0
                      return total > 0 ? `${Math.round((resolved / total) * 100)}%` : 'N/A'
                    })()}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Resolution Rate</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>By Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(data.byStatus as Array<{ status: string; _count: { id: number } }>)?.map((s, i) => {
                      const total = (data.byStatus as Array<{ _count: { id: number } }>).reduce((acc, x) => acc + x._count.id, 0)
                      const pct = total > 0 ? (s._count.id / total) * 100 : 0
                      const colors: Record<string, string> = { OPEN: '#EF4444', IN_PROGRESS: '#F59E0B', RESOLVED: '#10B981', CLOSED: '#6B7280', PENDING: '#6366F1' }
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{s.status.replace(/_/g, ' ')}</span>
                            <span style={{ fontWeight: 700, color: colors[s.status] || '#6B7280' }}>{s._count.id}</span>
                          </div>
                          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--surface-bg)' }}>
                            <div style={{ height: '100%', borderRadius: '3px', background: colors[s.status] || '#6B7280', width: `${pct}%`, transition: 'width 600ms' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>By Priority</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(data.byPriority as Array<{ priority: string; _count: { id: number } }>)?.map((p, i) => {
                      const total = (data.byPriority as Array<{ _count: { id: number } }>).reduce((acc, x) => acc + x._count.id, 0)
                      const pct = total > 0 ? (p._count.id / total) * 100 : 0
                      const colors: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#F59E0B', LOW: '#10B981' }
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{p.priority}</span>
                            <span style={{ fontWeight: 700, color: colors[p.priority] || '#6B7280' }}>{p._count.id}</span>
                          </div>
                          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--surface-bg)' }}>
                            <div style={{ height: '100%', borderRadius: '3px', background: colors[p.priority] || '#6B7280', width: `${pct}%`, transition: 'width 600ms' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
