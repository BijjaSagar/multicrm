'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  UserPlus, Search, Filter, Plus, Mail, Phone, Building2,
  ArrowUpDown, ChevronLeft, ChevronRight, Download, Upload,
  Eye, Edit, Trash2, X, Loader2, AlertCircle, RefreshCw,
  MoreVertical, GripVertical
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  jobTitle: string | null
  status: string
  source: string
  priority: string
  score: number
  expectedRevenue: number | null
  createdAt: string
  assignedTo: { id: string; firstName: string; lastName: string; avatar: string | null } | null
  branch: { id: string; name: string } | null
}

const statusConfig: Record<string, { label: string; class: string; color: string }> = {
  NEW: { label: 'New', class: 'badge-info', color: '#3B82F6' },
  CONTACTED: { label: 'Contacted', class: 'badge-warning', color: '#F59E0B' },
  QUALIFIED: { label: 'Qualified', class: 'badge-success', color: '#10B981' },
  PROPOSAL_SENT: { label: 'Proposal', class: 'badge-info', color: '#6366F1' },
  NEGOTIATION: { label: 'Negotiation', class: 'badge-warning', color: '#8B5CF6' },
  CONVERTED: { label: 'Converted', class: 'badge-success', color: '#10B981' },
  LOST: { label: 'Lost', class: 'badge-danger', color: '#EF4444' },
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `conic-gradient(${color} ${score * 3.6}deg, var(--surface-border) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color }}>
          {score}
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

function LeadCard({ lead, isOverlay = false }: { lead: Lead; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: 'Lead', lead },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 1000 : undefined,
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div
      ref={setNodeRef}
      className={`card lead-card ${isOverlay ? 'overlay' : ''}`}
      style={{
        ...style,
        padding: '12px',
        background: 'var(--surface-raised)',
        borderRadius: '10px',
        border: '1px solid var(--surface-border)',
        cursor: 'default',
        position: 'relative',
        boxShadow: isOverlay ? '0 10px 25px rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div {...listeners} {...attributes} style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
            <GripVertical size={14} />
          </div>
          <Link href={`/dashboard/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} className="hover-primary">{lead.firstName} {lead.lastName}</div>
          </Link>
        </div>
        <ScoreBadge score={lead.score} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Building2 size={12} /> {lead.company || lead.source}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-500)' }}>
          {lead.expectedRevenue ? formatCurrency(Number(lead.expectedRevenue)) : '₹ 0'}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn btn-ghost btn-icon btn-icon-xs" style={{ background: 'none' }}><Mail size={12} /></button>
          <button className="btn btn-ghost btn-icon btn-icon-xs" style={{ background: 'none' }}><Phone size={12} /></button>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, leads }: { status: string; leads: Lead[] }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status },
  })

  const config = statusConfig[status]
  const totalValue = leads.reduce((sum, l) => sum + Number(l.expectedRevenue || 0), 0)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '280px',
        flex: 1,
        background: 'var(--surface-bg)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 250px)',
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', borderTop: `3px solid ${config.color}`, background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }} />
            {config.label}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
            {leads.length}
          </span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
          {formatCurrency(totalValue)}
        </div>
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads?limit=1000') // Fetch all for kanban
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch('/api/team')
      if (res.ok) {
        const data = await res.json()
        setTeam(data.users || [])
      }
    } catch (err) { console.error('Team fetch failed', err) }
  }, [])

  useEffect(() => { 
    fetchLeads()
    fetchTeam()
  }, [fetchLeads, fetchTeam])

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      (l.firstName + ' ' + l.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leads, searchQuery])

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Lead') {
      setActiveLead(event.active.data.current.lead)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveALead = active.data.current?.type === 'Lead'
    const isOverALead = over.data.current?.type === 'Lead'
    const isOverAColumn = over.data.current?.type === 'Column'

    if (!isActiveALead) return

    // Dropping a lead over another lead
    if (isActiveALead && isOverALead) {
      setLeads(prev => {
        const activeIndex = prev.findIndex(l => l.id === activeId)
        const overIndex = prev.findIndex(l => l.id === overId)

        if (prev[activeIndex].status !== prev[overIndex].status) {
          prev[activeIndex].status = prev[overIndex].status
          return arrayMove(prev, activeIndex, overIndex - 1)
        }

        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    // Dropping a lead over a column
    if (isActiveALead && isOverAColumn) {
      setLeads(prev => {
        const activeIndex = prev.findIndex(l => l.id === activeId)
        prev[activeIndex].status = String(overId)
        return arrayMove(prev, activeIndex, activeIndex)
      })
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = String(active.id)
    const activeLead = leads.find(l => l.id === leadId)
    if (!activeLead) return

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: activeLead.status }),
      })
    } catch {
      setError('Sync failed')
      fetchLeads()
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form)
    
    // If auto-assign is selected, remove assignedToId
    if (data.assignedToId === 'AUTO') {
      delete data.assignedToId
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Create failed')
      setShowCreateModal(false)
      fetchLeads()
    } catch (err) {
      setError('Create failed')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={24} style={{ color: 'var(--primary-500)' }} /> Pipeline
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage and update your sales pipeline in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" placeholder="Quick search..." 
              className="input" style={{ paddingLeft: '38px', background: 'var(--surface-bg)' }}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-icon" onClick={fetchLeads}><RefreshCw size={16} /></button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Lead</button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner" /> Initializing board...
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div style={{ 
            display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, paddingBottom: '16px',
            scrollbarWidth: 'thin', scrollbarColor: 'var(--surface-border) transparent'
          }}>
            {Object.keys(statusConfig).map(status => (
              <KanbanColumn 
                key={status} 
                status={status} 
                leads={filteredLeads.filter(l => l.status === status)} 
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.4' } }
            })
          }}>
            {activeLead ? <LeadCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Modal - Enhanced with Team Selection */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
          <div className="card animate-scale-in" style={{ width: '600px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={20} />
                </div>
                <div>
                   <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create New Lead</h2>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fill in the details to start tracking this opportunity</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="form-group"><label className="label">First Name *</label><input name="firstName" className="input" required /></div>
                <div className="form-group"><label className="label">Last Name *</label><input name="lastName" className="input" required /></div>
                <div className="form-group"><label className="label">Email Address</label><input name="email" className="input" type="email" placeholder="client@example.com" /></div>
                <div className="form-group"><label className="label">Company</label><input name="company" className="input" placeholder="Business Name" /></div>
                <div className="form-group"><label className="label">Lead Source</label><select name="source" className="input"><option value="WEBSITE">Website</option><option value="REFERRAL">Referral</option><option value="DIRECT">Direct</option><option value="SOCIAL_MEDIA">Social Media</option><option value="OTHER">Other</option></select></div>
                <div className="form-group"><label className="label">Estimated Value (₹)</label><input name="expectedRevenue" className="input" type="number" placeholder="0" /></div>
                
                {/* Team Assignment Logic Dropdown */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Assign To
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '2px 8px', borderRadius: '10px' }}>ROUND-ROBIN ENABLED</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select name="assignedToId" className="input" style={{ appearance: 'none', paddingLeft: '40px' }} defaultValue="AUTO">
                      <option value="AUTO">✨ Auto-Assign (Round Robin Distribution)</option>
                      <optgroup label="Manual Selection (Sales Team)">
                        {team.map(member => (
                          <option key={member.id} value={member.id}>
                            👤 {member.firstName} {member.lastName} ({member.role.replace('_', ' ')})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <ArrowUpDown size={14} />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    Pick a team member to assign manually, or leave it to Auto-Assign (System will pick the next available member).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-border)', paddingTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Discard</button>
                <button type="submit" className="btn btn-primary px-8" disabled={creating}>
                  {creating ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />} 
                  {creating ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
