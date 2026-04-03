'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  User, Mail, Phone, Building2, MapPin, Calendar, 
  Clock, Plus, MoreHorizontal, ArrowLeft, Loader2,
  PhoneCall, Video, CheckCircle2, MessageSquare, AlertCircle,
  TrendingUp, Star, Filter, Search, Edit3, Trash2
} from 'lucide-react'

interface Activity {
  id: string
  type: string
  subject: string
  description: string | null
  scheduledAt: string | null
  createdAt: string
  user: { firstName: string; lastName: string }
}

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  status: string
  source: string
  priority: string
  score: number
  expectedRevenue: number | null
  notes: string | null
  createdAt: string
  assignedTo: { id: string; firstName: string; lastName: string; avatar: string | null } | null
  activities: Activity[]
}

const statusColors: Record<string, string> = {
  NEW: '#3B82F6',
  CONTACTED: '#F59E0B',
  QUALIFIED: '#10B981',
  LOST: '#EF4444',
}

const typeIcons: Record<string, any> = {
  CALL: PhoneCall,
  MEETING: Video,
  EMAIL: Mail,
  TASK: CheckCircle2,
  NOTE: MessageSquare,
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'activities'>('timeline')
  
  // Activity Logging State
  const [showLogModal, setShowLogModal] = useState(false)
  const [logging, setLogging] = useState(false)
  const [converting, setConverting] = useState(false)

  const fetchLead = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${id}`)
      if (!res.ok) throw new Error('Lead not found')
      const data = await res.json()
      setLead(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchLead() }, [fetchLead])

  const handleLogActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLogging(true)
    const form = new FormData(e.currentTarget)
    const data = {
      leadId: id,
      type: form.get('type'),
      subject: form.get('subject'),
      description: form.get('description'),
      scheduledAt: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to log')
      setShowLogModal(false)
      fetchLead()
    } catch (err) {
       console.error(err)
    } finally {
      setLogging(false)
    }
  }

  const handleConvertToDeal = async () => {
    if (!confirm('Convert this lead into a deal?')) return
    setConverting(true)
    try {
      const res = await fetch(`/api/leads/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Conversion failed')
      const data = await res.json()
      alert('Lead successfully converted to a deal!')
      router.push(`/dashboard/deals/${data.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error converting lead')
    } finally {
      setConverting(false)
    }
  }

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <Loader2 size={32} className="spinner" />
    </div>
  )

  if (!lead) return <div>Not found</div>

  return (
    <div className="animate-fade-in">
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{lead.firstName} {lead.lastName}</h1>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: `${statusColors[lead.status]}15`, color: statusColors[lead.status] }}>
              {lead.status}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: lead.score >= 70 ? '#10B981' : '#F59E0B' }}>
               <Star size={12} fill="currentColor" /> {lead.score} Score
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> {lead.company || 'Individual'}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {lead.email || 'No email'}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {lead.phone || 'No phone'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn btn-secondary" onClick={() => setShowLogModal(true)}><Plus size={16} /> Log Activity</button>
           <button 
             className="btn btn-primary" 
             onClick={handleConvertToDeal} 
             disabled={converting || lead.status === 'CONVERTED'}
           >
             {converting ? <Loader2 size={16} className="spinner" /> : 'Convert to Deal'}
           </button>
           <button className="btn btn-ghost btn-icon"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0' }}>
            {['timeline', 'details', 'activities'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{ 
                  padding: '12px 4px', fontSize: '14px', fontWeight: 700, color: activeTab === tab ? 'var(--primary-500)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === tab ? 'var(--primary-500)' : 'transparent'}`,
                  background: 'none', cursor: 'pointer', textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'timeline' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '19px', top: '0', bottom: '0', width: '2px', background: 'var(--surface-border)' }} />
                
                {/* Timeline Items */}
                {lead.activities?.map((activity, i) => {
                  const Icon = typeIcons[activity.type] || MessageSquare
                  return (
                    <div key={activity.id} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1, animationDelay: `${i * 100}ms` }} className="animate-fade-in-up">
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-raised)', border: '4px solid var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)', flexShrink: 0 }}>
                         <Icon size={18} />
                      </div>
                      <div style={{ flex: 1, padding: '16px', background: 'var(--surface-raised)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                           <span style={{ fontSize: '14px', fontWeight: 700 }}>{activity.subject}</span>
                           <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activity.description}</p>
                        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>
                              {activity.user.firstName[0]}
                           </div>
                           Logged by {activity.user.firstName}
                        </div>
                      </div>
                    </div>
                  )
                })}

                <div style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-border)', border: '4px solid var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                      <Plus size={16} />
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px' }}>Lead created on {new Date(lead.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="var(--primary-500)" /> Revenue Forecast
              </h3>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {lead.expectedRevenue ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lead.expectedRevenue) : '₹ 0'}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Expected Deal Value</p>
           </div>

           <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Ownership</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                  {lead.assignedTo?.firstName[0] || 'U'}
                </div>
                <div>
                   <div style={{ fontSize: '14px', fontWeight: 700 }}>{lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned'}</div>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Assigned Sales Rep</div>
                </div>
              </div>
           </div>

           <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800 }}>Notes</h3>
                <button className="btn btn-ghost btn-xs">Edit</button>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                 {lead.notes || 'No notes added yet...'}
              </p>
           </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowLogModal(false)}>
          <div className="card animate-scale-in" style={{ width: '500px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Log New Activity</h2>
            <form onSubmit={handleLogActivity}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Activity Type</label>
                  <select name="type" className="input">
                    <option value="CALL">📞 Phone Call</option>
                    <option value="MEETING">🤝 Meeting</option>
                    <option value="EMAIL">📧 Email Sent</option>
                    <option value="NOTE">📝 Internal Note</option>
                    <option value="TASK">✅ Task Completed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input name="subject" className="input" placeholder="e.g., Initial discovery call" required />
                </div>
                <div>
                  <label className="label">Details / Outcome</label>
                  <textarea name="description" className="input" rows={4} placeholder="What was discussed?" />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={logging}>
                    {logging ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />} Log Activity
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
