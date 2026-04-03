'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Save,
  Check,
  Loader2,
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    setMounted(true)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.user) {
        setUserData(data.user)
        // Initialize form data from tenant settings
        const tenantSettings = data.user.tenant?.settings || {}
        setFormData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          tenantName: data.user.tenant?.name,
          industry: tenantSettings.industry || 'Technology',
          currency: tenantSettings.currency || 'INR',
          timezone: tenantSettings.timezone || 'Asia/Kolkata',
          metaDisplayName: tenantSettings.meta?.displayName || '',
          metaAppId: tenantSettings.meta?.appId || '',
          metaVerifyToken: tenantSettings.meta?.verifyToken || '',
          metaAccessToken: tenantSettings.meta?.accessToken || '',
          smsProvider: tenantSettings.sms?.provider || 'MSG91',
          smsApiKey: tenantSettings.sms?.apiKey || '',
          smsSenderId: tenantSettings.sms?.senderId || '',
          smsTemplateId: tenantSettings.sms?.templateId || '',
        })
      }
    } catch (err) { console.error(err) }
  }

  const handleUpdate = async (section: string, payload: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, ...payload }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchSettings()
    } catch (err) {
      alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'custom-fields', label: 'Custom Fields', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'email', label: 'Email Settings', icon: Mail },
  ]

  if (!mounted) return null

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} style={{ color: 'var(--text-muted)' }} />
          Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account and application preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
        {/* Tabs */}
        <div className="card" style={{ padding: '8px', height: 'fit-content' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ marginBottom: '2px' }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card animate-fade-in">
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Profile Settings</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '28px', fontWeight: 700,
                }}>
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>{userData?.firstName} {userData?.lastName}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{userData?.email}</div>
                  <button className="btn btn-secondary btn-sm">Change Avatar</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label className="label">First Name</label><input name="firstName" className="input" value={formData.firstName || ''} onChange={handleInputChange} /></div>
                <div><label className="label">Last Name</label><input name="lastName" className="input" value={formData.lastName || ''} onChange={handleInputChange} /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={userData?.email || ''} disabled /></div>
                <div><label className="label">Phone</label><input name="phone" className="input" value={formData.phone || ''} onChange={handleInputChange} /></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => handleUpdate('profile', { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone })} disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={16} /> : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Organization Settings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label className="label">Organization Name</label><input name="tenantName" className="input" value={formData.tenantName || ''} onChange={handleInputChange} /></div>
                <div><label className="label">Industry</label>
                  <select name="industry" className="input" value={formData.industry} onChange={handleInputChange}>
                    <option>Technology</option><option>Healthcare</option><option>Finance</option><option>Education</option><option>Manufacturing</option><option>Retail</option>
                  </select>
                </div>
                <div><label className="label">Currency</label>
                  <select name="currency" className="input" value={formData.currency} onChange={handleInputChange}>
                    <option value="INR">INR - Indian Rupee</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div><label className="label">Timezone</label>
                  <select name="timezone" className="input" value={formData.timezone} onChange={handleInputChange}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="America/New_York">America/New_York (EST)</option><option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => handleUpdate('organization', { name: formData.tenantName, industry: formData.industry, currency: formData.currency, timezone: formData.timezone })} disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={16} /> : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Integrations Settings</h2>

              <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Globe size={20} color="#1877F2" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Meta Integration</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">Display Name</label>
                    <input name="metaDisplayName" className="input" value={formData.metaDisplayName || ''} onChange={handleInputChange} />
                  </div>
                  <div><label className="label">App ID</label><input name="metaAppId" className="input" value={formData.metaAppId || ''} onChange={handleInputChange} /></div>
                  <div><label className="label">Verify Token</label><input name="metaVerifyToken" className="input" value={formData.metaVerifyToken || ''} onChange={handleInputChange} /></div>
                  <div style={{ gridColumn: 'span 2' }}><label className="label">System Access Token</label><input name="metaAccessToken" className="input" type="password" value={formData.metaAccessToken || ''} onChange={handleInputChange} /></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Mail size={20} color="#EF4444" />
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>SMS Service Provider</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="label">Provider Type</label>
                    <select name="smsProvider" className="input" value={formData.smsProvider} onChange={handleInputChange}>
                      <option value="MSG91">MSG91</option><option value="HSM">Direct HSM</option><option value="GUPSHUP">Gupshup</option>
                    </select>
                  </div>
                  <div><label className="label">API Key</label><input name="smsApiKey" className="input" type="password" value={formData.smsApiKey || ''} onChange={handleInputChange} /></div>
                  <div><label className="label">Sender ID</label><input name="smsSenderId" className="input" value={formData.smsSenderId || ''} onChange={handleInputChange} /></div>
                  <div><label className="label">Default Template ID</label><input name="smsTemplateId" className="input" value={formData.smsTemplateId || ''} onChange={handleInputChange} /></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => handleUpdate('integrations', { 
                  metaDisplayName: formData.metaDisplayName, 
                  metaAppId: formData.metaAppId, 
                  metaVerifyToken: formData.metaVerifyToken, 
                  metaAccessToken: formData.metaAccessToken,
                  smsProvider: formData.smsProvider,
                  smsApiKey: formData.smsApiKey,
                  smsSenderId: formData.smsSenderId,
                  smsTemplateId: formData.smsTemplateId
                })} disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={16} /> : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Integrations</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Notification Preferences</h2>
              {[
                { label: 'Email Notifications', desc: 'Receive updates via email for leads, deals, and tickets', key: 'emailNotifs' },
                { label: 'Browser Notifications', desc: 'Get push notifications in your browser', key: 'browserNotifs' },
                { label: 'Lead Assignments', desc: 'Notify when a new lead is assigned to you', key: 'leadNotifs' },
                { label: 'Deal Updates', desc: 'Notify when deal stages change', key: 'dealNotifs' },
                { label: 'Ticket Replies', desc: 'Notify when a ticket receives a reply', key: 'ticketNotifs' },
                { label: 'Weekly Reports', desc: 'Receive a weekly summary of your CRM activity', key: 'weeklyReport' },
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                  <label style={{ position: 'relative', width: '44px', height: '24px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', inset: 0, background: '#6366F1', borderRadius: '12px', transition: 'background 200ms' }} />
                    <span style={{ position: 'absolute', top: '3px', left: '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'transform 200ms', transform: 'translateX(20px)' }} />
                  </label>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
                  {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Security Settings</h2>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
                  <div><label className="label">Current Password</label><input type="password" className="input" placeholder="Enter current password" /></div>
                  <div><label className="label">New Password</label><input type="password" className="input" placeholder="Enter new password" /></div>
                  <div><label className="label">Confirm Password</label><input type="password" className="input" placeholder="Confirm new password" /></div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Active Sessions</h3>
                <div style={{ background: 'var(--surface-raised)', borderRadius: '10px', padding: '16px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Current Session</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active now • Chrome on macOS</div>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
                  {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Update Password</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Appearance</h2>
              <div style={{ marginBottom: '24px' }}>
                <label className="label">Theme</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <button className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--surface-border)' }} onClick={() => { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light') }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Light</div>
                  </button>
                  <button className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', border: '2px solid var(--surface-border)' }} onClick={() => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark') }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1E1E2E', border: '1px solid #374151', margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Dark</div>
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Sidebar Density</label>
                <select className="input" style={{ maxWidth: '300px' }}>
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Email Configuration</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label className="label">SMTP Host</label><input className="input" placeholder="smtp.gmail.com" /></div>
                <div><label className="label">SMTP Port</label><input className="input" placeholder="587" /></div>
                <div><label className="label">Username</label><input className="input" placeholder="your@email.com" /></div>
                <div><label className="label">Password</label><input className="input" type="password" placeholder="App password" /></div>
                <div><label className="label">From Name</label><input className="input" placeholder="MultiCRM" /></div>
                <div><label className="label">From Email</label><input className="input" placeholder="noreply@yourcompany.com" /></div>
              </div>
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(99,102,241,.05)', borderRadius: '10px', border: '1px solid rgba(99,102,241,.15)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Test Connection</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send a test email to verify your SMTP configuration works.</div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>Send Test Email</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
                  {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Email Config</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'custom-fields' && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                 <Settings size={32} className="text-blue-500" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Horizontal Custom Fields</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px', lineHeight: '1.6' }}>
                Extend MultiCRM across verticals by creating industry-specific data points for your business entities.
              </p>
              <a 
                href="/dashboard/settings/custom-fields" 
                className="btn btn-primary"
                style={{ padding: '12px 32px', fontSize: '14px', borderRadius: '10px' }}
              >
                Launch Field Builder
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
