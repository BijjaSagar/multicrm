'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  UserPlus, Search, Filter, Plus, Mail, Phone, Building2,
  ArrowUpDown, ChevronLeft, ChevronRight, Download, Upload,
  Eye, Edit, Trash2, X, Loader2, AlertCircle, RefreshCw,
  MoreVertical, GripVertical, List, Kanban, Calendar, Check
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
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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
  customFields?: Record<string, string>
}

// Specialization course maps for higher education admissions
const COURSE_SPECIALIZATIONS: Record<string, string[]> = {
  'PGDM': [
    'Construction and Project Management', 'Marketing Management', 'Operations Management',
    'Finance Management', 'Human Resource Management', 'Project Management',
    'Information Technology', 'Material Management', 'Logistics & Supply chain Management',
    'Banking & Financial Services'
  ],
  'PGDBA': ['Marketing Management', 'Finance Management', 'Operations Management', 'HR Management', 'IT Management'],
  'PGCM': ['Business Analytics', 'Digital Marketing', 'Financial Technology'],
  'PGDM-Executive': ['General Management', 'Leadership', 'Strategic Operations'],
  'Dual Program': ['Marketing + Finance', 'Operations + HR', 'IT + Project Management'],
  'SQL Power Bi Certification': ['Data Analytics', 'Business Intelligence'],
  'PCP': ['Professional Certificate Program'],
  'Gen Al for Educators Program': ['AI in Education', 'Curriculum Design']
}

// Standard CRM status config
const statusConfig: Record<string, { label: string; class: string; color: string }> = {
  NEW: { label: 'New', class: 'badge-info', color: '#3B82F6' },
  CONTACTED: { label: 'Contacted', class: 'badge-warning', color: '#F59E0B' },
  QUALIFIED: { label: 'Qualified', class: 'badge-success', color: '#10B981' },
  PROPOSAL_SENT: { label: 'Proposal', class: 'badge-info', color: '#6366F1' },
  NEGOTIATION: { label: 'Negotiation', class: 'badge-warning', color: '#8B5CF6' },
  CONVERTED: { label: 'Converted', class: 'badge-success', color: '#10B981' },
  LOST: { label: 'Lost', class: 'badge-danger', color: '#EF4444' },
}

