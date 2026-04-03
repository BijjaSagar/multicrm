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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-grid-slate-200/[0.3]">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-2xl bg-blue-600/10 border border-blue-600/20 mb-4 shadow-sm">
              <Ticket size={40} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Portal</h1>
            <p className="text-slate-600 mt-2 font-medium">Enterprise ticket tracking system</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 border border-slate-200">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex gap-3 font-semibold">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Ticket Reference Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></span>
                  <input 
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium text-slate-900" 
                    placeholder="e.g. MCR-0001" 
                    required 
                    value={ticketNum}
                    onChange={e => setTicketNum(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Authorized Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={18} /></span>
                  <input 
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium text-slate-900" 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                disabled={loading} 
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Track Progress <ArrowLeft size={18} className="rotate-180" /></>}
              </button>
            </form>
          </div>
          <p className="text-center text-slate-400 text-sm mt-12 font-semibold tracking-wide flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200"></span>
            SECURE ACCESS PROVIDED BY MULTICRM
            <span className="w-8 h-[1px] bg-slate-200"></span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans">
      {/* Header */}
      <div className="border-b border-slate-100 bg-slate-50/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setTicket(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group">
            <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-blue-600/20 group-hover:shadow-sm shadow-black/[0.02]">
              <ArrowLeft size={18} />
            </div>
            Exit View
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-100">
              {ticket.ticketNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                ticket.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                ticket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {ticket.status}
              </span>
              <span className="text-slate-400 text-xs font-bold flex items-center gap-2">
                <Clock size={12} /> {new Date(ticket.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{ticket.subject}</h1>
            <div className="p-6 rounded-2xl bg-slate-50 border border-transparent text-slate-700 leading-relaxed font-medium">
              {ticket.description}
            </div>
          </div>
          
          <div className="md:w-72">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-[10px] uppercase text-slate-400 font-black mb-5 tracking-[2px]">Managed By</h3>
              {ticket.assignedTo ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-md font-black shadow-lg shadow-blue-600/20">
                    {ticket.assignedTo.firstName[0]}{ticket.assignedTo.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</div>
                    <div className="text-[11px] text-blue-600 font-bold">Solutions Architect</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 italic text-amber-600 text-xs font-bold">
                  <Loader2 size={14} className="animate-spin" /> Awaiting specialist...
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-[10px] uppercase text-slate-400 font-black mb-4 tracking-[2px]">Case Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Security</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">End-to-End</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Priority</span>
                    <span className="text-slate-900">Standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10 mb-16">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 rounded bg-blue-600 text-white"><MessageCircle size={16} strokeWidth={3} /></div>
            Audit Trail & Discussion
          </h3>
          
          <div className="relative pl-8 border-l-[3px] border-slate-100 space-y-12 ml-4">
            {/* Creation Event */}
            <div className="relative">
              <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-[3px] border-slate-100 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-2">
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
              <div className="text-sm font-bold text-slate-500">System generated: Ticket registered.</div>
            </div>

            {ticket.comments.map((comment: any) => (
              <div key={comment.id} className="relative">
                <div className={`absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-[3px] flex items-center justify-center ${
                  comment.user ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {comment.user ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                  )}
                </div>
                
                <div className={`p-8 rounded-[2rem] border transition-all ${
                  comment.user 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                    : 'bg-white border-slate-200 shadow-sm text-slate-900'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      comment.user ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {comment.user ? `Expert Response - ${comment.user.firstName}` : `Authorized Contact - ${ticket.contact.firstName}`}
                    </span>
                    <span className={`text-[10px] font-bold italic ${
                      comment.user ? 'text-blue-200/60' : 'text-slate-400'
                    }`}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className={`text-base leading-relaxed font-medium ${
                    comment.user ? 'text-white' : 'text-slate-800'
                  }`}>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ticket.status !== 'CLOSED' && (
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-200">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
              Post Professional Reply
            </h3>
            <form onSubmit={handlePostComment}>
              <div className="bg-white rounded-2xl border border-slate-200 p-2 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/10 transition-all mb-6">
                <textarea 
                  className="w-full min-h-[160px] bg-transparent border-none focus:ring-0 p-4 font-medium text-slate-900 placeholder:text-slate-400" 
                  placeholder="Summarize your technical update or inquiry..."
                  required
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
              </div>
              <div className="flex justify-end items-center gap-6">
                <span className="text-xs font-bold text-slate-400">Secure Transmission Enabled</span>
                <button 
                  disabled={sending} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-3"
                >
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <>Send Update <MessageCircle size={18} /></>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
