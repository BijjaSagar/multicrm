'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Loader2, Bot, User, Minimize2, Maximize2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getVerticalConfig } from '@/lib/vertical-config'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_PROMPTS = [
  'How do I qualify a lead?',
  'Draft a follow-up message',
  'What should I do with a cold lead?',
  'Tips to improve conversion rate',
]

export function AiChatWidget() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasKey, setHasKey] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const verticalConfig = getVerticalConfig(session?.user?.tenantSettings?.verticalKey)

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: newMessages,
          context: {
            vertical: verticalConfig.entityName,
            tenantName: session?.user?.tenantName,
            role: session?.user?.role,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) setHasKey(false)
        throw new Error(data.error)
      }
      setMessages([...newMessages, { role: 'assistant', content: data.result }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          border: 'none', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(99,102,241,0.4)', transition: 'transform 200ms',
        }}
        title="AI Assistant"
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Sparkles size={24} />
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
        width: '380px',
        height: minimized ? 'auto' : '520px',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-bg)', border: '1px solid var(--surface-border)',
        borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={17} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>MultiCRM AI Assistant</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{verticalConfig.entityName} expert · Always on</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setMinimized(!minimized)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: 'white', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={15} color="white" />
                  </div>
                  <div style={{ background: 'var(--surface-raised)', padding: '12px 14px', borderRadius: '12px 12px 12px 4px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', maxWidth: '280px' }}>
                    Hi! I'm your {verticalConfig.entityName} CRM assistant. Ask me anything about your pipeline, leads, or sales strategies.
                    {!hasKey && <><br /><br /><strong style={{ color: '#EF4444' }}>⚠️ ANTHROPIC_API_KEY not configured.</strong> Add it to your .env to enable AI.</>}
                  </div>
                </div>
                <div style={{ paddingLeft: '38px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {STARTER_PROMPTS.map((p) => (
                    <button key={p} onClick={() => sendMessage(p)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 100ms' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366F1'; (e.currentTarget as HTMLButtonElement).style.color = '#6366F1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: msg.role === 'user' ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {msg.role === 'user' ? <User size={13} color="white" /> : <Bot size={13} color="white" />}
                  </div>
                  <div style={{ background: msg.role === 'user' ? 'rgba(99,102,241,0.08)' : 'var(--surface-raised)', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', maxWidth: '270px', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={13} color="white" />
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '12px 14px', borderRadius: '4px 12px 12px 12px' }}>
                  <Loader2 size={14} className="spinner" color="var(--text-muted)" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask anything about your CRM..."
              className="input"
              style={{ flex: 1, fontSize: '13px', height: '38px' }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ width: '38px', height: '38px', borderRadius: '10px', background: input.trim() ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'var(--surface-raised)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', color: input.trim() ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0 }}
            >
              <Send size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
