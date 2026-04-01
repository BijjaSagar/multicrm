'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, DollarSign, Building2, Calendar, User,
  Loader2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  value: number
  priority: string
  expectedCloseDate: string | null
  contact: { firstName: string; lastName: string; company: string | null } | null
  assignedTo: { firstName: string; lastName: string } | null
}

interface Stage {
  id: string
  name: string
  color: string
  probability: number
  deals: Deal[]
}

interface PipelineData {
  id: string
  name: string
  stages: Stage[]
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPipeline = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pipeline')
      if (!res.ok) throw new Error('Failed to load pipeline')
      const data = await res.json()
      setPipeline(data.pipelines?.[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPipeline() }, [fetchPipeline])

  const handleStageDrop = async (dealId: string, newStageId: string) => {
    const stage = stages.find(s => s.id === newStageId)
    const updateData: any = { stageId: newStageId }
    
    // Auto-update status if landing in Win/Loss stages (conventionally named)
    if (stage?.name.toUpperCase().includes('WON')) updateData.status = 'WON'
    if (stage?.name.toUpperCase().includes('LOST')) updateData.status = 'LOST'
    
    await fetch(`/api/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })
    fetchPipeline()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spinner" /> Loading pipeline...
      </div>
    )
  }

  const stages = pipeline?.stages || []
  const totalValue = stages.reduce((sum, s) => sum + s.deals.reduce((ds, d) => ds + Number(d.value), 0), 0)
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0)

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: '#8B5CF6' }} /> Pipeline Board
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {totalDeals} deals · {formatCurrency(totalValue)} total pipeline
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchPipeline}><RefreshCw size={14} /> Refresh</button>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', minHeight: '70vh' }}>
        {stages.map(stage => {
          const stageTotal = stage.deals.reduce((sum, d) => sum + Number(d.value), 0)
          return (
            <div
              key={stage.id}
              style={{ minWidth: '300px', flex: 1, background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = 'var(--surface-raised)' }}
              onDragLeave={e => { e.currentTarget.style.background = 'var(--surface-bg)' }}
              onDrop={e => {
                e.preventDefault()
                e.currentTarget.style.background = 'var(--surface-bg)'
                const dealId = e.dataTransfer.getData('dealId')
                if (dealId) handleStageDrop(dealId, stage.id)
              }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', borderTop: `3px solid ${stage.color || '#6366F1'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{stage.name}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: `${stage.color || '#6366F1'}15`, color: stage.color || '#6366F1' }}>{stage.deals.length}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(stageTotal)}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stage.probability}% probability</div>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflow: 'auto' }}>
                {stage.deals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('dealId', deal.id)}
                    style={{ padding: '14px', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--surface-border)', cursor: 'grab', transition: 'all 150ms' }}
                    onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{deal.title}</div>
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
                        <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                          {deal.assignedTo.firstName[0]}{deal.assignedTo.lastName[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {stage.deals.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', fontSize: '13px', border: '2px dashed var(--surface-border)', borderRadius: '10px', padding: '24px', minHeight: '120px' }}>
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
