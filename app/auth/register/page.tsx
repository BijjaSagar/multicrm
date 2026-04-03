'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2,
  Shield,
  Zap,
  Globe,
  Activity,
  Hotel,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Globe2,
  Layout
} from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    verticalKey: 'GENERAL'
  })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }
      
      setSuccessMsg('Account authorized! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade data protection' },
    { icon: Zap, title: 'Rapid Deployment', desc: 'Go live in under 5 minutes' },
    { icon: Globe, title: 'Global Infrastructure', desc: 'Low latency across 20+ regions' },
    { icon: Activity, title: 'Real-time Analytics', desc: 'Predictive growth insights' }
  ]

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#FFFFFF' }}>
      {/* Left Side */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden'
      }} className="animate-fade-in">
        <div style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.2,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '560px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '64px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', background: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Building2 color="white" size={28} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>Multi<span style={{ color: '#2563EB' }}>CRM</span></span>
          </div>

          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0F172A', marginBottom: '24px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            The standard for <span style={{ color: '#2563EB' }}>Modern Operations.</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#475569', marginBottom: '64px', lineHeight: 1.6, fontWeight: 500 }}>
            Join 1,200+ fast-growing enterprises scaling their customer relationships with MultiCRM.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {benefits.map((benefit, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px' }} className="animate-fade-in-up">
                <div style={{ 
                  flexShrink: 0, width: '44px', height: '44px', borderRadius: '12px',
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <benefit.icon size={20} color="#2563EB" />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{benefit.title}</h4>
                  <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div style={{ width: '640px', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>Request Workspace Access</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px', fontWeight: 500 }}>Join the ecosystem of elite enterprise teams.</p>

          {error && <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#B91C1C', marginBottom: '24px', fontSize: '14px', fontWeight: 700 }}>{error}</div>}
          {successMsg && <div style={{ padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '12px', color: '#15803D', marginBottom: '24px', fontSize: '14px', fontWeight: 700 }}>{successMsg}</div>}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>Company / Organization Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input required style={{ 
                  width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC', fontSize: '15px'
                }} value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Microsoft India" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>Primary Business Vertical</label>
              <div style={{ position: 'relative' }}>
                <Layout size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <select 
                  required 
                  style={{ 
                    width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC', fontSize: '15px', appearance: 'none'
                  }} 
                  value={formData.verticalKey} 
                  onChange={e => setFormData({...formData, verticalKey: e.target.value})}
                >
                  <option value="GENERAL">General Business (Horizontal)</option>
                  <option value="REAL_ESTATE">Real Estate (Residential/Luxury)</option>
                  <option value="HEALTHCARE">Healthcare (Clinics/Diagnostic)</option>
                  <option value="EDUCATION">Education (Courses/Schools)</option>
                  <option value="ECOMMERCE">eCommerce (Stores/Supplies)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>First Name</label>
                <input required style={{ 
                  padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC', fontSize: '15px'
                }} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Satya" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>Last Name</label>
                <input required style={{ 
                  padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC', fontSize: '15px'
                }} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Nadella" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input required type="email" style={{ 
                  width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC', fontSize: '15px'
                }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ceo@microsoft.com" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 800, color: '#475569' }}>Secure Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input required type="password" style={{ 
                  width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC', fontSize: '15px'
                }} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
            </div>

            <button disabled={isLoading} style={{ 
              marginTop: '12px', width: '100%', padding: '18px', backgroundColor: '#2563EB',
              color: 'white', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '16px',
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              opacity: isLoading ? 0.5 : 1
            }}>
              {isLoading ? 'Processing Authorization...' : <>Generate Access Token <ArrowRight size={20} strokeWidth={2.5} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
            Already an authorized user? <Link href="/auth/login" style={{ color: '#2563EB', fontWeight: 800, textDecoration: 'none' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
