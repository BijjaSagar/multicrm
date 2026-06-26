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

  const [listStatusFilter, setListStatusFilter] = useState('ALL')

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

  const tableLeads = useMemo(() => {
    if (listStatusFilter === 'ALL') return filteredLeads
    return filteredLeads.filter(l => l.status === listStatusFilter)
  }, [filteredLeads, listStatusFilter])

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
        /* Redesigned List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'hidden' }}>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setListStatusFilter('ALL')}
              style={{
                padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                border: listStatusFilter === 'ALL' ? 'none' : '1px solid var(--surface-border)',
                background: listStatusFilter === 'ALL' ? 'var(--primary-500)' : 'var(--surface-raised)',
                color: listStatusFilter === 'ALL' ? 'white' : 'var(--text-secondary)',
                transition: 'all 150ms',
              }}
            >
              All ({filteredLeads.length})
            </button>
            {Object.entries(activeStatusConfig).map(([key, cfg]) => {
              const count = filteredLeads.filter(l => l.status === key).length
              if (count === 0) return null
              const active = listStatusFilter === key
              return (
                <button key={key} onClick={() => setListStatusFilter(key)} style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  border: active ? 'none' : `1px solid ${cfg.color}40`,
                  background: active ? cfg.color : `${cfg.color}10`,
                  color: active ? 'white' : cfg.color,
                  transition: 'all 150ms',
                }}>
                  {cfg.label} <span style={{ opacity: 0.8 }}>({count})</span>
                </button>
              )
            })}
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-raised)', borderBottom: '2px solid var(--surface-border)' }}>
                    {['Student', 'Contact', 'Gender', 'Course', 'Specialization', 'Score', 'Status', 'Date Added', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', whiteSpace: 'nowrap', position: 'sticky', top: 0, background: 'var(--surface-raised)', zIndex: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableLeads.length > 0 ? tableLeads.map((lead, i) => {
                    const statusMeta = activeStatusConfig[lead.status] || { label: lead.status, color: '#64748B' }
                    const salutation = lead.customFields?.['Salutation'] || ''
                    const gender = lead.customFields?.['Gender'] || (isEducation ? 'Male' : '')
                    const course = lead.customFields?.['Course'] || (isEducation ? 'PGDM' : '')
                    const specialization = lead.customFields?.['Specialization'] || ''
                    const hue = (lead.firstName.charCodeAt(0) * 15) % 360
                    const score = lead.score || 0
                    const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
                    const dateStr = new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    const timeStr = new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <tr key={lead.id}
                        style={{ borderBottom: '1px solid var(--surface-border)', transition: 'background 120ms', cursor: 'pointer' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                        onMouseOut={e => (e.currentTarget.style.background = '')}
                      >
                        {/* Student */}
                        <td style={{ padding: '12px 16px' }}>
                          <Link href={`/dashboard/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                              background: `linear-gradient(135deg, hsl(${hue},65%,55%), hsl(${(hue+40)%360},65%,45%))`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '13px', fontWeight: 700,
                            }}>
                              {lead.firstName[0]}{lead.lastName[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                                {salutation && `${salutation} `}{lead.firstName} {lead.lastName}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--primary-500)', fontFamily: 'monospace', marginTop: '2px' }}>
                                #{lead.id.substring(0, 8)}
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: '12px 16px' }}>
                          {lead.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                              <Mail size={11} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              <Phone size={11} /> {lead.phone}
                            </div>
                          )}
                        </td>

                        {/* Gender */}
                        <td style={{ padding: '12px 16px' }}>
                          {gender ? (
                            <span style={{
                              padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                              background: gender === 'Female' ? 'rgba(236,72,153,.12)' : gender === 'Male' ? 'rgba(59,130,246,.12)' : 'rgba(107,114,128,.12)',
                              color: gender === 'Female' ? '#EC4899' : gender === 'Male' ? '#3B82F6' : '#6B7280',
                            }}>{gender}</span>
                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </td>

                        {/* Course */}
                        <td style={{ padding: '12px 16px' }}>
                          {course ? (
                            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-600)' }}>{course}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{lead.company || '—'}</span>
                          )}
                        </td>

                        {/* Specialization */}
                        <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {specialization || lead.jobTitle || '—'}
                          </span>
                        </td>

                        {/* Score ring */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: `conic-gradient(${scoreColor} ${score * 3.6}deg, var(--surface-border) 0deg)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: 'var(--surface-raised)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '9px', fontWeight: 800, color: scoreColor,
                              }}>{score}</div>
                            </div>
                          </div>
                        </td>

                        {/* Status badge */}
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                            background: `${statusMeta.color}18`, color: statusMeta.color,
                            border: `1px solid ${statusMeta.color}35`,
                            whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '5px',
                          }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusMeta.color, flexShrink: 0 }} />
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{dateStr}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{timeStr}</div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <button className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={13} /></button>
                            </Link>
                            {lead.phone && (
                              <a href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <button className="btn btn-ghost btn-icon btn-sm" title="WhatsApp" style={{ color: '#25D366' }}>
                                  <Phone size={13} />
                                </button>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <UserPlus size={40} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                        <p style={{ fontWeight: 600, fontSize: '15px' }}>No leads found</p>
                        <p style={{ fontSize: '13px', marginTop: '6px' }}>Try adjusting the search or status filter above</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {tableLeads.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-raised)', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Showing <strong style={{ color: 'var(--text-primary)' }}>{tableLeads.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{filteredLeads.length}</strong> leads
                </span>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {Object.entries(activeStatusConfig).map(([key, cfg]) => {
                    const count = filteredLeads.filter(l => l.status === key).length
                    if (count === 0) return null
                    return (
                      <span key={key} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.color }} />
                        {cfg.label}: <strong style={{ color: 'var(--text-primary)' }}>{count}</strong>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
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
