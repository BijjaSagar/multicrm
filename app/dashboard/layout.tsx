'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { NotificationsPopover } from '@/components/notifications-popover'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  HeadphonesIcon,
  Package,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Building2,
  Mail,
  Calendar,
  FileText,
  Sparkles,
  ChevronDown,
  Database,
  Send,
  Zap,
  Clock,
} from 'lucide-react'
import { getVerticalConfig } from '@/lib/vertical-config'
import { AiChatWidget } from '@/components/ai-chat-widget'
import { ToastProvider } from '@/components/toast'

// Theme Context
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

// Navigation Items with Role-Based Access
const navItems = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Automation', href: '/dashboard/automation', icon: Zap, roles: ['TENANT_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'] },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['TENANT_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER', 'SUPPORT_MANAGER'] },
    ],
  },
  {
    section: 'Sales',
    roles: ['TENANT_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER', 'SALES_REP', 'VIEWER'],
    items: [
      { name: 'Leads', href: '/dashboard/leads', icon: UserPlus },
      { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
      { name: 'Deals', href: '/dashboard/deals', icon: DollarSign },
      { name: 'Pipeline', href: '/dashboard/pipeline', icon: BarChart3 },
      { name: 'Broadcasts', href: '/dashboard/broadcasts', icon: Send, roles: ['TENANT_ADMIN', 'BRANCH_MANAGER', 'SALES_MANAGER'] },
    ],
  },
  {
    section: 'Support',
    roles: ['TENANT_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'VIEWER'],
    items: [
      { name: 'Tickets', href: '/dashboard/tickets', icon: HeadphonesIcon },
    ],
  },
  {
    section: 'Organization',
    roles: ['TENANT_ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'],
    items: [
      { name: 'Products', href: '/dashboard/products', icon: Package },
      { name: 'Branches', href: '/dashboard/branches', icon: Building2, roles: ['TENANT_ADMIN', 'SUPER_ADMIN'] },
      { name: 'Team', href: '/dashboard/team', icon: Users },
      { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
      { name: 'Email Templates', href: '/dashboard/templates', icon: Mail },
      { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    ],
  },
  {
    section: 'System',
    roles: ['TENANT_ADMIN', 'SUPER_ADMIN'],
    items: [
      { name: 'Audit Logs', href: '/dashboard/audit', icon: Database },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    clearTimeout(searchTimer.current)
    if (val.length < 2) { setSearchResults([]); setSearchOpen(false); return }
    setSearchLoading(true)
    setSearchOpen(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch { setSearchResults([]) }
      finally { setSearchLoading(false) }
    }, 280)
  }

  const TYPE_COLORS: Record<string, string> = { lead: '#6366F1', contact: '#10B981', deal: '#F59E0B', ticket: '#EF4444' }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Redirect to setup page if onboarding is not completed (tenant admin only)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'TENANT_ADMIN') {
      const settings = session?.user?.tenantSettings
      const onboardingCompleted = settings?.onboardingCompleted === true
      if (!onboardingCompleted && pathname !== '/dashboard/setup') {
        router.push('/dashboard/setup')
      }
    }
  }, [status, session, pathname, router])

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'light' : 'dark')
  }

  if (status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: '40px',
              height: '40px',
              margin: '0 auto 16px',
              borderWidth: '3px',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading MultiCRM Pro...
          </p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const user = session.user
  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
  const verticalConfig = getVerticalConfig(user.tenantSettings?.verticalKey)
  const entityNamePlural = verticalConfig.entityNamePlural

  const isSetupPage = pathname === '/dashboard/setup'

  if (isSetupPage) {
    return (
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <div style={{ minHeight: '100vh', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '640px', width: '100%' }}>
            {children}
          </div>
        </div>
      </ThemeContext.Provider>
    )
  }

  return (
    <ToastProvider>
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          ...(mobileOpen ? { transform: 'translateX(0)' } : {}),
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} color="white" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                MultiCRM Pro
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.tenantName}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems
            .filter((section: any) => !section.roles || section.roles.includes(user.role))
            .map((section: any) => (
            <div key={section.section}>
              {!collapsed && (
                <div className="sidebar-section-title">{section.section}</div>
              )}
              {section.items
                .filter((item: any) => !item.roles || item.roles.includes(user.role))
                .map((item: any) => {
                const isActive = pathname === item.href
                const displayName = item.href === '/dashboard/leads' ? entityNamePlural : item.name
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? displayName : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={20} />
                    {!collapsed && <span>{displayName}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid var(--surface-border)',
          }}
        >
          <button
            className="sidebar-link"
            onClick={() => setCollapsed(!collapsed)}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}
        style={{ background: 'var(--surface-raised)' }}
      >
        {/* Top Bar */}
        <header
          style={{
            height: '64px',
            background: 'var(--surface-bg)',
            borderBottom: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left - Mobile Menu & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none' }}
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <style>{`@media (max-width: 1024px) { #mobile-menu-toggle { display: flex !important; } }`}</style>

            <div ref={searchRef} style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
              <input
                type="text"
                placeholder={`Search ${entityNamePlural.toLowerCase()}, contacts, deals...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (searchQuery.length >= 2) setSearchOpen(true) }}
                className="input"
                style={{ paddingLeft: '36px', paddingRight: searchLoading ? '36px' : '12px', height: '38px', fontSize: '13px', background: 'var(--surface-raised)', border: '1px solid var(--surface-border)' }}
              />
              {searchLoading && (
                <div className="spinner" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', borderWidth: '2px' }} />
              )}

              {searchOpen && (
                <div className="animate-fade-in-down" style={{ position: 'absolute', top: '44px', left: 0, width: '100%', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 200 }}>
                  {searchResults.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {searchLoading ? 'Searching…' : 'No results found'}
                    </div>
                  ) : (
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {searchResults.map((r) => (
                        <Link key={`${r.type}-${r.id}`} href={r.href} onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 100ms' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-raised)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: `${TYPE_COLORS[r.type]}18`, color: TYPE_COLORS[r.type], textTransform: 'capitalize', flexShrink: 0 }}>{r.type}</span>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</div>
                                {r.sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.sub}</div>}
                              </div>
                            </div>
                            {r.badge && <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{r.badge}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme Toggle */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              style={{ borderRadius: '10px' }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowProfileMenu(false)
                }}
                style={{ borderRadius: '10px', position: 'relative' }}
              >
                <Bell size={18} />
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#EF4444',
                    border: '2px solid var(--surface-bg)',
                  }}
                />
              </button>

              {showNotifications && (
                <NotificationsPopover onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu)
                  setShowNotifications(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'none',
                  border: '1px solid var(--surface-border)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background:
                      'linear-gradient(135deg, #6366F1, #06B6D4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    textAlign: 'left',
                    lineHeight: 1.3,
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {user.role?.replace(/_/g, ' ')}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {showProfileMenu && (
                <div
                  className="animate-fade-in-down"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '220px',
                    background: 'var(--surface-bg)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-xl)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}
                >
                  <div style={{ padding: '4px' }}>
                    <Link
                      href="/dashboard/profile"
                      className="sidebar-link"
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                      }}
                    >
                      <Users size={16} /> My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="sidebar-link"
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                      }}
                    >
                      <Settings size={16} /> Settings
                    </Link>
                    <div
                      style={{
                        height: '1px',
                        background: 'var(--surface-border)',
                        margin: '4px 0',
                      }}
                    />
                    <button
                      className="sidebar-link"
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      style={{
                        padding: '10px 12px',
                        fontSize: '13px',
                        color: '#EF4444',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>

      {/* Floating AI Chat Widget */}
      <AiChatWidget />
    </ThemeContext.Provider>
    </ToastProvider>
  )
}
