'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Zap, Plus, Trash2, Edit3, Play, Pause, AlertCircle,
  Clock, ArrowRight, ShieldCheck, Loader2, RefreshCw
} from 'lucide-react'

interface AutomationAction {
  id: string
  type: string
  config: any
  order: number
}

interface Automation {
  id: string
  name: string
  triggerType: string
  triggerConfig: any
  status: 'ACTIVE' | 'INACTIVE'
  executionCount: number
  lastRunAt: string | null
  actions: AutomationAction[]
}

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/workflows')
      if (!res.ok) throw new Error('Failed to load automations')
      const data = await res.json()
      setAutomations(data.workflows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const toggleStatus = async (id: string, currentStatus: string) => {
     // TODO: Implement toggle API
     alert('Status toggle would call /api/workflows/[id] PATCH')
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={24} color="#F59E0B" fill="#F59E0B" /> Automation Engine
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Set up "If-This-Then-That" rules to scale your operations</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchWorkflows}><RefreshCw size={14} /></button>
          <button className="btn btn-primary"><Plus size={16} /> Create Plan</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
         <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spinner" /> Loading automations...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {automations.length === 0 ? (
               <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Zap size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <p>No active workflows found. Start by creating one!</p>
               </div>
            ) : (
              automations.map((auto) => (
                <div key={auto.id} className="card animate-fade-in-up" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  {auto.status === 'ACTIVE' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>{auto.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-raised)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                              <Clock size={14} color="#3B82F6" /> {auto.triggerType.replace(/_/g, ' ')}
                          </div>
                          <ArrowRight size={14} color="var(--text-muted)" />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-raised)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                              <Zap size={14} color="#F59E0B" /> {auto.actions.length} {auto.actions.length === 1 ? 'Action' : 'Actions'}
                          </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: auto.status === 'ACTIVE' ? '#10B98115' : '#6B728015', color: auto.status === 'ACTIVE' ? '#10B981' : '#6B7280' }}>
                          {auto.status}
                        </div>
                        <button className="btn btn-ghost btn-icon btn-sm"><Edit3 size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--surface-border)', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Executions: **{auto.executionCount}**</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last run: **{auto.lastRunAt ? new Date(auto.lastRunAt).toLocaleString() : 'Never'}**</span>
                    </div>
                    <button 
                      onClick={() => toggleStatus(auto.id, auto.status)}
                      className={`btn btn-sm ${auto.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'}`} 
                      style={{ color: auto.status === 'ACTIVE' ? '#EF4444' : '#10B981' }}
                    >
                        {auto.status === 'ACTIVE' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Running Triggers</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['LEAD_CREATED', 'DEAL_UPDATED', 'TICKET_ASSIGNED'].map(t => (
                    <div key={t} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px' }} />
                       <div>
                          <div style={{ fontSize: '12px', fontWeight: 700 }}>{t.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monitoring live</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', color: 'white' }}>
               <div style={{ marginBottom: '12px' }}><ShieldCheck size={28} /></div>
               <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Pro Automation</h3>
               <p style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5' }}>Unlocking deep branching logic and multi-step triggers for your enterprise workflow.</p>
               <button className="btn btn-sm" style={{ background: 'white', color: 'var(--primary-600)', marginTop: '16px', fontWeight: 800, width: '100%', border: 'none' }}>Active Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
