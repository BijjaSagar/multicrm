'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
})

export const useToast = () => useContext(ToastContext)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', icon: '#10B981', text: '#065F46' },
  error:   { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.25)',  icon: '#EF4444', text: '#991B1B' },
  warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', icon: '#F59E0B', text: '#92400E' },
  info:    { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.25)', icon: '#6366F1', text: '#3730A3' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timerRef.current)
  }, [toast.id, onRemove])

  const dismiss = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const c = COLORS[toast.type]
  const Icon = ICONS[toast.type]

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '13px 16px', borderRadius: '12px',
        background: 'var(--surface-bg)', border: `1px solid ${c.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '280px', maxWidth: '380px',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(60px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'auto',
        borderLeft: `4px solid ${c.icon}`,
      }}
    >
      <Icon size={18} color={c.icon} style={{ marginTop: '1px', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: '1.5' }}>
        {toast.message}
      </span>
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', borderRadius: '4px', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-4), { id, type, message }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const ctx: ToastContextValue = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg),
    warning: (msg) => add('warning', msg),
    info:    (msg) => add('info', msg),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: '96px', right: '24px', zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: '8px',
          alignItems: 'flex-end', pointerEvents: 'none',
        }}
      >
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}
