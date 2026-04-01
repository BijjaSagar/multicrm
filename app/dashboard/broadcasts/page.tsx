'use client'

import { useState, useEffect } from 'react'
import { 
  Send, MessageSquare, Mail, Users, Filter, 
  Search, CheckCircle2, AlertCircle, Loader2,
  Clock, BarChart3, Plus, Trash2, Calendar,
  MoreHorizontal, Play, Pause, ChevronRight
} from 'lucide-react'

interface Broadcast {
  id: string
  name: string
  type: 'WHATSAPP' | 'EMAIL'
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED'
  recipientCount: number
  sentCount: number
  openCount?: number
  clickCount?: number
  createdAt: string
  scheduledAt?: string
}

const statusColors: Record<string, string> = {
  DRAFT: '#6B7280',
  SCHEDULED: '#3B82F6',
  SENDING: '#8B5CF6',
  COMPLETED: '#10B981',
  PAUSED: '#F59E0B',
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [step, setStep] = useState(1)
  
  // Create state
  const [newBroadcast, setNewBroadcast] = useState({
    name: '',
    type: 'WHATSAPP',
    templateId: '',
    message: '',
    segment: 'ALL_LEADS'
  })

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/broadcasts')
      if (res.ok) {
        const data = await res.json()
        setBroadcasts(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBroadcasts()
  }, [])

  const handleLaunch = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBroadcast),
      })
      if (!res.ok) throw new Error('Failed to launch')
      setShowCreateModal(false)
      fetchBroadcasts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error launching campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send size={24} color="var(--primary-500)" /> Broadcast Center
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Reach your leads and customers at scale</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setStep(1); setShowCreateModal(true) }}><Plus size={16} /> New Broadcast</button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
         {[
           { label: 'Total Sent', value: '45,280', icon: Send, color: 'var(--primary-500)' },
           { label: 'Avg Open Rate', value: '82%', icon: BarChart3, color: '#10B981' },
           { label: 'Scheduled', value: '12', icon: Calendar, color: '#3B82F6' },
           { label: 'Est. Delivery', value: 'Instant', icon: Clock, color: '#8B5CF6' },
         ].map((stat, i) => (
           <div key={i} className="card animate-fade-in-up" style={{ padding: '20px', animationDelay: `${i * 100}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{stat.label}</div>
                   <div style={{ fontSize: '24px', fontWeight: 800 }}>{stat.value}</div>
                 </div>
                 <div style={{ padding: '8px', borderRadius: '10px', background: `${stat.color}10`, color: stat.color }}>
                    <stat.icon size={18} />
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Main Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Search broadcasts..." style={{ paddingLeft: '38px' }} />
           </div>
           <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm"><Filter size={14} /> Filter</button>
           </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>
             <Loader2 size={32} className="spinner" />
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Performance</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                 {broadcasts.map((b) => (
                   <tr key={b.id}>
                     <td>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{b.name}</div>
                     </td>
                     <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                          {b.type === 'WHATSAPP' ? <MessageSquare size={14} color="#128C7E" /> : <Mail size={14} color="var(--primary-500)" />}
                          {b.type}
                       </div>
                     </td>
                     <td>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: `${statusColors[b.status]}15`, color: statusColors[b.status] }}>
                           {b.status}
                        </span>
                     </td>
                     <td>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{b.recipientCount}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>contacts</div>
                     </td>
                     <td>
                        <div style={{ width: '120px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 700 }}>{Math.round((b.sentCount / b.recipientCount) * 100)}%</span>
                              <span style={{ color: 'var(--text-muted)' }}>{b.sentCount} sent</span>
                           </div>
                           <div style={{ height: '6px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(b.sentCount / b.recipientCount) * 100}%`, background: 'var(--primary-500)', borderRadius: '3px' }} />
                           </div>
                        </div>
                     </td>
                     <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                     <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                           {b.status === 'PAUSED' && <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#10B981' }}><Play size={14} /></button>}
                           {b.status === 'SENDING' && <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#F59E0B' }}><Pause size={14} /></button>}
                           <button className="btn btn-ghost btn-icon btn-sm"><MoreHorizontal size={14} /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
           <div className="card animate-scale-in" style={{ width: '600px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={20} />
                 </div>
                 <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Create New Broadcast</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step {step} of 2</p>
                 </div>
              </div>

              <div style={{ padding: '32px' }}>
                 {step === 1 ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                         <label className="label">Campaign Name</label>
                         <input className="input" placeholder="e.g. Easter Promo 2024" value={newBroadcast.name} onChange={e => setNewBroadcast({...newBroadcast, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="label">Channel Type</label>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div 
                              onClick={() => setNewBroadcast({...newBroadcast, type: 'WHATSAPP'})}
                              style={{ padding: '16px', border: `2px solid ${newBroadcast.type === 'WHATSAPP' ? 'var(--primary-500)' : 'var(--surface-border)'}`, borderRadius: '12px', cursor: 'pointer', background: newBroadcast.type === 'WHATSAPP' ? 'var(--primary-50)05' : 'transparent' }}
                            >
                               <MessageSquare size={20} color="#128C7E" style={{ marginBottom: '8px' }} />
                               <div style={{ fontWeight: 800, fontSize: '14px' }}>WhatsApp</div>
                               <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API-based bulk messaging</div>
                            </div>
                            <div 
                              onClick={() => setNewBroadcast({...newBroadcast, type: 'EMAIL'})}
                              style={{ padding: '16px', border: `2px solid ${newBroadcast.type === 'EMAIL' ? 'var(--primary-500)' : 'var(--surface-border)'}`, borderRadius: '12px', cursor: 'pointer', background: newBroadcast.type === 'EMAIL' ? 'var(--primary-50)05' : 'transparent' }}
                            >
                               <Mail size={20} color="var(--primary-500)" style={{ marginBottom: '8px' }} />
                               <div style={{ fontWeight: 800, fontSize: '14px' }}>Email</div>
                               <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Direct SMTP broadcast</div>
                            </div>
                         </div>
                      </div>
                      <div>
                         <label className="label">Target Segment</label>
                         <select className="input" value={newBroadcast.segment} onChange={e => setNewBroadcast({...newBroadcast, segment: e.target.value})}>
                            <option value="ALL_LEADS">All Active Leads</option>
                            <option value="QUALIFIED">Qualified Prospects Only</option>
                            <option value="CUSTOMERS">Existing Customers</option>
                         </select>
                      </div>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {newBroadcast.type === 'WHATSAPP' ? (
                        <>
                          <div>
                             <label className="label">Gupshup Template ID</label>
                             <input className="input" placeholder="Enter Approved Template ID" value={newBroadcast.templateId} onChange={e => setNewBroadcast({...newBroadcast, templateId: e.target.value})} />
                             <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Only pre-approved Meta templates can be used for broadcasts.</p>
                          </div>
                        </>
                      ) : (
                        <div>
                           <label className="label">Email Body (Markdown/HTML Support)</label>
                           <textarea className="input" rows={6} placeholder="Type your message here..." value={newBroadcast.message} onChange={e => setNewBroadcast({...newBroadcast, message: e.target.value})} />
                        </div>
                      )}

                      <div className="card" style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                         <div style={{ display: 'flex', gap: '12px' }}>
                            <AlertCircle size={18} color="#3B82F6" style={{ flexShrink: 0 }} />
                            <div style={{ fontSize: '12px', color: '#3B82F6', lineHeight: '1.5' }}>
                               This broadcast will be sent to **3,450** recipients. Estimated completion time is 12 minutes.
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              <div style={{ padding: '24px', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between' }}>
                 <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                 <div style={{ display: 'flex', gap: '12px' }}>
                    {step === 2 && <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>}
                    <button className="btn btn-primary" onClick={() => step === 1 ? setStep(2) : handleLaunch()} disabled={loading}>
                       {loading ? <Loader2 size={16} className="spinner" /> : (step === 1 ? <>Continue <ChevronRight size={16} /></> : <><Send size={16} /> Launch Broadcast</>)}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
