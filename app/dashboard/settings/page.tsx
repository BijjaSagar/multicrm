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

          {(activeTab === 'notifications' || activeTab === 'security' || activeTab === 'appearance' || activeTab === 'email') && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Coming Soon</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>This section is under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
