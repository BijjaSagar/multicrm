'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckSquare } from 'lucide-react'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  link?: string
}

export function NotificationsPopover({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const getTimeAgo = (dateStr: string) => {
    const min = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (min < 1) return 'Just now'
    if (min < 60) return `${min}m ago`
    if (min < 1440) return `${Math.floor(min / 60)}h ago`
    return `${Math.floor(min / 1440)}d ago`
  }

  return (
    <div
      className="animate-fade-in-down"
      style={{
        position: 'absolute',
        right: 0,
        top: '44px',
        width: '360px',
        background: 'var(--surface-bg)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        zIndex: 50,
      }}
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <span className="font-semibold text-sm">Notifications</span>
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead} 
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <CheckSquare size={14} /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-[400px] overflow-y-auto p-2">
        {loading ? (
          <div className="p-6 text-center text-sm text-[var(--text-muted)]">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)] flex flex-col items-center">
            <Bell size={24} className="mb-2 opacity-50" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id)
                if (n.link && typeof window !== 'undefined') window.location.href = n.link
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                !n.isRead ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <h4 className={`text-sm ${!n.isRead ? 'font-semibold text-white' : 'font-medium text-[var(--text-secondary)]'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1 break-words line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 font-mono">
                    {getTimeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
