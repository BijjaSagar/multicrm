'use client'

import { useState } from 'react'
import { 
  Zap, Plus, Trash2, Edit3, Play, Pause, AlertCircle,
  Bell, Mail, MessageSquare, UserPlus, ArrowRight,
  Clock, Calendar, Settings, ShieldCheck, Database,
  Smartphone, Monitor, Laptop, Power, RefreshCw
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  status: 'ACTIVE' | 'INACTIVE'
  executionCount: number
  lastRun?: string
}

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([
    { id: '1', name: 'Auto-Welcome New Leads', trigger: 'Lead Created', action: 'Send WhatsApp Template', status: 'ACTIVE', executionCount: 145, lastRun: '2024-03-24T10:30:00Z' },
    { id: '2', name: 'Follow-up on Stale Deals', trigger: 'Deal Inactive (3 days)', action: 'Assign Task to Owner', status: 'ACTIVE', executionCount: 22, lastRun: '2024-03-24T09:00:00Z' },
    { id: '3', name: 'High Value Deal Alert', trigger: 'Deal Value > 1,00,000', action: 'Notify Admin', status: 'INACTIVE', executionCount: 0 },
  ])

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={24} color="#F59E0B" fill="#F59E0B" /> Automation Engine
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Set up "If-This-Then-That" rules to scale your operations</p>
        </div>
        <button className="btn btn-primary"><Plus size={16} /> Create New Workflow</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {automations.map((auto) => (
            <div key={auto.id} className="card animate-fade-in-up" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              {auto.status === 'ACTIVE' && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>{auto.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-raised)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                          <Clock size={14} color="#3B82F6" /> {auto.trigger}
                       </div>
                       <ArrowRight size={14} color="var(--text-muted)" />
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-raised)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                          <Zap size={14} color="#F59E0B" /> {auto.action}
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
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last run: **{auto.lastRun ? new Date(auto.lastRun).toLocaleString() : 'Never'}**</span>
                 </div>
                 <button className={`btn btn-sm ${auto.status === 'ACTIVE' ? 'btn-ghost' : 'btn-secondary'}`} style={{ color: auto.status === 'ACTIVE' ? '#EF4444' : '#10B981' }}>
                    {auto.status === 'ACTIVE' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                 </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '16px' }}>Execution History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[1, 2, 3].map(i => (
                   <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: i < 3 ? '1px solid var(--surface-border)' : 'none' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px' }} />
                      <div>
                         <div style={{ fontSize: '12px', fontWeight: 700 }}>Welcome message sent</div>
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>32 minutes ago</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', color: 'white' }}>
              <div style={{ marginBottom: '12px' }}><ShieldCheck size={28} /></div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Pro Automation</h3>
              <p style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.5' }}>You are currently using 3/5 active workflows on the Starter plan. **Upgrade to Professional** for unlimited multi-step flows and branching logic.</p>
              <button className="btn btn-sm" style={{ background: 'white', color: 'var(--primary-600)', marginTop: '16px', fontWeight: 800, width: '100%', border: 'none' }}>Upgrade Now</button>
           </div>
        </div>
      </div>
    </div>
  )
}
