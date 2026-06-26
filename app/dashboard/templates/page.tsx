'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail, Plus, Search, Edit, Trash2, X,
  Loader2, RefreshCw, AlertCircle, CheckCircle2, XCircle,
  Copy, Eye, FileText, Sparkles, Wand2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getVerticalConfig } from '@/lib/vertical-config'
import { useConfirm } from '@/components/confirm-modal'

interface Template {
  id: string
  name: string
  subject: string
  body: string
  category: string | null
  variables: string | null
  isActive: boolean
  createdAt: string
}

export default function TemplatesPage() {
  const { data: session } = useSession()
  const { confirm } = useConfirm()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiBodyRef, setAiBodyRef] = useState<HTMLTextAreaElement | null>(null)
  const [aiSubjectRef, setAiSubjectRef] = useState<HTMLInputElement | null>(null)
  const [generatingBody, setGeneratingBody] = useState(false)
  const [generatingSubject, setGeneratingSubject] = useState(false)
  const [aiError, setAiError] = useState('')

  const vertical = getVerticalConfig(session?.user?.tenantSettings?.verticalKey)

  const generateBody = async () => {
    if (!aiPrompt.trim() || !aiBodyRef) return
    setGeneratingBody(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'email-generate', prompt: aiPrompt, vertical: vertical.entityName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      aiBodyRef.value = data.result
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI generation failed')
    } finally {
      setGeneratingBody(false)
    }
  }

  const generateSubject = async () => {
    if (!aiBodyRef?.value || !aiSubjectRef) return
    setGeneratingSubject(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subject-generate', body: aiBodyRef.value, vertical: vertical.entityName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      aiSubjectRef.value = data.result
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Subject generation failed')
    } finally {
      setGeneratingSubject(false)
    }
  }

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/templates')
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json()
      setTemplates(data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          subject: form.get('subject'),
          body: form.get('body'),
          category: form.get('category'),
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      setShowModal(false)
      fetchTemplates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: 'Delete Template', message: 'Delete this template? This cannot be undone.', danger: true })) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    fetchTemplates()
  }

  const categories = ['Sales', 'Support', 'Onboarding', 'Follow-up', 'General']
  const catColors: Record<string, string> = { Sales: '#10B981', Support: '#6366F1', Onboarding: '#F59E0B', 'Follow-up': '#06B6D4', General: '#8B5CF6' }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={24} style={{ color: '#06B6D4' }} /> Email Templates
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{templates.length} templates</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchTemplates}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Template</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spinner" /> Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Mail size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No email templates yet</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Create your first template to streamline communications</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {templates.map((template, i) => {
            const cat = template.category || 'General'
            return (
              <div key={template.id} className="card animate-fade-in-up" style={{ padding: '22px', animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${catColors[cat] || '#8B5CF6'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} color={catColors[cat] || '#8B5CF6'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700 }}>{template.name}</div>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, background: `${catColors[cat] || '#8B5CF6'}15`, color: catColors[cat] || '#8B5CF6' }}>{cat}</span>
                    </div>
                  </div>
                  {template.isActive
                    ? <span style={{ fontSize: '10px', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Active</span>
                    : <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Inactive</span>
                  }
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Subject</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{template.subject}</div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '16px', lineHeight: '1.5' }}>
                  {template.body.replace(/<[^>]*>/g, '').slice(0, 200)}...
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Created: {new Date(template.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPreviewTemplate(template)} style={{ fontSize: '12px' }}><Eye size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(template.id)} style={{ color: '#EF4444', fontSize: '12px' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setPreviewTemplate(null)}>
          <div className="card animate-scale-in" style={{ width: '640px', maxHeight: '80vh', overflow: 'auto', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Template Preview</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setPreviewTemplate(null)}><X size={18} /></button>
            </div>
            <div style={{ background: 'var(--surface-bg)', borderRadius: '12px', padding: '24px', border: '1px solid var(--surface-border)' }}>
              <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                <strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subject:</strong>
                <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{previewTemplate.subject}</div>
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{previewTemplate.body}</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => { setShowModal(false); setAiError('') }}>
          <div className="card animate-scale-in" style={{ width: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Create Email Template</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowModal(false); setAiError('') }}><X size={18} /></button>
            </div>

            {/* AI Generator Panel */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))', border: '1px solid rgba(99,102,241,0.15)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="#6366F1" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366F1' }}>AI Template Generator</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input"
                  placeholder={`e.g., "follow-up after a ${vertical.entityName.toLowerCase()} inquiry, friendly tone"`}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  style={{ flex: 1, fontSize: '13px' }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); generateBody() } }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={generateBody}
                  disabled={generatingBody || !aiPrompt.trim()}
                  style={{ gap: '6px', whiteSpace: 'nowrap' }}
                >
                  {generatingBody ? <Loader2 size={14} className="spinner" /> : <Wand2 size={14} />}
                  Generate Body
                </button>
              </div>
              {aiError && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '8px' }}>{aiError}</p>}
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label className="label">Template Name *</label><input name="name" className="input" placeholder="e.g., Welcome Email" required /></div>
                  <div><label className="label">Category</label>
                    <select name="category" className="input">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="label" style={{ marginBottom: 0 }}>Subject Line *</label>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={generateSubject} disabled={generatingSubject} style={{ fontSize: '11px', gap: '4px', color: '#6366F1' }}>
                      {generatingSubject ? <Loader2 size={10} className="spinner" /> : <Sparkles size={10} />} AI Subject
                    </button>
                  </div>
                  <input name="subject" className="input" placeholder="Hello {{firstName}}, welcome aboard!" required ref={(el) => setAiSubjectRef(el)} />
                </div>
                <div>
                  <label className="label">Email Body *</label>
                  <textarea name="body" className="input" rows={9} placeholder={'Hi {{firstName}},\n\nThank you for your interest in our services...\n\nBest regards,\n{{senderName}}'} required style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} ref={(el) => setAiBodyRef(el)} />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Use {'{{variable}}'} for dynamic content: {'{{firstName}}, {{company}}, {{dealTitle}}'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setAiError('') }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Create Template</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
