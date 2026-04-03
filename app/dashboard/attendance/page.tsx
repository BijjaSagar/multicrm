'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Clock, Calendar, User, Building2,
  Loader2, Search, Filter, ArrowUpRight,
  ArrowDownLeft, BarChart3, Clock3,
  CalendarDays, Trash2, CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface AttendanceRecord {
  id: string
  userId: string
  checkIn: string
  checkOut: string | null
  duration: number | null
  status: string
  notes: string | null
  metadata: any
  user: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  branch: {
    name: string
  } | null
}

const statusColors: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: 'rgba(16,185,129,.1)', color: '#10B981' },
  COMPLETED: { bg: 'rgba(99,102,241,.1)', color: '#6366F1' },
  BREAK: { bg: 'rgba(245,158,11,.1)', color: '#F59E0B' },
}

export default function AttendancePage() {
  const { data: session } = useSession()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [activeSession, setActiveSession] = useState<AttendanceRecord | null>(null)

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'TENANT_ADMIN' || session?.user?.role.includes('MANAGER')

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance${!isAdmin ? `?userId=${session?.user?.id}` : ''}`)
      if (!res.ok) throw new Error('Failed to load attendance')
      const data = await res.json()
      setRecords(data)
      const currentActive = data.find((r: any) => r.userId === session?.user?.id && r.status === 'ACTIVE')
      setActiveSession(currentActive || null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, isAdmin])

  useEffect(() => {
    if (session?.user?.id) fetchAttendance()
  }, [fetchAttendance, session?.user?.id])

  const formatDuration = (mins: number | null) => {
    if (!mins) return 'N/A'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '--:--'
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  const handleCheckOut = async () => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_OUT', note: 'Employee manual checkout' }),
      })
      if (!res.ok) throw new Error('Check Out failed')
      fetchAttendance()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    }
  }

  const handleCheckIn = async () => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHECK_IN', note: 'Start session' }),
      })
      if (!res.ok) throw new Error('Check In failed')
      fetchAttendance()
    } catch (err) {
       setError(err instanceof Error ? err.message : 'Check-in failed')
    }
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch = `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'ALL' || r.status === filter
    return matchesSearch && matchesFilter
  })

  // Group by Date for Admin view
  const groupedRecordsByDate = records.reduce((acc: any, record) => {
    const date = formatDate(record.checkIn)
    if (!acc[date]) acc[date] = []
    acc[date].push(record)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={24} style={{ color: '#6366F1' }} /> Attendance {isAdmin ? '& Working Hours' : ''}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automatically tracking your work sessions and activity logs.
          </p>
        </div>
        
        {!activeSession ? (
          <button className="btn btn-primary" onClick={handleCheckIn} style={{ gap: '8px' }}>
            <ArrowDownLeft size={16} /> Mark Checked-In
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={handleCheckOut} style={{ gap: '8px', background: 'rgba(239,68,68,.1)', border: '1px solid #EF4444', color: '#EF4444' }}>
            <ArrowUpRight size={16} /> Stop Tracking & Checkout
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px' }}>
          <Loader2 size={32} className="spinner" color="#6366F1" />
          <p style={{ color: 'var(--text-muted)' }}>Fetching logs...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Summary Stacks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #6366F1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Work Done</span>
                <Clock3 size={16} color="#6366F1" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {formatDuration(records.reduce((acc, r) => acc + (r.duration || 0), 0))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Across {records.length} sessions</p>
            </div>
            
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Session</span>
                <ArrowDownLeft size={16} color="#10B981" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: activeSession ? '#10B981' : 'var(--text-muted)' }}>
                {activeSession ? 'Active Now' : 'Offline'}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeSession ? `Started at ${formatTime(activeSession.checkIn)}` : 'Last seen: ' + (records[0] ? formatDate(records[0].checkIn) : 'N/A')}
              </p>
            </div>
          </div>

          {/* Filtering - only for Admins */}
          {isAdmin && (
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '32px', height: '36px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'ACTIVE', 'COMPLETED'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '11px', fontWeight: 600 }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History List */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Activity Journals</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time audit log correlation enabled</div>
            </div>
            
            {filteredRecords.length === 0 ? (
               <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                 No logs found.
               </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-bg)', borderBottom: '1px solid var(--surface-border)' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date & User</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Session</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < filteredRecords.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700 }}>
                               {r.user.firstName[0]}{r.user.lastName[0]}
                             </div>
                             <div>
                               <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.user.firstName} {r.user.lastName}</div>
                               <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(r.checkIn)}</div>
                             </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <Building2 size={12} color="var(--text-muted)" />
                            {r.branch?.name || 'Main Office'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                           <div style={{ fontSize: '13px', fontWeight: 500 }}>{formatTime(r.checkIn)} - {r.checkOut ? formatTime(r.checkOut) : '...'}</div>
                           {r.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{r.notes}</div>}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                           <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>
                             {r.status}
                           </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: 600, color: '#6366F1' }}>
                           {formatDuration(r.duration)}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', gap: '4px', fontSize: '11px' }} title="View session audits">
                            <FileText size={14} /> See Trails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Insights - Mock / Integration teaser */}
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(to right, rgba(99,102,241,.03), transparent)' }}>
             <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <BarChart3 size={20} color="#6366F1" />
               </div>
               <div>
                 <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Attendance Insights</h4>
                 <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.5 }}>
                   Admin module is correlating these session times with Audit Logs. You can see the exact productivity index by comparing hours logged vs modifications made in Leads/Deals modules.
                 </p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
