'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DollarSign, Plus, Eye, Edit, Building2, Calendar,
  LayoutGrid, List, X, TrendingUp, Loader2, RefreshCw,
  AlertCircle, Trash2, FileDown, User,
} from 'lucide-react'
import Link from 'next/link'
import { generateQuotationPDF } from '@/lib/pdf-gen'

interface Deal {
  id: string
  title: string
  value: number
  probability: number
  status: string
  priority: string
  expectedCloseDate: string | null
  description: string | null
  createdAt: string
  currency: string
  stage: { id: string; name: string; color: string; probability?: number } | null
  pipeline: { id: string; name: string } | null
  contact: { id: string; firstName: string; lastName: string; company: string | null; email?: string } | null
  assignedTo: { id: string; firstName: string; lastName: string; avatar: string | null } | null
  branch: { id: string; name: string } | null
  products: any[]
  _count: { activities: number; products: number }
}

interface PipelineStage { id: string; name: string; color: string; deals: Deal[] }

import { useSession } from 'next-auth/react'

export default function DealsPage() {
  const { data: session } = useSession()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [summary, setSummary] = useState({ totalDeals: 0, totalValue: 0, wonDeals: 0, wonValue: 0 })
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [tenant, setTenant] = useState<any>(null)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    try {
      const [dealsRes, pipelineRes, settingsRes] = await Promise.all([
        fetch('/api/deals?limit=100'),
        fetch('/api/pipeline'),
        fetch('/api/settings'),
      ])
      if (!dealsRes.ok) throw new Error('Failed to fetch deals')
      const dealsData = await dealsRes.json()
      setDeals(dealsData.deals)
      setSummary(dealsData.summary || { totalDeals: 0, totalValue: 0, wonDeals: 0, wonValue: 0 })

      if (pipelineRes.ok) {
        const pipelineData = await pipelineRes.json()
        if (pipelineData.pipelines?.[0]?.stages) {
          setPipeline(pipelineData.pipelines[0].stages)
        }
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setTenant(settingsData.user?.tenant || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const handleGeneratePDF = (deal: Deal) => {
    if (!tenant) return setError('Tenant settings not loaded')
    generateQuotationPDF(deal, tenant)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          value: form.get('value'),
          expectedCloseDate: form.get('expectedCloseDate'),
          description: form.get('description'),
          priority: form.get('priority'),
        }),
      })
      if (!res.ok) throw new Error('Failed to create deal')
      setShowCreateModal(false)
      fetchDeals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusDrop = async (dealId: string, newStageId: string) => {
    if (session?.user?.role === 'VIEWER') return 
    // Optimistic update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: { ...d.stage!, id: newStageId } } : d))

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: newStageId }),
      })
      if (!res.ok) throw new Error('Failed to update stage')
      fetchDeals()
    } catch (err) {
      setError('Failed to update deal stage')
      fetchDeals()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await fetch(`/api/deals/${id}`, { method: 'DELETE' })
    fetchDeals()
  }

  const openDeals = deals.filter(d => d.status === 'OPEN')
  const totalPipeline = openDeals.reduce((sum, d) => sum + Number(d.value), 0)
  const winRate = summary.totalDeals > 0 ? Math.round((summary.wonDeals / summary.totalDeals) * 100) : 0
  const avgDealSize = openDeals.length > 0 ? Math.round(totalPipeline / openDeals.length) : 0

  // Build board stages from pipeline data or deduced from deals
  const boardStages = pipeline.length > 0
    ? pipeline.map(stage => ({
        id: stage.id,
        name: stage.name,
        color: stage.color || '#6366F1',
        deals: stage.deals || deals.filter(d => d.stage?.id === stage.id),
      }))
    : [
        { id: 'QUAL', name: 'Qualification', color: '#3B82F6', deals: deals.filter(d => d.stage?.name === 'Qualification') },
        { id: 'NEED', name: 'Needs Analysis', color: '#8B5CF6', deals: deals.filter(d => d.stage?.name === 'Needs Analysis') },
        { id: 'PROP', name: 'Proposal', color: '#F59E0B', deals: deals.filter(d => d.stage?.name === 'Proposal') },
        { id: 'NEGO', name: 'Negotiation', color: '#06B6D4', deals: deals.filter(d => d.stage?.name === 'Negotiation') },
        { id: 'WON', name: 'Closed Won', color: '#10B981', deals: deals.filter(d => d.status === 'WON') },
        { id: 'LOST', name: 'Closed Lost', color: '#EF4444', deals: deals.filter(d => d.status === 'LOST') },
      ]

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} style={{ color: '#10B981' }} /> Deals Pipeline
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Track and manage your sales deals</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setViewMode('board')}><LayoutGrid size={14} /> Board</button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setViewMode('list')}><List size={14} /> List</button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchDeals}><RefreshCw size={14} /></button>
          {session?.user?.role !== 'VIEWER' && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Add Deal</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Pipeline', value: formatCurrency(totalPipeline), color: '#6366F1' },
          { label: 'Won Revenue', value: formatCurrency(summary.wonValue || 0), color: '#10B981' },
          { label: 'Win Rate', value: `${winRate}%`, color: '#F59E0B' },
          { label: 'Avg Deal Size', value: formatCurrency(avgDealSize), color: '#06B6D4' },
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spinner" /> Loading deals...
        </div>
      ) : viewMode === 'board' ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          {boardStages.map((stage) => {
            const stageTotal = stage.deals.reduce((sum: number, d: Deal) => sum + Number(d.value), 0)
            return (
              <div
                key={stage.id || stage.name}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'var(--surface-raised)' }}
                onDragLeave={e => { e.currentTarget.style.background = 'var(--surface-bg)' }}
                onDrop={e => {
                  e.preventDefault()
                  e.currentTarget.style.background = 'var(--surface-bg)'
                  const dealId = e.dataTransfer.getData('dealId')
                  if (dealId && stage.id) handleStatusDrop(dealId, stage.id)
                }}
                style={{ minWidth: '300px', flex: 1, background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', overflow: 'hidden' }}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', borderTop: `3px solid ${stage.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{stage.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: `${stage.color}15`, color: stage.color }}>{stage.deals.length}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(stageTotal)}</div>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}>
                  {stage.deals.map((deal: Deal) => (
                    <div
                      key={deal.id}
                      draggable={session?.user?.role !== 'VIEWER'}
                      onDragStart={e => {
                        if (session?.user?.role === 'VIEWER') return
                        e.dataTransfer.setData('dealId', deal.id)
                      }}
                      style={{ padding: '14px', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--surface-border)', cursor: 'grab', transition: 'all 150ms' }}
                      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                      onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                    >
                      <Link href={`/dashboard/deals/${deal.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', cursor: 'pointer' }} className="hover-primary">{deal.title}</div>
                      </Link>
                      {deal.contact && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Building2 size={12} color="var(--text-muted)" />
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{deal.contact.company || `${deal.contact.firstName} ${deal.contact.lastName}`}</span>
                        </div>
                      )}
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', marginBottom: '8px' }}>{formatCurrency(Number(deal.value))}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {deal.expectedCloseDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <Calendar size={11} /> {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        )}
                        {deal.assignedTo && (
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                            {deal.assignedTo.firstName[0]}{deal.assignedTo.lastName[0]}
                          </div>
                        )}
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleGeneratePDF(deal)} style={{ color: '#6366F1' }} title="Generate Quotation"><FileDown size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {stage.deals.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: '13px', border: '2px dashed var(--surface-border)', borderRadius: '10px', padding: '24px' }}>
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead><tr><th>Deal</th><th>Contact</th><th>Value</th><th>Stage</th><th>Probability</th><th>Assigned To</th><th>Close Date</th><th>Actions</th></tr></thead>
              <tbody>
                {deals.map((deal, i) => (
                  <tr key={deal.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}>
                    <td style={{ fontWeight: 600 }}>{deal.title}</td>
                    <td>
                      {deal.contact ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={14} color="var(--text-muted)" />
                          {deal.contact.company || `${deal.contact.firstName} ${deal.contact.lastName}`}
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{formatCurrency(Number(deal.value))}</td>
                    <td>
                      {deal.stage && (
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: `${deal.stage.color}15`, color: deal.stage.color }}>{deal.stage.name}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden', maxWidth: '60px' }}>
                          <div style={{ height: '100%', width: `${deal.probability}%`, background: deal.probability >= 70 ? '#10B981' : deal.probability >= 40 ? '#F59E0B' : '#EF4444', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{deal.probability}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.assignedTo ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}` : '—'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleGeneratePDF(deal)} style={{ color: '#6366F1' }} title="Generate Quotation"><FileDown size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></button>
                        {session?.user?.role !== 'VIEWER' && (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm"><Edit size={14} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(deal.id)} style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowCreateModal(false)}>
          <div className="card animate-scale-in" style={{ width: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Deal</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><label className="label">Deal Title *</label><input name="title" className="input" placeholder="e.g., Enterprise License Agreement" required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label className="label">Deal Value *</label><input name="value" className="input" type="number" placeholder="₹ 0" required /></div>
                  <div><label className="label">Expected Close Date</label><input name="expectedCloseDate" className="input" type="date" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label">Priority</label>
                    <select name="priority" className="input"><option value="LOW">Low</option><option value="MEDIUM" selected>Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select>
                  </div>
                </div>
                <div><label className="label">Description</label><textarea name="description" className="input" rows={3} placeholder="Deal description..." style={{ resize: 'vertical' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Create Deal</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
