'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  HeadphonesIcon,
  Shield,
  Zap,
  Globe,
  Building2
} from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const callbackError = searchParams.get('error')
    if (callbackError) setError('Authentication failed. Please try again.')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: BarChart3, title: 'Sales Pipeline', desc: 'Visual drag & drop pipeline management' },
    { icon: Users, title: 'Lead Management', desc: 'Smart scoring & automated follow-ups' },
    { icon: HeadphonesIcon, title: 'Support Desk', desc: 'SLA-driven ticket resolution' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access & audit trails' },
    { icon: Zap, title: 'Automation', desc: 'Workflow automation & triggers' },
    { icon: Globe, title: 'Multi-Branch', desc: 'Manage all branches from one platform' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Left Side - Professional Branding Section */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid #E2E8F0',
        }}
        className={mounted ? 'animate-fade-in' : ''}
      >
        {/* Subtle Grid Background */}
        <div style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          opacity: 0.25,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '64px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.12)'
              }}
            >
              <Building2 size={28} color="white" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.8px',
              }}
            >
              Multi<span style={{ color: '#2563EB' }}>CRM</span>
            </span>
          </div>

          {/* Hero Text */}
          <h1
            style={{
              fontSize: '52px',
              fontWeight: 900,
              color: '#0F172A',
              lineHeight: 1.1,
              letterSpacing: '-2px',
              marginBottom: '24px',
            }}
          >
            Empower your{' '} <br />
            <span style={{ color: '#2563EB' }}>Operation.</span>
          </h1>
          <p
            style={{
              fontSize: '19px',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '56px',
              fontWeight: 500
            }}
          >
            The professional infrastructure for omnichannel business growth. 
            Secure, scalable, and built for the modern enterprise.
          </p>

          {/* Feature List */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className={mounted ? 'animate-fade-in-up' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'backwards',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}
              >
                <feature.icon size={22} color="#2563EB" strokeWidth={2} />
                <div>
                  <div
                    style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}
                  >
                    {feature.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Professional Login Form */}
      <div
        style={{
          width: '560px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#FFFFFF',
        }}
        className={mounted ? 'animate-slide-in-right' : ''}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 900,
              color: '#0F172A',
              marginBottom: '12px',
              letterSpacing: '-1px'
            }}
          >
            Sign In
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#64748B',
              marginBottom: '40px',
              fontWeight: 500
            }}
          >
            Enter your credentials to access your workspace
          </p>

          {error && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: '#DC2626',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '28px',
              }}
              className="animate-scale-in"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '24px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#475569', 
                  marginBottom: '10px' 
                }} 
                htmlFor="email"
              >
                Business Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ 
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '15px',
                    backgroundColor: '#F8FAFC',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563EB'
                    e.target.style.backgroundColor = '#FFFFFF'
                    e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E8F0'
                    e.target.style.backgroundColor = '#F8FAFC'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '32px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: '#475569', 
                  marginBottom: '10px' 
                }} 
                htmlFor="password"
              >
                Security Credentials
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security key"
                  required
                  style={{ 
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '15px',
                    backgroundColor: '#F8FAFC',
                    transition: 'all 0.2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#2563EB'
                    e.target.style.backgroundColor = '#FFFFFF'
                    e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#E2E8F0'
                    e.target.style.backgroundColor = '#F8FAFC'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: '#64748B',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '6px',
                    accentColor: '#2563EB',
                  }}
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                style={{
                  fontSize: '14px',
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Forgot credentials?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#2563EB',
                color: 'white',
                fontSize: '16px',
                fontWeight: 800,
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#1D4ED8'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = '#2563EB'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {isLoading ? (
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  Authenticate <ArrowRight size={20} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              margin: '40px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 800, letterSpacing: '1px' }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
          </div>

          {/* Social login or other options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <button
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google Account
            </button>
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '15px',
              color: '#64748B',
              marginTop: '48px',
              fontWeight: 500
            }}
          >
            Don&apos;t have credentials?{' '}
            <a
              href="/auth/register"
              style={{
                color: '#2563EB',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Apply for access
            </a>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-bg)' }}>
        <div className="spinner" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
