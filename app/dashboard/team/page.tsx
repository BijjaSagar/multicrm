'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, Mail, Phone, Shield, Plus,
  Loader2, RefreshCw, AlertCircle, Building2,
} from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  status: string
  lastLoginAt: string | null
  branch: { id: string; name: string } | null
  _count: { assignedLeads: number; assignedDeals: number; assignedTickets: number }
}

const roleColors: Record<string, { bg: string; color: string }> = {
  SUPER_ADMIN: { bg: 'rgba(239,68,68,.1)', color: '#EF4444' },
  TENANT_ADMIN: { bg: 'rgba(245,158,11,.1)', color: '#F59E0B' },
  BRANCH_MANAGER: { bg: 'rgba(139,92,246,.1)', color: '#8B5CF6' },
  SALES_MANAGER: { bg: 'rgba(59,130,246,.1)', color: '#3B82F6' },
  SALES_REP: { bg: 'rgba(16,185,129,.1)', color: '#10B981' },
  SUPPORT_MANAGER: { bg: 'rgba(6,182,212,.1)', color: '#06B6D4' },
  SUPPORT_AGENT: { bg: 'rgba(99,102,241,.1)', color: '#6366F1' },
  VIEWER: { bg: 'rgba(107,114,128,.1)', color: '#6B7280' },
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/team?search=${search}`)
      if (!res.ok) throw new Error('Failed to load team')
      const data = await res.json()
      setMembers(data.users || data.team || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const active = members.filter(m => m.status === 'ACTIVE')

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} style={{ color: '#6366F1' }} /> Team members
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total {members.length} members ({active.length} active)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchTeam} title="Refresh list"><RefreshCw size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => alert('Invite System: Redirecting to invite form...')} style={{ gap: '8px' }}>
            <Plus size={16} /> Invite Member
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search team members..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }} />
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spinner" /> Loading team...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {members.map((member, i) => (
            <div key={member.id} className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, hsl(${(member.firstName.charCodeAt(0) * 12) % 360}, 65%, 55%), hsl(${(member.firstName.charCodeAt(0) * 12 + 40) % 360}, 65%, 45%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{member.firstName} {member.lastName}</div>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: roleColors[member.role]?.bg || roleColors.VIEWER.bg, color: roleColors[member.role]?.color || roleColors.VIEWER.color }}>
                    {member.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: member.status === 'ACTIVE' ? '#10B981' : '#6B7280' }} title={member.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Mail size={14} color="var(--text-muted)" /> {member.email}</div>
                {member.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Phone size={14} color="var(--text-muted)" /> {member.phone}</div>}
                {member.branch && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Building2 size={14} color="var(--text-muted)" /> {member.branch.name}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
                {[
                  { label: 'Leads', value: member._count.assignedLeads },
                  { label: 'Deals', value: member._count.assignedDeals },
                  { label: 'Tickets', value: member._count.assignedTickets },
                ].map((stat, si) => (
                  <div key={si} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {member.lastLoginAt && (
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Last login: {new Date(member.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
