'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, MessageSquare, Zap, Globe, Shield, Users, 
  ArrowRight, CheckCircle2, PlayCircle, Star, Menu, X,
  Github as GithubIcon, MessageCircle, ExternalLink, Mail,
  Building2, Activity, Hotel, HeartPulse, GraduationCap, ShoppingBag, Layout
} from 'lucide-react'

// --- Custom Animations Helpers ---
const useScrollPos = () => {
  const [scroll, setScroll] = useState(0)
  useEffect(() => {
    const handle = () => setScroll(window.scrollY)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [])
  return scroll
}

export default function LandingPage() {
  const scrollY = useScrollPos()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="landing-root" style={{ 
      backgroundColor: '#FFFFFF', 
      color: '#1E293B',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Professional Navbar */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        zIndex: 1000,
        backgroundColor: scrollY > 20 ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: scrollY > 20 ? '1px solid #E2E8F0' : 'none',
        padding: scrollY > 20 ? '14px 0' : '28px 0'
      }}>
        <div className="container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              background: '#2563EB', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
            }}>
              <Building2 size={24} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.8px', color: '#0F172A' }}>
              Multi<span style={{ color: '#2563EB' }}>CRM</span>
            </span>
          </div>

          <div style={{ display: 'none', gap: '32px' }} className="desktop-menu">
            {['Industries', 'Services', 'Analytics', 'Enterprise'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ 
                fontSize: '15px', 
                fontWeight: 600, 
                color: '#64748B',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }} onMouseOver={e => e.currentTarget.style.color = '#2563EB'} 
                 onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
                {link}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/auth/login" style={{ 
              fontSize: '15px', 
              fontWeight: 700, 
              color: '#475569',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }} onMouseOver={e => e.currentTarget.style.color = '#0F172A'}
               onMouseOut={e => e.currentTarget.style.color = '#475569'}>
              Sign In
            </Link>
            <Link href="/auth/register" style={{ 
              backgroundColor: '#2563EB', 
              padding: '12px 28px', 
              borderRadius: '12px', 
              fontSize: '15px', 
              fontWeight: 800, 
              color: 'white', 
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.12)'
            }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1D4ED8'}
               onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563EB'}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section style={{ 
        paddingTop: '200px', 
        paddingBottom: '120px', 
        textAlign: 'center', 
        position: 'relative',
        background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(37, 99, 235, 0.03), transparent 30%)'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: '#EFF6FF', 
            padding: '8px 16px', 
            borderRadius: '100px',
            marginBottom: '40px',
            border: '1px solid #BFDBFE'
          }}>
            <Layout size={14} color="#2563EB" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              The Universal Horizontal Layer for Every Industry
            </span>
          </div>

          <h1 style={{ 
            fontSize: 'max(52px, 5vw)', 
            fontWeight: 900, 
            lineHeight: 1.05, 
            letterSpacing: '-2.5px',
            marginBottom: '32px',
            color: '#0F172A'
          }}>
            Scale Your Business with <br />
            <span style={{ color: '#2563EB' }}>Vertical-Intelligent Data.</span>
          </h1>

          <p style={{ 
            fontSize: '20px', 
            lineHeight: 1.6, 
            color: '#475569', 
            maxWidth: '800px', 
            margin: '0 auto 48px',
            fontWeight: 500
          }}>
            The definitive multi-tenant CRM that autonomously adapts to your vertical. Whether you're in Real Estate, Healthcare, or Education, MultiCRM morphs to your industry metadata instantly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
             <Link href="/auth/register" style={{ 
                padding: '20px 42px', 
                backgroundColor: '#2563EB', 
                borderRadius: '14px', 
                fontSize: '17px', 
                fontWeight: 800, 
                color: 'white', 
                boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
             }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#2563EB'}>
                Create Industry Workspace <ArrowRight size={20} strokeWidth={2.5} />
             </Link>
             <button style={{ 
                padding: '20px 42px', 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '14px', 
                fontSize: '17px', 
                fontWeight: 700, 
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s'
             }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}>
                <PlayCircle size={20} color="#64748B" /> Watch Platform Demo
             </button>
          </div>
        </div>
      </section>

      {/* NEW: Industry Verticals Section */}
      <section id="industries" style={{ padding: '80px 0', borderTop: '1px solid #F1F5F9' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
             <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>One Platform, Multiple Verticals</h2>
             <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 500 }}>Select your industry and let MultiCRM autonomously provision your specialized schema.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              { icon: Hotel, title: 'Real Estate', color: '#3B82F6', desc: 'Property management, lead scoring, and location-smart metadata.' },
              { icon: HeartPulse, title: 'Healthcare', color: '#10B981', desc: 'Patient profiling, medical history tracking, and specialized consults.' },
              { icon: GraduationCap, title: 'Education', color: '#F59E0B', desc: 'Course enrollment, student data management, and academic terms.' },
              { icon: ShoppingBag, title: 'eCommerce', color: '#8B5CF6', desc: 'Shopping behavior, customer lifetime value, and order intelligence.' },
            ].map((v, idx) => (
              <div key={idx} className="card" style={{ 
                padding: '32px', 
                textAlign: 'center', 
                borderRadius: '24px', 
                border: '1px solid #E2E8F0', 
                background: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', 
                  backgroundColor: `${v.color}10`, color: v.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                   <v.icon size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>{v.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Modules Section */}
      <section id="services" style={{ padding: '120px 0', backgroundColor: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '20px', color: '#0F172A', letterSpacing: '-1px' }}>
              The Universal CRM Layer
            </h2>
            <p style={{ color: '#64748B', fontSize: '18px', maxWidth: '700px', margin: '0 auto', fontWeight: 500 }}>
              Purpose-built horizontal modules that adapt their schema autonomously to your business vertical.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
            {[
              { 
                icon: Layout, color: '#2563EB', title: 'Universal Data Schema', 
                desc: 'Schema-less field architecture that evolves with your industry. Add custom metadata for any business model instantly.' 
              },
              { 
                icon: Shield, color: '#059669', title: 'Multi-Tenant Isolation', 
                desc: 'Enterprise-grade workspace security. Your industry data is strictly siloed and encrypted at the tenant level.' 
              },
              { 
                icon: Zap, color: '#D97706', title: 'Autonomous Provisioning', 
                desc: 'Instant setup of industry-optimized workspaces. No complex configuration or development cycles required.' 
              },
              { 
                icon: BarChart3, color: '#7C3AED', title: 'Cross-Vertical Analytics', 
                desc: 'Pivot your performance data across industry-specific units (Sq Ft, Patient ID, ROAS, or Student ID).' 
              },
              { 
                icon: MessageSquare, color: '#0891B2', title: 'Omnichannel Context', 
                desc: 'Maintain customer conversations enriched with industry metadata for unparalleled service delivery.' 
              },
              { 
                icon: Globe, color: '#4F46E5', title: 'Horizontal Scalability', 
                desc: 'Expand from one branch to one hundred with a single, horizontal core that scales with your ambition.' 
              }
            ].map((module, i) => (
              <div key={i} className="card" style={{ 
                padding: '48px', 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '32px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
              }} onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-10px)'
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.06)'
                e.currentTarget.style.borderColor = '#BFDBFE'
              }} onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'
                e.currentTarget.style.borderColor = '#E2E8F0'
              }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  backgroundColor: `${module.color}08`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '32px',
                  border: `1px solid ${module.color}15`
                }}>
                  <module.icon size={32} color={module.color} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', color: '#0F172A' }}>{module.title}</h3>
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '15px', fontWeight: 500 }}>{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Excellence Section */}
      <section style={{ padding: '140px 0', backgroundColor: '#FFFFFF' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '100px', alignItems: 'center' }}>
                  <div>
                      <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '32px', lineHeight: 1.1, letterSpacing: '-1.5px', color: '#0F172A' }}>
                        Designed for <br />
                        <span style={{ color: '#2563EB' }}>Corporate Efficiency.</span>
                      </h2>
                      <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '48px', lineHeight: 1.6, fontWeight: 500 }}>
                        We've built MultiCRM with a focus on deep structural integrity and ease of use, ensuring your team spends more time growing and less time managing.
                      </p>
                      
                      {[
                        { title: 'Data Sovereignty', desc: 'Independent data silos for every workspace ensures total security.' },
                        { title: 'Workflow Precision', desc: 'Define granular rules for lead routing and automated responses.' },
                        { title: 'Enterprise Audit', desc: 'Every action is logged with detailed metadata for compliance.' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '36px' }}>
                           <div style={{ 
                             width: '32px', 
                             height: '32px', 
                             borderRadius: '50%', 
                             background: '#EFF6FF', 
                             display: 'flex', 
                             alignItems: 'center', 
                             justifyContent: 'center', 
                             flexShrink: 0 
                           }}>
                             <CheckCircle2 size={18} color="#2563EB" strokeWidth={2.5} />
                           </div>
                           <div>
                              <h4 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '6px', color: '#0F172A' }}>{item.title}</h4>
                              <p style={{ color: '#64748B', fontSize: '15px', fontWeight: 500 }}>{item.desc}</p>
                           </div>
                        </div>
                      ))}
                  </div>

                  <div style={{ position: 'relative' }}>
                      <div style={{ 
                        backgroundColor: '#FFFFFF', 
                        borderRadius: '40px', 
                        padding: '48px', 
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.08)',
                        zIndex: 1,
                        position: 'relative'
                      }}>
                         <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#CBD5E1' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E2E8F0' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F1F5F9' }} />
                         </div>
                         
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ height: '40px', width: '60%', borderRadius: '10px', backgroundColor: '#F1F5F9' }} />
                            <div style={{ height: '100px', borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                               <div style={{ height: '80px', borderRadius: '12px', backgroundColor: '#F1F5F9' }} />
                               <div style={{ height: '80px', borderRadius: '12px', backgroundColor: '#F1F5F9' }} />
                            </div>
                         </div>
                         
                         <div style={{ marginTop: '40px', height: '56px', borderRadius: '14px', background: '#2563EB', opacity: 0.9 }} />
                      </div>
                      
                      {/* Professional Stat Badge */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '-30px', 
                        right: '-30px', 
                        backgroundColor: '#FFFFFF', 
                        padding: '28px 36px', 
                        borderRadius: '24px',
                        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
                        border: '1px solid #E2E8F0',
                        zIndex: 2
                      }}>
                         <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>Security Index</div>
                         <div style={{ fontSize: '32px', fontWeight: 900, color: '#2563EB' }}>100% Secure</div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px' }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            backgroundColor: '#0F172A', 
            borderRadius: '48px', 
            padding: '100px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            boxShadow: '0 50px 100px rgba(15, 23, 42, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '24px', color: 'white', letterSpacing: '-1.5px' }}>Power Your Growth Today.</h2>
                <p style={{ fontSize: '22px', maxWidth: '650px', margin: '0 auto 56px', color: '#94A3B8', fontWeight: 500, lineHeight: 1.5 }}>Join hundreds of forward-thinking teams using MultiCRM to streamline their business ecosystems.</p>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <Link href="/auth/register" style={{ 
                      padding: '22px 48px', 
                      backgroundColor: '#2563EB', 
                      color: 'white', 
                      borderRadius: '16px', 
                      fontWeight: 800, 
                      fontSize: '18px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
                    }}>
                      Get Started Now
                    </Link>
                    <Link href="/contact" style={{ 
                      padding: '22px 48px', 
                      backgroundColor: 'transparent', 
                      color: 'white', 
                      border: '1.5px solid rgba(255,255,255,0.15)', 
                      borderRadius: '16px', 
                      fontWeight: 700, 
                      fontSize: '18px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                       onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      Contact Sales
                    </Link>
                </div>
             </div>
          </div>
      </section>

      {/* Corporate Footer */}
      <footer style={{ padding: '120px 0 60px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr', gap: '60px', marginBottom: '100px' }}>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                      <Building2 size={32} color="#2563EB" />
                      <span style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.8px' }}>
                        Multi<span style={{ color: '#2563EB' }}>CRM</span>
                      </span>
                   </div>
                   <p style={{ color: '#64748B', lineHeight: 1.7, maxWidth: '340px', fontSize: '15px', fontWeight: 500 }}>
                      The universal horizontal infrastructure for vertical-intelligent business growth. Secure, scalable, and built for the modern enterprise.
                   </p>
                   <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                      <div style={{ color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#2563EB'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}><GithubIcon size={22} /></div>
                      <div style={{ color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#2563EB'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}><MessageCircle size={22} /></div>
                      <div style={{ color: '#94A3B8', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#2563EB'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}><Mail size={22} /></div>
                   </div>
                </div>
                {['Solutions', 'Resources', 'Company'].map((title, i) => (
                   <div key={i}>
                      <h4 style={{ fontWeight: 800, marginBottom: '28px', color: '#0F172A', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                         {(i === 0 ? ['Real Estate', 'Healthcare', 'Education', 'eCommerce', 'Enterprise'] : i === 1 ? ['Documentation', 'API Reference', 'User Guides', 'Security'] : ['About Us', 'Careers', 'Brand Kit', 'Contact']).map(item => (
                            <li key={item} style={{ color: '#64748B', fontSize: '15px', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#2563EB'} onMouseOut={e => e.currentTarget.style.color = '#64748B'}>{item}</li>
                         ))}
                      </ul>
                   </div>
                ))}
             </div>
             <div style={{ 
               paddingTop: '40px', 
               borderTop: '1px solid #F1F5F9', 
               display: 'flex', 
               justifyContent: 'space-between',
               alignItems: 'center',
               color: '#94A3B8',
               fontSize: '14px',
               fontWeight: 500
             }}>
                <span>© 2026 MultiCRM Pro Enterprise. All Rights Reserved.</span>
                <div style={{ display: 'flex', gap: '32px' }}>
                   <span style={{ cursor: 'pointer' }}>Security</span>
                   <span style={{ cursor: 'pointer' }}>Privacy</span>
                   <span style={{ cursor: 'pointer' }}>Legal</span>
                </div>
             </div>
          </div>
      </footer>

      <style jsx>{`
        .container { transition: all 0.3s ease; }
        .desktop-menu { display: flex !important; }
        @media (max-width: 900px) {
          .desktop-menu { display: none !important; }
        }
      `}</style>
    </div>
  )
}
