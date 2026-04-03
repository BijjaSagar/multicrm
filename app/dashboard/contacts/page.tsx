'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, Search, Plus, Mail, Phone, Building2, MapPin,
  Eye, Edit, Trash2, Download, ArrowUpDown, ChevronLeft,
  ChevronRight, X, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  mobile: string | null
  company: string | null
  jobTitle: string | null
  type: string
  status: string
  city: string | null
  state: string | null
  country: string | null
  createdAt: string
  branch: { id: string; name: string } | null
  _count: { deals: number; tickets: number; activities: number }
}

const typeColors: Record<string, { bg: string; color: string }> = {
  CUSTOMER: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  PROSPECT: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' },
  PARTNER: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' },
  VENDOR: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  LEAD: { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search: searchQuery })
      if (typeFilter !== 'all') params.set('status', typeFilter)
      const res = await fetch(`/api/contacts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch contacts')
      const data = await res.json()
      setContacts(data.contacts)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, typeFilter])

  useEffect(() => {
    fetchContacts()
    // Handle ?edit=id from deep links
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('edit')
    if (editId) {
      const contactToEdit = contacts.find(c => c.id === editId)
      if (contactToEdit) {
        setEditingContact(contactToEdit)
        setShowEditModal(true)
      }
    }
  }, [fetchContacts, contacts.length]) // Trigger when contacts load

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.get('firstName'),
          lastName: form.get('lastName'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          jobTitle: form.get('jobTitle'),
          type: form.get('type'),
          city: form.get('city'),
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setShowCreateModal(false)
      fetchContacts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchContacts()
    } catch (err) {
      alert('Error deleting contact')
    }
  }

  const handleEdit = (contact: Contact, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setEditingContact(contact)
    setShowEditModal(true)
  }

  const onUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingContact) return
    setUpdating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.get('firstName'),
          lastName: form.get('lastName'),
          email: form.get('email'),
          phone: form.get('phone'),
          company: form.get('company'),
          jobTitle: form.get('jobTitle'),
          type: form.get('type'),
          city: form.get('city'),
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setShowEditModal(false)
      fetchContacts()
    } catch (err) {
      alert('Error updating contact')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} style={{ color: '#06B6D4' }} /> Contacts
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your customer and partner relationships</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--surface-border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setViewMode('grid')}>
              <Users size={14} /> Grid
            </button>
            <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ borderRadius: 0 }} onClick={() => setViewMode('list')}>
              <ArrowUpDown size={14} /> List
            </button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchContacts}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Add Contact</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Contacts', value: total, color: '#06B6D4' },
          { label: 'Active', value: contacts.filter(c => c.status === 'ACTIVE').length, color: '#10B981' },
          { label: 'With Deals', value: contacts.filter(c => c._count.deals > 0).length, color: '#6366F1' },
          { label: 'With Tickets', value: contacts.filter(c => c._count.tickets > 0).length, color: '#F59E0B' },
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{stat.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }} className="input" style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }} />
          </div>
          <select className="input" style={{ width: '150px', height: '38px', fontSize: '13px' }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="all">All Types</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PROSPECT">Prospect</option>
            <option value="PARTNER">Partner</option>
            <option value="VENDOR">Vendor</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}>
            <AlertCircle size={16} /> <span style={{ fontSize: '14px' }}>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spinner" /> Loading contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No contacts found</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Add your first contact to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {contacts.map((contact, i) => (
            <div key={contact.id} className="card animate-fade-in-up" onClick={() => handleEdit(contact)} style={{ padding: '20px', cursor: 'pointer', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards', transition: 'transform 200ms, box-shadow 200ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, hsl(${(contact.firstName.charCodeAt(0) * 15) % 360}, 65%, 55%), hsl(${(contact.firstName.charCodeAt(0) * 15 + 40) % 360}, 65%, 45%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 700, flexShrink: 0 }}>
                  {contact.firstName[0]}{contact.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{contact.firstName} {contact.lastName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{contact.jobTitle || '—'}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: typeColors[contact.type]?.bg || typeColors.CUSTOMER.bg, color: typeColors[contact.type]?.color || typeColors.CUSTOMER.color }}>{contact.type}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {contact.company && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Building2 size={14} color="var(--text-muted)" /> {contact.company}</div>}
                {contact.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><Mail size={14} color="var(--text-muted)" /> {contact.email}</div>}
                {contact.city && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}><MapPin size={14} color="var(--text-muted)" /> {contact.city}{contact.state ? `, ${contact.state}` : ''}</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div>
                     <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Deals</div>
                     <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{contact._count.deals}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tickets</div>
                     <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{contact._count.tickets}</div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                   <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleEdit(contact, e)}><Edit size={14} /></button>
                   <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleDelete(contact.id, e)} style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead><tr><th>Contact</th><th>Company</th><th>Type</th><th>Email</th><th>City</th><th>Deals</th><th>Actions</th></tr></thead>
              <tbody>
                {contacts.map((contact, i) => (
                  <tr key={contact.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `linear-gradient(135deg, hsl(${(contact.firstName.charCodeAt(0) * 15) % 360}, 65%, 55%), hsl(${(contact.firstName.charCodeAt(0) * 15 + 40) % 360}, 65%, 45%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{contact.firstName} {contact.lastName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{contact.jobTitle || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{contact.company || '—'}</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: typeColors[contact.type]?.bg, color: typeColors[contact.type]?.color }}>{contact.type}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{contact.email || '—'}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{contact.city || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{contact._count.deals}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(contact)}><Edit size={14} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleDelete(contact.id, e)} style={{ color: '#EF4444' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contacts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Showing {contacts.length} of {total}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                <span style={{ fontSize: '13px', padding: '6px 10px' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowCreateModal(false)}>
          <div className="card animate-scale-in" style={{ width: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Contact</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label className="label">First Name *</label><input name="firstName" className="input" placeholder="First name" required /></div>
                <div><label className="label">Last Name *</label><input name="lastName" className="input" placeholder="Last name" required /></div>
                <div><label className="label">Email</label><input name="email" className="input" type="email" placeholder="email@company.com" /></div>
                <div><label className="label">Phone</label><input name="phone" className="input" placeholder="+91 XXXXX XXXXX" /></div>
                <div><label className="label">Company</label><input name="company" className="input" placeholder="Company name" /></div>
                <div><label className="label">Job Title</label><input name="jobTitle" className="input" placeholder="Job title" /></div>
                <div><label className="label">Type</label><select name="type" className="input"><option value="CUSTOMER">Customer</option><option value="PROSPECT">Prospect</option><option value="PARTNER">Partner</option><option value="VENDOR">Vendor</option></select></div>
                <div><label className="label">City</label><input name="city" className="input" placeholder="City" /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Create Contact</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && editingContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowEditModal(false)}>
          <div className="card animate-scale-in" style={{ width: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Edit Contact</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={onUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label className="label">First Name *</label><input name="firstName" className="input" defaultValue={editingContact.firstName} required /></div>
                <div><label className="label">Last Name *</label><input name="lastName" className="input" defaultValue={editingContact.lastName} required /></div>
                <div><label className="label">Email</label><input name="email" className="input" type="email" defaultValue={editingContact.email || ''} /></div>
                <div><label className="label">Phone</label><input name="phone" className="input" defaultValue={editingContact.phone || ''} /></div>
                <div><label className="label">Company</label><input name="company" className="input" defaultValue={editingContact.company || ''} /></div>
                <div><label className="label">Job Title</label><input name="jobTitle" className="input" defaultValue={editingContact.jobTitle || ''} /></div>
                <div><label className="label">Type</label><select name="type" className="input" defaultValue={editingContact.type}><option value="CUSTOMER">Customer</option><option value="PROSPECT">Prospect</option><option value="PARTNER">Partner</option><option value="VENDOR">Vendor</option></select></div>
                <div><label className="label">City</label><input name="city" className="input" defaultValue={editingContact.city || ''} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? <><Loader2 size={16} className="spinner" /> Updating...</> : <><Edit size={16} /> Update Contact</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
