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
      }}
    >
      {/* Left Side - Hero Section */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 30%, #312E81 60%, #1E293B 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className={mounted ? 'animate-fade-in' : ''}
      >
        {/* Animated background particles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Floating Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '15%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent 70%)',
            filter: 'blur(40px)',
          }}
          className="animate-float"
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 70%)',
            filter: 'blur(40px)',
            animationDelay: '2s',
          }}
          className="animate-float"
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '48px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={24} color="white" />
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              MultiCRM Pro
            </span>
          </div>

          {/* Hero Text */}
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              marginBottom: '20px',
            }}
          >
            Manage your{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              customers
            </span>{' '}
            like never before
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#94A3B8',
              lineHeight: 1.7,
              marginBottom: '48px',
            }}
          >
            The all-in-one CRM platform that unifies sales, support, and customer success.
            Built for teams that want to close more deals and deliver outstanding service.
          </p>

          {/* Feature Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className={mounted ? 'animate-fade-in-up' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <feature.icon size={20} color="#818CF8" />
                <div>
                  <div
                    style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}
                  >
                    {feature.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          width: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'var(--surface-bg)',
        }}
        className={mounted ? 'animate-slide-in-right' : ''}
      >
        <div style={{ maxWidth: '380px', margin: '0 auto', width: '100%' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              marginBottom: '36px',
            }}
          >
            Sign in to your account to continue
          </p>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#DC2626',
                fontSize: '14px',
                marginBottom: '24px',
              }}
              className="animate-scale-in"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
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
                marginBottom: '28px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    accentColor: 'var(--primary-500)',
                  }}
                />
                Remember me
              </label>
              <a
                href="/auth/forgot-password"
                style={{
                  fontSize: '14px',
                  color: 'var(--primary-500)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '32px 0',
            }}
          >
            <div
              style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              ENTERPRISE SSO
            </span>
            <div
              style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}
            />
          </div>

          {/* SSO Button */}
          <button
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
            }}
            onClick={() => alert('SSO integration coming soon!')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
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
            Continue with Google
          </button>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '32px',
            }}
          >
            Don&apos;t have an account?{' '}
            <a
              href="/auth/register"
              style={{
                color: 'var(--primary-500)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Start free trial
            </a>
          </p>
        </div>
      </div>
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
