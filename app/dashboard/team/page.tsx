'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, Mail, Phone, Shield, Plus,
  Loader2, RefreshCw, AlertCircle, Building2,
  X, Check, Copy, Eye, EyeOff, Trash2, Edit,
} from 'lucide-react'
import { useToast } from '@/components/toast'
import { useConfirm } from '@/components/confirm-modal'
import { useSession } from 'next-auth/react'

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

const ROLES = [
  { value: 'TENANT_ADMIN', label: 'Tenant Admin' },
  { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
  { value: 'SALES_REP', label: 'Sales Rep' },
  { value: 'SUPPORT_MANAGER', label: 'Support Manager' },
  { value: 'SUPPORT_AGENT', label: 'Support Agent' },
  { value: 'VIEWER', label: 'Viewer' },
]

export default function TeamPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<{ email: string; tempPassword: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [inviteForm, setInviteForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'SALES_REP', password: '', branchId: ''
  })
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', role: '', status: '', branchId: '' })
  const [updating, setUpdating] = useState(false)

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/team?search=${search}`)
      if (!res.ok) throw new Error('Failed to load team')
      const data = await res.json()
      setMembers(data.users || data.team || [])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchTeam()
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (data.branches) setBranches(data.branches)
      })
      .catch(err => console.error('Failed to load branches:', err))
  }, [fetchTeam])

  const handleInvite = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.password) {
      setError('First name, last name, email, and password are required')
      return
    }
    setInviting(true)
    setError('')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create member')
      setInviteSuccess({ email: inviteForm.email, tempPassword: data.tempPassword })
      setInviteForm({ firstName: '', lastName: '', email: '', phone: '', role: 'SALES_REP', password: '', branchId: '' })
      fetchTeam()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create member')
    } finally {
      setInviting(false)
    }
  }

  const copyCredentials = () => {
    if (!inviteSuccess) return
    navigator.clipboard.writeText(`Email: ${inviteSuccess.email}\nPassword: ${inviteSuccess.tempPassword}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openEdit = (member: TeamMember) => {
    setEditingMember(member)
    setEditForm({
      firstName: member.firstName, lastName: member.lastName,
      phone: member.phone || '', role: member.role, status: member.status,
      branchId: member.branch?.id || '',
    })
  }

  const handleUpdate = async () => {
    if (!editingMember) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/team/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error('Update failed')
      toast.success('Team member updated')
      setEditingMember(null)
      fetchTeam()
    } catch {
      toast.error('Failed to update member')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (member: TeamMember) => {
    if (!await confirm({ title: 'Deactivate Member', message: `Deactivate ${member.firstName} ${member.lastName}? They will lose access immediately.`, danger: true, confirmLabel: 'Deactivate' })) return
    try {
      const res = await fetch(`/api/team/${member.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Member deactivated')
      fetchTeam()
    } catch {
      toast.error('Failed to deactivate member')
    }
  }

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'TENANT_ADMIN'

  const active = members.filter(m => m.status === 'ACTIVE')

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} style={{ color: '#6366F1' }} /> Team Members
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Total {members.length} members ({active.length} active)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchTeam} title="Refresh list"><RefreshCw size={14} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowInvite(true); setInviteSuccess(null); setError('') }} style={{ gap: '8px' }}>
            <Plus size={16} /> Create Member
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card animate-fade-in-up" style={{ padding: '32px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setShowInvite(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><X size={18} /></button>

            {inviteSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={28} color="#10B981" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Member Created!</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Share these credentials with the new member</p>
                
                <div style={{ background: 'var(--surface-raised)', borderRadius: '10px', padding: '16px', textAlign: 'left', marginBottom: '20px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Email</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{inviteSuccess.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Password</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
                        {showPassword ? inviteSuccess.tempPassword : '••••••••••'}
                      </div>
                    </div>
                    <button onClick={() => setShowPassword(!showPassword)} className="btn btn-ghost btn-icon btn-sm">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={copyCredentials}>
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Credentials</>}
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowInvite(false)}>Done</button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Create New Member</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>First Name *</label>
                      <input type="text" className="input" placeholder="John" value={inviteForm.firstName} onChange={e => setInviteForm({ ...inviteForm, firstName: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Last Name *</label>
                      <input type="text" className="input" placeholder="Doe" value={inviteForm.lastName} onChange={e => setInviteForm({ ...inviteForm, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Email Address *</label>
                      <input type="email" className="input" placeholder="john@company.com" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Password *</label>
                      <input type="password" className="input" placeholder="••••••••" value={inviteForm.password} onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Phone</label>
                      <input type="text" className="input" placeholder="+91 98765 43210" value={inviteForm.phone} onChange={e => setInviteForm({ ...inviteForm, phone: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Role</label>
                      <select className="input" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {branches.length > 0 && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Branch</label>
                      <select className="input" value={inviteForm.branchId} onChange={e => setInviteForm({ ...inviteForm, branchId: e.target.value })}>
                        <option value="">No Branch Assigned</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowInvite(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleInvite} disabled={inviting}>
                      {inviting ? <><Loader2 size={14} className="spinner" /> Creating...</> : <><Plus size={14} /> Create Member</>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card animate-fade-in-up" style={{ padding: '28px', maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button onClick={() => setEditingMember(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Edit Member — {editingMember.firstName} {editingMember.lastName}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">First Name</label>
                  <input className="input" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Role</label>
                  <select className="input" value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                {branches.length > 0 && (
                  <div>
                    <label className="label">Branch</label>
                    <select className="input" value={editForm.branchId} onChange={e => setEditForm(f => ({ ...f, branchId: e.target.value }))}>
                      <option value="">No Branch</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setEditingMember(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                  {updating ? <><Loader2 size={14} className="spinner" /> Saving...</> : <><Check size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {isAdmin && member.id !== session?.user?.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--surface-border)' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(member)}>
                    <Edit size={13} /> Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: '#EF4444' }} onClick={() => handleDelete(member)}>
                    <Trash2 size={13} /> Deactivate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
