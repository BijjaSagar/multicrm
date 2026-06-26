'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

type ResolverFn = (confirmed: boolean) => void

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
})

export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<ResolverFn | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOpts(options)
      setResolver(() => resolve)
    })
  }, [])

  const handleResponse = (confirmed: boolean) => {
    resolver?.(confirmed)
    setOpts(null)
    setResolver(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {opts && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => handleResponse(false)}
        >
          <div
            className="card animate-scale-in"
            style={{ width: '420px', padding: '28px', borderRadius: '16px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: opts.danger ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {opts.danger
                  ? <Trash2 size={20} color="#EF4444" />
                  : <AlertTriangle size={20} color="#F59E0B" />
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {opts.title || (opts.danger ? 'Confirm Delete' : 'Are you sure?')}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {opts.message}
                </p>
              </div>
              <button
                onClick={() => handleResponse(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', marginTop: '-2px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => handleResponse(false)}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={() => handleResponse(true)}
                style={{
                  background: opts.danger ? '#EF4444' : 'var(--primary-500)',
                  color: 'white',
                  border: 'none',
                }}
              >
                {opts.confirmLabel || (opts.danger ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
