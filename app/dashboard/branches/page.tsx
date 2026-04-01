'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, Plus, MapPin, Phone, Mail, Users,
  Check, X, Loader2, RefreshCw, AlertCircle, Edit, Trash2,
  Globe, Star,
} from 'lucide-react'

interface Branch {
  id: string
  name: string
  code: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  isHeadquarters: boolean
  status: string
  createdAt: string
  _count: { users: number; leads: number; contacts: number; deals: number; tickets: number }
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/branches')
      if (!res.ok) throw new Error('Failed to load branches')
      const data = await res.json()
      setBranches(data.branches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBranches() }, [fetchBranches])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          code: form.get('code'),
          city: form.get('city'),
          state: form.get('state'),
          phone: form.get('phone'),
          email: form.get('email'),
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setShowModal(false)
      fetchBranches()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch? This will affect all associated data.')) return
    await fetch(`/api/branches/${id}`, { method: 'DELETE' })
    fetchBranches()
  }

  const totalUsers = branches.reduce((s, b) => s + b._count.users, 0)
  const totalDeals = branches.reduce((s, b) => s + b._count.deals, 0)

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={24} style={{ color: '#06B6D4' }} /> Branches
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your organization&apos;s branch offices</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchBranches}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Branch</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Branches', value: branches.length, color: '#06B6D4' },
          { label: 'Total Team Members', value: totalUsers, color: '#6366F1' },
          { label: 'Total Deals', value: totalDeals, color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
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
          <Loader2 size={20} className="spinner" /> Loading branches...
        </div>
      ) : branches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No branches configured</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {branches.map((branch, i) => (
            <div key={branch.id} className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: branch.isHeadquarters ? 'linear-gradient(135deg, #F59E0B, #EF4444)' : 'linear-gradient(135deg, #06B6D4, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {branch.isHeadquarters ? <Star size={22} color="white" /> : <Building2 size={22} color="white" />}
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{branch.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{branch.code}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {branch.isHeadquarters && <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: 'rgba(245,158,11,.1)', color: '#F59E0B' }}>HQ</span>}
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: branch.status === 'ACTIVE' ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)', color: branch.status === 'ACTIVE' ? '#10B981' : '#6B7280' }}>{branch.status}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {(branch.city || branch.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="var(--text-muted)" /> {[branch.city, branch.state, branch.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {branch.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Phone size={14} color="var(--text-muted)" /> {branch.phone}</div>}
                {branch.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Mail size={14} color="var(--text-muted)" /> {branch.email}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
                {[
                  { label: 'Users', value: branch._count.users },
                  { label: 'Leads', value: branch._count.leads },
                  { label: 'Contacts', value: branch._count.contacts },
                  { label: 'Deals', value: branch._count.deals },
                  { label: 'Tickets', value: branch._count.tickets },
                ].map((stat, si) => (
                  <div key={si} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {!branch.isHeadquarters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(branch.id)} style={{ color: '#EF4444', fontSize: '12px' }}><Trash2 size={14} /> Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div className="card animate-scale-in" style={{ width: '520px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Branch</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label className="label">Branch Name *</label><input name="name" className="input" placeholder="e.g., Mumbai Office" required /></div>
                <div><label className="label">Code *</label><input name="code" className="input" placeholder="e.g., MUM" required /></div>
                <div><label className="label">City</label><input name="city" className="input" placeholder="Mumbai" /></div>
                <div><label className="label">State</label><input name="state" className="input" placeholder="Maharashtra" /></div>
                <div><label className="label">Phone</label><input name="phone" className="input" placeholder="+91 XXXXX XXXXX" /></div>
                <div><label className="label">Email</label><input name="email" className="input" type="email" placeholder="branch@company.com" /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Create Branch</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
