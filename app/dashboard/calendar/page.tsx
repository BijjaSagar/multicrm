'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar as CalendarIcon, Plus, X, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, Clock, User, Phone, Mail, FileText,
  Video, CheckCircle2,
} from 'lucide-react'

interface Activity {
  id: string
  type: string
  subject: string
  description: string | null
  scheduledAt: string | null
  duration: number | null
  completedAt: string | null
  user: { id: string; firstName: string; lastName: string } | null
  lead: { id: string; firstName: string; lastName: string } | null
  contact: { id: string; firstName: string; lastName: string } | null
  deal: { id: string; title: string } | null
  ticket: { id: string; ticketNumber: string; subject: string } | null
}

const typeIcons: Record<string, { icon: typeof Phone; color: string; bg: string }> = {
  CALL: { icon: Phone, color: '#10B981', bg: 'rgba(16,185,129,.1)' },
  EMAIL: { icon: Mail, color: '#6366F1', bg: 'rgba(99,102,241,.1)' },
  MEETING: { icon: Video, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  TASK: { icon: CheckCircle2, color: '#06B6D4', bg: 'rgba(6,182,212,.1)' },
  NOTE: { icon: FileText, color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [creating, setCreating] = useState(false)
  const [view, setView] = useState<'calendar' | 'kanban'>('calendar')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const handleStatusUpdate = async (activityId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt: isCompleted ? new Date().toISOString() : null }),
      })
      if (!res.ok) throw new Error('Update failed')
      fetchActivities()
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleDropToStatus = async (activityId: string, status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED') => {
    // Current schema uses completedAt as status indicator
    // TODO: null, COMPLETED: date
    const isCompleted = status === 'COMPLETED'
    handleStatusUpdate(activityId, isCompleted)
  }

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const res = await fetch(`/api/activities?start=${start}&end=${end}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setActivities(data.activities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const scheduledAt = `${form.get('date')}T${form.get('time') || '09:00'}:00`
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.get('type'),
          subject: form.get('subject'),
          description: form.get('description'),
          scheduledAt,
          duration: Number(form.get('duration') || 30),
        }),
      })
      if (!res.ok) throw new Error('Failed to create activity')
      setShowModal(false)
      fetchActivities()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  // Calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const getActivitiesForDay = (day: number) => {
    return activities.filter(a => {
      if (!a.scheduledAt) return false
      const d = new Date(a.scheduledAt)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const cells: { day: number; current: boolean }[] = []
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = firstDayOfMonth - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true })
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false })

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={24} style={{ color: '#F59E0B' }} /> Task Board
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage activities and schedule</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="btn-group" style={{ marginRight: '10px' }}>
            <button className={`btn btn-sm ${view === 'calendar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('calendar')}>Calendar</button>
            <button className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('kanban')}>Board</button>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={goToday}>Today</button>
          <button className="btn btn-primary" onClick={() => { setSelectedDate(new Date()); setShowModal(true) }}><Plus size={16} /> Add Activity</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner" /> Loading activities...
        </div>
      ) : view === 'calendar' ? (
        <div className="card" style={{ padding: '24px' }}>
          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{MONTHS[month]} {year}</h2>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--surface-border)' }}>
            {cells.map((cell, i) => {
              const isToday = cell.current && cell.day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const dayActivities = cell.current ? getActivitiesForDay(cell.day) : []
              return (
                <div
                  key={i}
                  onClick={() => { if (cell.current) { setSelectedDate(new Date(year, month, cell.day)); setShowModal(true) } }}
                  style={{
                    background: isToday ? 'rgba(99,102,241,.05)' : 'var(--surface-raised)',
                    padding: '8px',
                    minHeight: '100px',
                    cursor: cell.current ? 'pointer' : 'default',
                    opacity: cell.current ? 1 : 0.35,
                    borderBottom: '1px solid var(--surface-border)',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: isToday ? 700 : 500, color: isToday ? '#6366F1' : 'var(--text-primary)', marginBottom: '4px' }}>{cell.day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {dayActivities.slice(0, 3).map(act => (
                      <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '4px', background: typeIcons[act.type]?.bg || 'var(--surface-bg)', fontSize: '10px', fontWeight: 600, color: typeIcons[act.type]?.color || 'var(--text-primary)', overflow: 'hidden' }}>
                        {act.subject}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', minHeight: '60vh' }}>
          {[
            { id: 'TODO', label: 'To Do', color: '#6366F1', items: activities.filter(a => !a.completedAt) },
            { id: 'COMPLETED', label: 'Completed', color: '#10B981', items: activities.filter(a => !!a.completedAt) }
          ].map(col => (
            <div
              key={col.id}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const id = e.dataTransfer.getData('activityId')
                if (id) handleDropToStatus(id, col.id as any)
              }}
              style={{ minWidth: '320px', flex: 1, background: 'var(--surface-bg)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}
            >
              <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: col.color }}>{col.label} ({col.items.length})</span>
              </div>
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.items.map(act => (
                  <div
                    key={act.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData('activityId', act.id)}
                    style={{ padding: '14px', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--surface-border)', cursor: 'grab' }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{act.subject}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Clock size={12} /> {act.scheduledAt ? new Date(act.scheduledAt).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Activities */}
      {activities.filter(a => a.scheduledAt && new Date(a.scheduledAt) >= today).length > 0 && (
        <div className="card" style={{ padding: '22px', marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Upcoming Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.filter(a => a.scheduledAt && new Date(a.scheduledAt) >= today).slice(0, 8).map(act => {
              const ti = typeIcons[act.type] || typeIcons.TASK
              const Icon = ti.icon
              return (
                <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: ti.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={ti.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{act.subject}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {act.scheduledAt && new Date(act.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at {act.scheduledAt && new Date(act.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {act.duration && ` · ${act.duration}min`}
                    </div>
                  </div>
                  {act.user && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                      {act.user.firstName[0]}{act.user.lastName[0]}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div className="card animate-scale-in" style={{ width: '520px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>New Activity</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Subject *</label><input name="subject" className="input" placeholder="Meeting with client" required /></div>
                <div><label className="label">Type *</label>
                  <select name="type" className="input" required>
                    <option value="TASK">Task</option>
                    <option value="CALL">Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="MEETING">Meeting</option>
                    <option value="NOTE">Note</option>
                  </select>
                </div>
                <div><label className="label">Duration (min)</label><input name="duration" className="input" type="number" placeholder="30" defaultValue="30" /></div>
                <div><label className="label">Date *</label><input name="date" className="input" type="date" defaultValue={selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]} required /></div>
                <div><label className="label">Time</label><input name="time" className="input" type="time" defaultValue="09:00" /></div>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Description</label><textarea name="description" className="input" rows={2} placeholder="Additional details..." style={{ resize: 'vertical' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Schedule</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
