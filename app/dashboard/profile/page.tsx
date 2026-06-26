'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  User, Phone, Lock, Save, Loader2, AlertCircle,
  Eye, EyeOff, ArrowLeft, Shield, Mail, Building2,
} from 'lucide-react'
import { useToast } from '@/components/toast'
import Link from 'next/link'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar: string | null
  role: string
  status: string
  branch: { id: string; name: string; code: string } | null
  tenant: { name: string; plan: string } | null
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN:   { label: 'Super Admin',   color: '#EF4444', bg: 'rgba(239,68,68,.12)'   },
  TENANT_ADMIN:  { label: 'Admin',         color: '#F59E0B', bg: 'rgba(245,158,11,.12)'  },
  MANAGER:       { label: 'Manager',       color: '#6366F1', bg: 'rgba(99,102,241,.12)'  },
  SALES_REP:     { label: 'Sales Rep',     color: '#3B82F6', bg: 'rgba(59,130,246,.12)'  },
  COUNSELLOR:    { label: 'Counsellor',    color: '#8B5CF6', bg: 'rgba(139,92,246,.12)'  },
  SUPPORT_AGENT: { label: 'Support Agent', color: '#10B981', bg: 'rgba(16,185,129,.12)'  },
  VIEWER:        { label: 'Viewer',        color: '#6B7280', bg: 'rgba(107,114,128,.12)' },
}

export default function ProfilePage() {
  const { update } = useSession()
  const toast = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        const u: UserProfile = d.user
        setProfile(u)
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'profile', ...form }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setProfile(p => p ? { ...p, ...form } : p)
      toast.success('Profile updated successfully')
      await update()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPw(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'password', currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to change password')
      }
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spinner" /> Loading profile...
      </div>
    )
  }

  if (!profile) return null

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase()
  const roleInfo = ROLE_LABELS[profile.role] || { label: profile.role, color: '#6B7280', bg: 'rgba(107,114,128,.12)' }
  const hue = (profile.firstName.charCodeAt(0) * 15) % 360
  const pwMismatch = pwForm.newPassword.length > 0 && pwForm.confirmPassword.length > 0 && pwForm.newPassword !== pwForm.confirmPassword
  const pwTooShort = pwForm.newPassword.length > 0 && pwForm.newPassword.length < 8
  const pwValid = pwForm.currentPassword && pwForm.newPassword.length >= 8 && pwForm.newPassword === pwForm.confirmPassword

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <Link href="/dashboard" className="btn btn-ghost btn-icon btn-sm"><ArrowLeft size={18} /></Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} style={{ color: '#6366F1' }} /> My Profile
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage your personal information and account security
          </p>
        </div>
      </div>

      {/* Avatar + Identity card */}
      <div className="card animate-fade-in-up" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px', flexShrink: 0,
            background: `linear-gradient(135deg, hsl(${hue},65%,55%), hsl(${(hue+40)%360},65%,45%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '28px', fontWeight: 700,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {profile.firstName} {profile.lastName}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} /> {profile.email}
            </div>
            {profile.branch && (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={13} /> {profile.branch.name}
              </div>
            )}
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: roleInfo.bg, color: roleInfo.color }}>
                {roleInfo.label}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                background: profile.status === 'ACTIVE' ? 'rgba(16,185,129,.12)' : 'rgba(107,114,128,.12)',
                color: profile.status === 'ACTIVE' ? '#10B981' : '#6B7280',
              }}>
                {profile.status}
              </span>
              {profile.tenant && (
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: 'rgba(99,102,241,.08)', color: '#6366F1' }}>
                  {profile.tenant.plan} Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="card animate-fade-in-up" style={{ padding: '28px', marginBottom: '20px', animationDelay: '80ms', animationFillMode: 'backwards' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} style={{ color: '#6366F1' }} /> Personal Information
        </h2>
        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="label">First Name *</label>
              <input
                className="input"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                className="input"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                value={profile.email}
                disabled
                style={{ opacity: 0.55, cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Email cannot be changed — contact your admin
              </p>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><Loader2 size={15} className="spinner" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card animate-fade-in-up" style={{ padding: '28px', animationDelay: '160ms', animationFillMode: 'backwards' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} style={{ color: '#EF4444' }} /> Change Password
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Use a strong password with at least 8 characters, including letters and numbers.
        </p>
        <form onSubmit={handleChangePassword}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                  style={{ paddingRight: '44px' }}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                  onClick={() => setShowCurrent(s => !s)}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showNew ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    style={{ paddingRight: '44px' }}
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                    onClick={() => setShowNew(s => !s)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            {pwTooShort && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#F59E0B' }}>
                <AlertCircle size={14} /> Password must be at least 8 characters
              </div>
            )}
            {pwMismatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#EF4444' }}>
                <AlertCircle size={14} /> Passwords do not match
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn"
              style={{ background: '#EF4444', color: 'white', opacity: (!pwValid || savingPw) ? 0.6 : 1, cursor: (!pwValid || savingPw) ? 'not-allowed' : 'pointer' }}
              disabled={!pwValid || savingPw}
            >
              {savingPw ? <><Loader2 size={15} className="spinner" /> Changing...</> : <><Shield size={15} /> Change Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
