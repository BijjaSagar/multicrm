'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  HeadphonesIcon, Search, Plus, Clock, AlertTriangle,
  CheckCircle2, XCircle, Timer, Eye, MessageSquare,
  ChevronLeft, ChevronRight, X, User, Loader2, RefreshCw,
  AlertCircle, Trash2, GripVertical,
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
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  priority: TicketPriority
  status: TicketStatus
  category: string | null
  createdAt: string
  contact: { id: string; firstName: string; lastName: string; company?: string; email?: string } | null
  assignedTo: { id: string; firstName: string; lastName: string; avatar: string | null } | null
  createdBy: { id: string; firstName: string; lastName: string } | null
  branch: { id: string; name: string } | null
  _count: { comments: number }
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Low', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
  MEDIUM: { label: 'Medium', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  HIGH: { label: 'High', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  URGENT: { label: 'Urgent', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  CRITICAL: { label: 'Critical', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.15)' },
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  OPEN: { label: 'Open', icon: Clock, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  IN_PROGRESS: { label: 'In Progress', icon: Timer, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  WAITING: { label: 'Waiting', icon: Clock, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  RESOLVED: { label: 'Resolved', icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  CLOSED: { label: 'Closed', icon: XCircle, color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
}

function TicketCard({ ticket, isOverlay = false }: { ticket: Ticket; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: { type: 'Ticket', ticket },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 1000 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      className={`card ticket-card ${isOverlay ? 'overlay' : ''}`}
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
          <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary-500)' }}>
            #{ticket.ticketNumber}
          </span>
        </div>
        <span style={{ 
          padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, 
          background: priorityConfig[ticket.priority]?.bg, color: priorityConfig[ticket.priority]?.color 
        }}>
          {priorityConfig[ticket.priority]?.label}
        </span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{ticket.subject}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={10} /> {ticket.contact?.firstName || 'Guest'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <MessageSquare size={10} /> {ticket._count.comments}
        </div>
      </div>
    </div>
  )
}

function TicketKanbanColumn({ status, tickets, onClickTicket }: { status: string; tickets: Ticket[]; onClickTicket: (t: Ticket) => void }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status },
  })

  const config = statusConfig[status]

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
            {tickets.length}
          </span>
        </div>
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map(ticket => (
            <div key={ticket.id} onClick={() => onClickTicket(ticket)}>
              <TicketCard ticket={ticket} />
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

import { useSession } from 'next-auth/react'

export default function TicketsPage() {
  const { data: session } = useSession()
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<{ status: string; _count: { id: number } }[]>([])
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [currentComments, setCurrentComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [sendingComment, setSendingComment] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const limit = view === 'kanban' ? '1000' : '20'
      const params = new URLSearchParams({ page: String(page), limit, search: searchQuery })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      const res = await fetch(`/api/tickets?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tickets')
      const data = await res.json()
      setTickets(data.tickets)
      setStats(data.stats || [])
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, statusFilter, priorityFilter, view])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const fetchComments = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`)
      const data = await res.json()
      setCurrentComments(data.comments || [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    if (selectedTicket) fetchComments(selectedTicket.id)
  }, [selectedTicket])

  const onDragStart = (event: DragStartEvent) => {
    if (session?.user?.role === 'VIEWER') return 
    if (event.active.data.current?.type === 'Ticket') {
      setActiveTicket(event.active.data.current.ticket)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    if (session?.user?.role === 'VIEWER') return 
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATicket = active.data.current?.type === 'Ticket'
    const isOverATicket = over.data.current?.type === 'Ticket'
    const isOverAColumn = over.data.current?.type === 'Column'

    if (!isActiveATicket) return

    if (isActiveATicket && isOverATicket) {
      setTickets(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        const overIndex = prev.findIndex(t => t.id === overId)

        if (prev[activeIndex].status !== prev[overIndex].status) {
          prev[activeIndex].status = prev[overIndex].status
          return arrayMove(prev, activeIndex, overIndex - 1)
        }

        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    if (isActiveATicket && isOverAColumn) {
      setTickets(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        prev[activeIndex].status = String(overId) as TicketStatus
        return arrayMove(prev, activeIndex, activeIndex)
      })
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTicket(null)
    if (session?.user?.role === 'VIEWER') return
    const { active, over } = event

    if (!over) return

    const ticketId = String(active.id)
    const activeTicket = tickets.find(t => t.id === ticketId)
    if (!activeTicket) return

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: activeTicket.status }),
      })
    } catch {
      setError('Sync failed')
      fetchTickets()
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      })
      if (!res.ok) throw new Error('Creation failed')
      setShowCreateModal(false)
      fetchTickets()
    } catch (err) {
      setError('Create failed')
    } finally {
      setCreating(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedTicket) return
    setSendingComment(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, isInternal }),
      })
      if (!res.ok) throw new Error('Comment failed')
      setCommentText('')
      fetchComments(selectedTicket.id)
    } catch (err) { setError('Failed to post comment') }
    finally { setSendingComment(false) }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchTickets()
    if (selectedTicket?.id === id) {
       setSelectedTicket(prev => prev ? { ...prev, status: newStatus as TicketStatus } : null)
    }
  }

  const getStatCount = (status: string) => stats.find(s => s.status === status)?._count?.id || 0

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HeadphonesIcon size={24} style={{ color: 'var(--accent-amber)' }} /> Support Desk
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>Track and resolve support issues efficiently</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="btn-group">
            <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>List</button>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>Board</button>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={fetchTickets}><RefreshCw size={16} /></button>
          {session?.user?.role !== 'VIEWER' && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={18} /> New Ticket</button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner" /> Loading tickets...
        </div>
      ) : view === 'table' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Open', value: getStatCount('OPEN'), icon: Clock, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
              { label: 'In Progress', value: getStatCount('IN_PROGRESS'), icon: Timer, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
              { label: 'Resolved', value: getStatCount('RESOLVED'), icon: CheckCircle2, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
              { label: 'Total', value: total, icon: HeadphonesIcon, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
            ].map((stat, i) => (
              <div key={i} className="card animate-fade-in-up" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>{stat.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <HeadphonesIcon size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>No tickets found</p>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none' }}>
                <table className="table">
                  <thead><tr><th>Ticket</th><th>Subject</th><th>Priority</th><th>Status</th><th>Contact</th><th>Comments</th><th style={{ width: '100px' }}>Actions</th></tr></thead>
                  <tbody>
                    {tickets.map((ticket, i) => {
                      const StatusIcon = statusConfig[ticket.status]?.icon || Clock
                      return (
                        <tr key={ticket.id} className="animate-fade-in-up" onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer' }}>
                          <td><span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-500)' }}>#{ticket.ticketNumber}</span></td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{ticket.subject}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ticket.category || 'Support'}</div>
                          </td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: priorityConfig[ticket.priority]?.bg, color: priorityConfig[ticket.priority]?.color }}>
                              {priorityConfig[ticket.priority]?.label}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: statusConfig[ticket.status]?.bg, color: statusConfig[ticket.status]?.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <StatusIcon size={12} /> {statusConfig[ticket.status]?.label}
                            </span>
                          </td>
                          <td style={{ fontSize: '13px' }}>{ticket.contact?.firstName || '—'}</td>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}><MessageSquare size={14} /> {ticket._count.comments}</td>
                          <td>
                            <div style={{ display: 'flex' }}>
                              <button className="btn btn-ghost btn-icon btn-sm"><Eye size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button className="btn btn-secondary btn-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                   <button className="btn btn-secondary btn-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, paddingBottom: '16px' }}>
            {['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'].map(status => (
              <TicketKanbanColumn key={status} status={status} tickets={tickets.filter(t => t.status === status)} onClickTicket={setSelectedTicket} />
            ))}
          </div>
          <DragOverlay>
            {activeTicket ? <TicketCard ticket={activeTicket} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelectedTicket(null)}>
          <div className="animate-slide-in-right" style={{ width: '600px', height: '100vh', background: 'var(--surface-bg)', borderLeft: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-500)', marginBottom: '4px' }}>#{selectedTicket.ticketNumber}</div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedTicket.subject}</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedTicket(null)}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', background: 'var(--surface-raised)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Issue Description</div>
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>{selectedTicket.description}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentComments.map((comment, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: comment.isInternal ? 'var(--accent-amber)' : 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {comment.user?.firstName[0] || 'C'}
                    </div>
                    <div style={{ flex: 1, background: 'var(--surface-raised)', padding: '12px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800 }}>{comment.user?.firstName} {comment.user?.lastName}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: '13px' }}>{comment.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--surface-border)', background: 'var(--surface-bg)' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {Object.keys(statusConfig).map(s => (
                  <button key={s} className={`btn btn-xs ${selectedTicket.status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleStatusChange(selectedTicket.id, s)}>{statusConfig[s].label}</button>
                ))}
              </div>
              <form onSubmit={handleAddComment}>
                <textarea 
                  className="input" placeholder="Write a reply or internal note..." 
                  style={{ width: '100%', minHeight: '100px', marginBottom: '12px', padding: '12px' }}
                  value={commentText} onChange={e => setCommentText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} /> Internal Note
                  </label>
                  <button className="btn btn-primary btn-sm px-6" disabled={sendingComment}>
                    {sendingComment ? <Loader2 size={14} className="spinner" /> : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
          <div className="card animate-scale-in" style={{ width: '560px', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>New Support Ticket</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><label className="label">Subject *</label><input name="subject" className="input" required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label className="label">Priority</label><select name="priority" className="input"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option><option value="CRITICAL">Critical</option></select></div>
                  <div><label className="label">Category</label><select name="category" className="input"><option>GENERAL</option><option>TECHNICAL</option><option>BILLING</option></select></div>
                </div>
                <div><label className="label">Description *</label><textarea name="description" className="input" rows={4} required /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <Loader2 size={16} className="spinner" /> : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
