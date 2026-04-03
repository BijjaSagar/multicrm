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
      <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{ fontSize: '12px', color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckSquare size={14} /> Mark all read
          </button>
        )}
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '13px' }}>You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id)
                if (n.link && typeof window !== 'undefined') window.location.href = n.link
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 150ms',
                background: !n.isRead ? 'rgba(99,102,241,.08)' : 'transparent',
                marginBottom: '2px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: !n.isRead ? 600 : 500, color: !n.isRead ? 'var(--text-primary)' : 'var(--text-secondary)', margin: 0 }}>
                    {n.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {n.message}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'monospace' }}>
                    {getTimeAgo(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1', marginTop: '6px', flexShrink: 0 }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
