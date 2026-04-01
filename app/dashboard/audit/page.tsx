'use client'

import { useState, useEffect } from 'react'
import { Database, Filter, ChevronLeft, ChevronRight, Activity, Calendar as CalendarIcon, User, Search } from 'lucide-react'

type AuditLog = {
  id: string
  action: string
  entity: string
  entityId: string
  changes: any
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
  } | null
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Filtering
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const entities = ['Lead', 'Contact', 'Deal', 'Ticket', 'Product', 'Branch', 'Team', 'Template']
  const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN']

  useEffect(() => {
    fetchLogs()
  }, [page, entityFilter, actionFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      q.set('page', page.toString())
      q.set('limit', '20')
      if (entityFilter) q.set('entity', entityFilter)
      if (actionFilter) q.set('action', actionFilter)

      const res = await fetch(`/api/audit-logs?${q.toString()}`)
      const data = await res.json()
      
      if (data.logs) {
        setLogs(data.logs)
        setTotalPages(data.totalPages || 1)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'var(--success)'
      case 'UPDATE': return 'var(--info)'
      case 'DELETE': return 'var(--danger)'
      case 'LOGIN': return 'var(--warning)'
      default: return 'var(--text-secondary)'
    }
  }

  const formatChanges = (changes: any) => {
    if (!changes) return null
    try {
      const keys = Object.keys(changes)
      if (keys.length === 0) return null
      // Show first 2 keys briefly
      const summary = keys.slice(0, 2).map(k => `${k}: ${String(changes[k]).substring(0, 15)}...`).join(', ')
      return summary + (keys.length > 2 ? ` (+${keys.length - 2} more)` : '')
    } catch {
      return 'Complex object'
    }
  }

  return (
    <div className="module-container p-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
            <Database size={28} className="text-indigo-400" />
            Audit Logs
          </h1>
          <p className="text-[var(--text-muted)] mt-1">System-wide activity and security tracking</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium mr-4">
          <Filter size={18} />
          <span>Filters:</span>
        </div>

        <select 
          className="form-input w-40"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Entities</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select 
          className="form-input w-40"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {(entityFilter || actionFilter) && (
          <button 
            onClick={() => { setEntityFilter(''); setActionFilter(''); setPage(1); }}
            className="text-sm text-indigo-400 hover:text-indigo-300 ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Log Table */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Entity</th>
                <th className="p-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                    <div className="spinner w-6 h-6 mx-auto mb-2"></div>
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(log.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                            {log.user.firstName[0]}{log.user.lastName[0]}
                          </div>
                          <span className="text-sm">{log.user.firstName} {log.user.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[var(--text-muted)]">System</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span 
                        className="px-2 py-1 rounded text-xs font-mono font-bold"
                        style={{ color: getActionColor(log.action), backgroundColor: `${getActionColor(log.action)}15` }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">{log.entity}</div>
                      <div className="text-xs text-[var(--text-muted)] font-mono">{log.entityId}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-[var(--text-secondary)] max-w-xs truncate font-mono bg-black/20 p-1.5 rounded border border-white/5">
                        {formatChanges(log.changes) || 'No specific changes recorded'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Setup */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="btn-ghost px-3 py-1 flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="btn-ghost px-3 py-1 flex items-center gap-1 disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
