'use client'

import { useState } from 'react'
import { Ticket, Search, Mail, Loader2, MessageCircle, ArrowLeft, Clock, AlertCircle } from 'lucide-react'

export default function TicketPortal() {
  const [ticketNum, setTicketNum] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<any>(null)
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/tickets?number=${ticketNum}&email=${email}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ticket not found')
      setTicket(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/portal/tickets/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, email, content: newComment })
      })
      if (!res.ok) throw new Error('Failed to post reply')
      // Refresh ticket state
      const refresh = await fetch(`/api/portal/tickets?number=${ticketNum}&email=${email}`)
      const updated = await refresh.json()
      setTicket(updated)
      setNewComment('')
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 radial-gradient-dark">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <Ticket size={40} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Customer Support Portal</h1>
            <p className="text-slate-400 mt-2">Enter your ticket number and email to track status</p>
          </div>

          <div className="card glass-morphism p-8 border-slate-800">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <label className="label text-slate-300">Ticket Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Search size={16} /></span>
                  <input 
                    className="input pl-12 bg-slate-900 border-slate-800 focus:border-indigo-500" 
                    placeholder="MCR-0001" 
                    required 
                    value={ticketNum}
                    onChange={e => setTicketNum(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-300">Registered Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={16} /></span>
                  <input 
                    className="input pl-12 bg-slate-900 border-slate-800 focus:border-indigo-500" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button disabled={loading} className="btn btn-primary w-full h-12 text-md font-semibold">
                {loading ? <Loader2 size={20} className="spinner" /> : 'Track Status'}
              </button>
            </form>
          </div>
          <p className="text-center text-slate-500 text-sm mt-8 mt-12">
            Powered by &copy; {new Date().getFullYear()} MultiCRM Pro
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => setTicket(null)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft size={18} /> Back to Search
        </button>

        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-widest">{ticket.status}</span>
              <span className="text-slate-500 text-sm font-mono">{ticket.ticketNumber}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{ticket.subject}</h1>
            <p className="text-slate-400 line-clamp-2">{ticket.description}</p>
          </div>
          <div className="md:w-64">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <h3 className="text-xs uppercase text-slate-500 font-bold mb-4">Assigned Agent</h3>
              {ticket.assignedTo ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                    {ticket.assignedTo.firstName[0]}{ticket.assignedTo.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</div>
                    <div className="text-xs text-slate-500">Support Agent</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm italic text-slate-500">Awaiting Assignment...</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 mb-12">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock size={20} className="text-indigo-400" /> Timeline
          </h3>
          <div className="relative pl-8 border-l-2 border-slate-800 space-y-8">
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-6 h-6 rounded-full bg-slate-900 border-4 border-slate-800" />
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-xs text-slate-500 mb-2 font-mono">{new Date(ticket.createdAt).toLocaleString()}</div>
                <div className="text-slate-300 leading-relaxed font-medium">Ticket Created: "{ticket.subject}"</div>
              </div>
            </div>

            {ticket.comments.map((comment: any) => (
              <div key={comment.id} className="relative">
                <div className={`absolute -left-[41px] top-0 w-6 h-6 rounded-full border-4 border-slate-800 ${comment.user ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                <div className={`p-6 rounded-2xl border ${comment.user ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-white/[0.03] border-white/5'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {comment.user ? `${comment.user.firstName} ${comment.user.lastName} (Agent)` : `${ticket.contact.firstName} (You)`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono italic">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed text-md">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ticket.status !== 'CLOSED' && (
          <div className="card glass-morphism p-8 border-indigo-500/20 bg-indigo-500/[0.01]">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
              <MessageCircle size={20} className="text-indigo-400" /> Add a Reply
            </h3>
            <form onSubmit={handlePostComment}>
              <textarea 
                className="input min-h-[120px] bg-slate-900 border-slate-800 focus:border-indigo-500 p-4 mb-4" 
                placeholder="Type your message here..."
                required
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button disabled={sending} className="btn btn-primary px-10 h-10">
                  {sending ? <Loader2 size={18} className="spinner" /> : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
