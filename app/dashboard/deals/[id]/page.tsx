'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  DollarSign, Mail, Phone, Building2, Calendar, 
  Clock, Plus, MoreHorizontal, ArrowLeft, Loader2,
  PhoneCall, Video, CheckCircle2, MessageSquare, 
  TrendingUp, Star, Edit3, Trash2, FileDown, 
  ChevronRight, Target, ShieldCheck, User, X, Download
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

interface Deal {
  id: string
  title: string
  value: number
  probability: number
  status: string
  priority: string
  description: string | null
  createdAt: string
  expectedCloseDate: string | null
  stage: { name: string; color: string } | null
  contact: { id: string; firstName: string; lastName: string; company: string | null; email: string | null; phone: string | null } | null
  assignedTo: { firstName: string; lastName: string } | null
  activities: Activity[]
}

const statusColors: Record<string, string> = {
  OPEN: '#3B82F6',
  WON: '#10B981',
  LOST: '#EF4444',
}

const typeIcons: Record<string, any> = {
  CALL: PhoneCall,
  MEETING: Video,
  EMAIL: Mail,
  TASK: CheckCircle2,
  NOTE: MessageSquare,
}

export default function DealDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'activities'>('timeline')
  
  // Activity Logging State
  const [showLogModal, setShowLogModal] = useState(false)
  const [logging, setLogging] = useState(false)

  const fetchDeal = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deals/${id}`)
      if (!res.ok) throw new Error('Deal not found')
      const data = await res.json()
      setDeal(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchDeal() }, [fetchDeal])

  const handleLogActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLogging(true)
    const form = new FormData(e.currentTarget)
    const data = {
      dealId: id,
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
      fetchDeal()
    } catch (err) {
       console.error(err)
    } finally {
      setLogging(false)
    }
  }

  const [showQuotation, setShowQuotation] = useState(false)
  
  const handleGetQuotation = () => {
    setShowQuotation(true)
  }

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <Loader2 size={32} className="spinner" />
    </div>
  )

  if (!deal) return <div>Not found</div>

  return (
    <div className="animate-fade-in">
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-ghost btn-icon" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{deal.title}</h1>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, background: `${deal.stage?.color || '#3B82F6'}15`, color: deal.stage?.color || '#3B82F6' }}>
              {deal.stage?.name || 'Qualification'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-raised)', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
               <Target size={12} /> {deal.probability}% Prob.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
             {deal.contact && (
               <>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> {deal.contact.company || `${deal.contact.firstName} ${deal.contact.lastName}`}</span>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {deal.contact.email}</span>
               </>
             )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
           <button className="btn btn-secondary" onClick={() => setShowLogModal(true)}><Plus size={16} /> Log Call/Task</button>
           <button className="btn btn-primary" onClick={handleGetQuotation}><FileDown size={16} /> Get Quotation</button>
           <button className="btn btn-ghost btn-icon"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
             <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>Deal Value</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value)}</div>
             </div>
             <div className="card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-500)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>Close Date</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'TBD'}</div>
             </div>
             <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>Priority</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{deal.priority}</div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--surface-border)' }}>
            {['timeline', 'details', 'activities'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '12px 4px', fontSize: '14px', fontWeight: 700, color: activeTab === tab ? 'var(--primary-500)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === tab ? 'var(--primary-500)' : 'transparent'}`, background: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'timeline' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '19px', top: '0', bottom: '0', width: '2px', background: 'var(--surface-border)' }} />
                
                {deal.activities?.map((activity, i) => {
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
                           Logged by {activity.user.firstName}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Primary Contact</h3>
              {deal.contact ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{deal.contact.firstName} {deal.contact.lastName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{deal.contact.company}</div>
                      </div>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => router.push(`/dashboard/contacts?edit=${deal.contact?.id}`)}><Edit3 size={14} /></button>
                   </div>
                   <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} /> {deal.contact.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={12} /> {deal.contact.phone}</span>
                   </div>
                </div>
              ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No contact linked.</p>}
           </div>

           <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Deal Owner</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700 }}>
                  {deal.assignedTo?.firstName[0] || 'U'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{deal.assignedTo ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}` : 'Unassigned'}</div>
              </div>
           </div>
        </div>
      </div>

      {showLogModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowLogModal(false)}>
          <div className="card animate-scale-in" style={{ width: '500px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Log Performance</h2>
             <form onSubmit={handleLogActivity}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Focus Area</label>
                  <select name="type" className="input">
                    <option value="CALL">📞 Sales Call</option>
                    <option value="MEETING">🤝 client Meeting</option>
                    <option value="EMAIL">📧 Quote Sent</option>
                    <option value="NOTE">📝 Strategic Note</option>
                    <option value="TASK">✅ Contract Action</option>
                  </select>
                </div>
                <div><label className="label">Subject</label><input name="subject" className="input" placeholder="e.g., Pricing negotiation" required /></div>
                <div><label className="label">Details</label><textarea name="description" className="input" rows={4} /></div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={logging}>{logging ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />} Save Log</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {showQuotation && deal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowQuotation(false)}>
          <div className="card animate-scale-in" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0', borderRadius: '16px', background: 'var(--surface-bg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(to right, #0F172A, #1E293B)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>Quotation Preview</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Estimate for {deal.title}</p>
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-icon btn-ghost" style={{ color: 'white' }} onClick={() => window.print()}><FileDown size={18} /></button>
                  <button className="btn btn-icon btn-ghost" style={{ color: 'white' }} onClick={() => setShowQuotation(false)}><X size={18} /></button>
               </div>
            </div>
            
            <div id="quotation-print" style={{ padding: '60px', background: 'white', color: '#1E293B' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>QUOTATION</h1>
                    <div style={{ fontSize: '14px', color: '#64748B' }}>#{deal.id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px' }}>MultiCRM Pvt Ltd</div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>info@multicrm.com<br/>www.multicrm.com</div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#94A3B8', marginBottom: '8px' }}>Bill To</div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{deal.contact?.firstName} {deal.contact?.lastName}</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>{deal.contact?.company}</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>{deal.contact?.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#94A3B8', marginBottom: '8px' }}>Quotation Details</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>Date: **{new Date().toLocaleDateString()}**</div>
                    <div style={{ fontSize: '14px', color: '#475569' }}>Valid Until: **{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}**</div>
                  </div>
               </div>

               <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '12px' }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748B' }}>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '24px 0' }}>
                         <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B' }}>{deal.title}</div>
                         <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>Service implementation and enterprise license with {deal.probability}% probability.</div>
                      </td>
                      <td style={{ textAlign: 'right', padding: '24px 0', fontWeight: 800, fontSize: '16px' }}>
                         {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value)}
                      </td>
                    </tr>
                  </tbody>
               </table>

               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '240px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '14px', color: '#64748B' }}>Subtotal</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '14px', color: '#64748B' }}>Tax (0%)</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>₹0.00</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', marginTop: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 900 }}>Total</span>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#3B82F6' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value)}</span>
                     </div>
                  </div>
               </div>

               <div style={{ marginTop: '100px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                     * This is a computer generated quotation and does not require physical signature. *
                  </div>
               </div>
            </div>

            <div style={{ padding: '20px 32px', background: 'var(--surface-raised)', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--surface-border)' }}>
               <button className="btn btn-secondary" onClick={() => setShowQuotation(false)}>Close</button>
               <button className="btn btn-primary" onClick={() => window.print()}><Download size={16} /> Download PDF</button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden; }
              #quotation-print, #quotation-print * { visibility: visible; }
              #quotation-print { position: fixed; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 40px; }
            }
          `}} />
        </div>
      )}
    </div>
  )
}