// MITSDE LSC dynamic mapped status config
const educationStatusConfig: Record<string, { label: string; class: string; color: string }> = {
  NEW: { label: 'To be Enrol LSC', class: 'badge-info', color: '#3B82F6' },
  CONTACTED: { label: 'Counselling', class: 'badge-warning', color: '#F59E0B' },
  QUALIFIED: { label: 'Applied', class: 'badge-success', color: '#10B981' },
  PROPOSAL_SENT: { label: 'Documents Verifying', class: 'badge-info', color: '#6366F1' },
  NEGOTIATION: { label: 'Fees Paid', class: 'badge-warning', color: '#8B5CF6' },
  CONVERTED: { label: 'Admitted', class: 'badge-success', color: '#10B981' },
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

function LeadCard({ lead, isEducation, isOverlay = false }: { lead: Lead; isEducation: boolean; isOverlay?: boolean }) {
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
            <div style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }} className="hover-primary">
              {lead.firstName} {lead.lastName}
            </div>
          </Link>
        </div>
        <ScoreBadge score={lead.score} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Building2 size={12} /> {isEducation ? (lead.customFields?.['Course'] || 'PGDM') : (lead.company || lead.source)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-500)' }}>
          {isEducation ? (lead.customFields?.['Specialization'] || 'Marketing') : (lead.expectedRevenue ? formatCurrency(Number(lead.expectedRevenue)) : '₹ 0')}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="btn btn-ghost btn-icon btn-icon-xs" style={{ background: 'none' }}><Mail size={12} /></button>
          <button className="btn btn-ghost btn-icon btn-icon-xs" style={{ background: 'none' }}><Phone size={12} /></button>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, leads, isEducation }: { status: string; leads: Lead[]; isEducation: boolean }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status },
  })

  const activeConfig = isEducation ? educationStatusConfig : statusConfig
  const config = activeConfig[status] || statusConfig[status]
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
        {!isEducation && (
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
            {formatCurrency(totalValue)}
          </div>
        )}
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} isEducation={isEducation} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Custom states for wizard and toggling views
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    course: 'PGDM',
    specialization: 'Marketing Management',
    dualSpecialization: '',
    password: 'MIT@2026',
    isReferral: 'No'
  })

  // Detect education vertical matching STUDENT_MANAGEMENT module
  const isEducation = useMemo(() => {
    return session?.user?.enabledModules?.includes('STUDENT_MANAGEMENT') || false
  }, [session])

  useEffect(() => {
    if (isEducation) {
      setViewMode('list')
    }
  }, [isEducation])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads?limit=1000') 
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
      (l.customFields?.['Course'] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.customFields?.['Specialization'] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leads, searchQuery])

  const activeStatusConfig = isEducation ? educationStatusConfig : statusConfig

  const onDragStart = (event: DragStartEvent) => {
    if (session?.user?.role === 'VIEWER') return 
    if (event.active.data.current?.type === 'Lead') {
      setActiveLead(event.active.data.current.lead)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    if (session?.user?.role === 'VIEWER') return 
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveALead = active.data.current?.type === 'Lead'
    const isOverALead = over.data.current?.type === 'Lead'
    const isOverAColumn = over.data.current?.type === 'Column'

    if (!isActiveALead) return

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

    if (isActiveALead && isOverAColumn) {
      setLeads(prev => {
        const activeIndex = prev.findIndex(l => l.id === activeId)
        prev[activeIndex].status = String(overId)
        return arrayMove(prev, activeIndex, activeIndex)
      })
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveLead(null)
    if (session?.user?.role === 'VIEWER') return
    const { active, over } = event

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

  // Dynamic dropdown change handler
  const handleCourseChange = (courseVal: string) => {
    const specs = COURSE_SPECIALIZATIONS[courseVal] || []
    setWizardData(prev => ({
      ...prev,
      course: courseVal,
      specialization: specs[0] || ''
    }))
  }

  const handleCreateWizard = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    
    // Construct request body with custom fields
    const bodyPayload = {
      firstName: wizardData.firstName,
      lastName: wizardData.lastName,
      email: wizardData.email,
      phone: wizardData.phone,
      source: 'WEBSITE',
      customFields: {
        Salutation: wizardData.salutation,
        Gender: wizardData.gender,
        Course: wizardData.course,
        Specialization: wizardData.specialization,
        'Dual Specialization': wizardData.dualSpecialization,
        Password: wizardData.password,
        'Is Referral': wizardData.isReferral
      }
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })
      if (!res.ok) throw new Error('Create failed')
      
      // Reset wizard
      setShowCreateModal(false)
      setWizardStep(1)
      setWizardData({
        salutation: 'Mr.',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'Male',
        course: 'PGDM',
        specialization: 'Marketing Management',
        dualSpecialization: '',
        password: 'MIT@2026',
        isReferral: 'No'
      })
      fetchLeads()
    } catch (err) {
      setError('Create failed')
    } finally {
      setCreating(false)
    }
  }

  const downloadCSV = () => {
    const headers = ['Lead ID', 'Name', 'Email', 'Mobile No.', 'Gender', 'Course', 'Specialization', 'Dual Specialization', 'Password', 'Is Referral', 'Status', 'Date Added']
    const rows = filteredLeads.map(l => {
      const name = `${l.firstName} ${l.lastName}`
      const email = l.email || ''
      const phone = l.phone || ''
      const gender = l.customFields?.['Gender'] || 'Male'
      const course = l.customFields?.['Course'] || 'PGDM'
      const spec = l.customFields?.['Specialization'] || 'Marketing Management'
      const dualSpec = l.customFields?.['Dual Specialization'] || ''
      const pass = l.customFields?.['Password'] || 'MIT@2026'
      const isRef = l.customFields?.['Is Referral'] || 'No'
      const statusLabel = activeStatusConfig[l.status]?.label || l.status
      const dateAdded = new Date(l.createdAt).toLocaleDateString('en-IN')
      return [l.id, name, email, phone, gender, course, spec, dualSpec, pass, isRef, statusLabel, dateAdded]
    })
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `mitsde_lsc_leads_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={24} style={{ color: 'var(--primary-500)' }} /> {isEducation ? 'My Leads' : 'Pipeline'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isEducation ? 'Manage distance learning admissions and student leads' : 'Manage and update your sales pipeline in real-time'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* List/Kanban toggle */}
          <div style={{ display: 'flex', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', borderRadius: '10px', padding: '2px' }}>
            <button 
              onClick={() => setViewMode('kanban')} 
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: viewMode === 'kanban' ? 'white' : 'transparent',
                boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
                color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: viewMode === 'list' ? 'white' : 'transparent',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <List size={14} /> List View
            </button>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" placeholder="Quick search..." 
              className="input" style={{ paddingLeft: '38px', background: 'var(--surface-bg)' }}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isEducation && (
            <button className="btn btn-secondary" onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Download CSV
            </button>
          )}

          <button className="btn btn-secondary btn-icon" onClick={fetchLeads}><RefreshCw size={16} /></button>
          {session?.user?.role !== 'VIEWER' && (
            <button className="btn btn-primary" onClick={() => { setWizardStep(1); setShowCreateModal(true); }}><Plus size={18} /> Add Lead</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEE2E2', border: '1px solid #FEF2F2', color: '#B91C1C', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Main Views */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner" /> Initializing leads board...
        </div>
      ) : viewMode === 'kanban' ? (
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
            {Object.keys(activeStatusConfig).map(status => (
              <KanbanColumn 
                key={status} 
                status={status} 
                leads={filteredLeads.filter(l => l.status === status)}
                isEducation={isEducation}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.4' } }
            })
          }}>
            {activeLead ? <LeadCard lead={activeLead} isEducation={isEducation} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* High Density Table View */
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto', border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile No.</th>
                  <th>Gender</th>
                  <th>Course</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => {
                    const statusVal = lead.status
                    const statusMeta = activeStatusConfig[statusVal] || { label: statusVal, color: '#64748B' }
                    const dateStr = new Date(lead.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                    
                    // Extract fields from customFields attached
                    const salutation = lead.customFields?.['Salutation'] || 'Mr.'
                    const gender = lead.customFields?.['Gender'] || 'Male'
                    const course = lead.customFields?.['Course'] || 'PGDM'
                    const specialization = lead.customFields?.['Specialization'] || 'Marketing Management'

                    return (
                      <tr key={lead.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{lead.id}</td>
                        <td style={{ fontWeight: 600 }}>{salutation} {lead.firstName} {lead.lastName}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{lead.email || '—'}</td>
                        <td>{lead.phone || '—'}</td>
                        <td>{gender}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{course}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{specialization}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                            background: `${statusMeta.color}15`, color: statusMeta.color 
                          }}>
                            {statusMeta.label}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dateStr}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <button className="btn btn-secondary btn-icon btn-sm"><Eye size={12} /></button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No matching leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2-Step Lead Form Wizard Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
          <div className="card animate-scale-in" style={{ width: '600px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={20} />
                </div>
                <div>
                   <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Add New Lead</h2>
                   <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                     {isEducation ? `Step ${wizardStep} of 2: ${wizardStep === 1 ? 'Personal Profile' : 'Course Details'}` : 'Create a new CRM lead opportunity'}
                   </p>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            
            {/* If the tenant has STUDENT_MANAGEMENT active, we use the LSC 2-step wizard */}
            {isEducation ? (
              <form onSubmit={wizardStep === 1 ? (e) => { e.preventDefault(); setWizardStep(2); } : handleCreateWizard}>
                {wizardStep === 1 ? (
                  /* Step 1: Personal Details */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 3fr 3fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="label">Salutation</label>
                        <select className="input" value={wizardData.salutation} onChange={e => setWizardData({...wizardData, salutation: e.target.value})}>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="M/s.">M/s.</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="label">First Name *</label>
                        <input className="input" required value={wizardData.firstName} onChange={e => setWizardData({...wizardData, firstName: e.target.value})} placeholder="Samarth" />
                      </div>
                      <div className="form-group">
                        <label className="label">Last Name *</label>
                        <input className="input" required value={wizardData.lastName} onChange={e => setWizardData({...wizardData, lastName: e.target.value})} placeholder="Kulkarni" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="label">Mobile Number *</label>
                        <input className="input" required type="tel" pattern="[0-9]{10}" placeholder="8805776205" value={wizardData.phone} onChange={e => setWizardData({...wizardData, phone: e.target.value})} />
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Must be exactly 10 numeric digits</p>
                      </div>
                      <div className="form-group">
                        <label className="label">Email Address *</label>
                        <input className="input" required type="email" placeholder="samarthpk17@gmail.com" value={wizardData.email} onChange={e => setWizardData({...wizardData, email: e.target.value})} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">Gender</label>
                      <div style={{ display: 'flex', gap: '20px', height: '40px', alignItems: 'center' }}>
                        {['Male', 'Female', 'Other'].map(g => (
                          <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                            <input type="radio" name="gender" checked={wizardData.gender === g} onChange={() => setWizardData({...wizardData, gender: g})} style={{ width: '16px', height: '16px' }} />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Admissions & Program Details */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    {/* Read-only brief summary */}
                    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', padding: '14px', borderRadius: '10px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><strong>Student Name:</strong> {wizardData.salutation} {wizardData.firstName} {wizardData.lastName}</div>
                      <div><strong>Mobile:</strong> {wizardData.phone}</div>
                      <div style={{ gridColumn: 'span 2' }}><strong>Email:</strong> {wizardData.email}</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="label">Course *</label>
                        <select className="input" value={wizardData.course} onChange={e => handleCourseChange(e.target.value)}>
                          {Object.keys(COURSE_SPECIALIZATIONS).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="label">Specialization *</label>
                        <select className="input" required value={wizardData.specialization} onChange={e => setWizardData({...wizardData, specialization: e.target.value})}>
                          {(COURSE_SPECIALIZATIONS[wizardData.course] || []).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="label">Student Portal Password *</label>
                        <input className="input" required value={wizardData.password} onChange={e => setWizardData({...wizardData, password: e.target.value})} placeholder="MIT@2026" />
                      </div>
                      <div className="form-group">
                        <label className="label">Is Referral?</label>
                        <select className="input" value={wizardData.isReferral} onChange={e => setWizardData({...wizardData, isReferral: e.target.value})}>
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">Dual Specialization (Optional)</label>
                      <input className="input" value={wizardData.dualSpecialization} onChange={e => setWizardData({...wizardData, dualSpecialization: e.target.value})} placeholder="e.g. Project Management" />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--surface-border)', paddingTop: '24px' }}>
                  {wizardStep === 2 ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setWizardStep(1)}>Back</button>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Discard</button>
                  )}
                  
                  <button type="submit" className="btn btn-primary px-8" disabled={creating}>
                    {creating ? <Loader2 size={16} className="spinner" /> : null}
                    {creating ? 'Saving Lead...' : wizardStep === 1 ? 'Check Lead & Continue' : 'Submit Lead'}
                  </button>
                </div>
              </form>
            ) : (
              /* Standard CRM single step fallback form if not EDUCATION vertical */
              <form onSubmit={async (e) => {
                e.preventDefault()
                setCreating(true)
                const form = new FormData(e.currentTarget as HTMLFormElement)
                const data = Object.fromEntries(form)
                if (data.assignedToId === 'AUTO') delete data.assignedToId

                try {
                  const res = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  if (!res.ok) throw new Error()
                  setShowCreateModal(false)
                  fetchLeads()
                } catch { setError('Create failed') }
                finally { setCreating(false) }
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div className="form-group"><label className="label">First Name *</label><input name="firstName" className="input" required /></div>
                  <div className="form-group"><label className="label">Last Name *</label><input name="lastName" className="input" required /></div>
                  <div className="form-group"><label className="label">Email Address</label><input name="email" className="input" type="email" placeholder="client@example.com" /></div>
                  <div className="form-group"><label className="label">Company</label><input name="company" className="input" placeholder="Business Name" /></div>
                  <div className="form-group"><label className="label">Lead Source</label><select name="source" className="input"><option value="WEBSITE">Website</option><option value="REFERRAL">Referral</option><option value="DIRECT">Direct</option><option value="SOCIAL_MEDIA">Social Media</option><option value="OTHER">Other</option></select></div>
                  <div className="form-group"><label className="label">Estimated Value (₹)</label><input name="expectedRevenue" className="input" type="number" placeholder="0" /></div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="label">Assign To</label>
                    <select name="assignedToId" className="input">
                      <option value="AUTO">✨ Auto-Assign (Round Robin)</option>
                      {team.map(member => (
                        <option key={member.id} value={member.id}>👤 {member.firstName} {member.lastName}</option>
                      ))}
                    </select>
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
