'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, MessageSquare, Zap, Globe, Shield, Users, 
  ArrowRight, CheckCircle2, PlayCircle, Star, Menu, X,
  Github, Twitter, Linkedin, Facebook
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
      backgroundColor: '#0F172A', 
      color: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Navbar */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        zIndex: 1000,
        backgroundColor: scrollY > 50 ? 'rgba(15, 23, 42, 0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
        transition: 'all 0.4s ease',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        padding: scrollY > 50 ? '12px 0' : '24px 0'
      }}>
        <div className="container" style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #6366F1, #A855F7)', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
            }}>
              <Globe size={22} color="white" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              Multi<span style={{ color: '#6366F1' }}>CRM</span>
            </span>
          </div>

          <div style={{ display: 'none', gap: '32px' }} className="desktop-menu">
            {['Services', 'Features', 'Analytics', 'Enterprise', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ 
                fontSize: '15px', 
                fontWeight: 600, 
                color: 'rgba(248, 250, 252, 0.7)',
                textDecoration: 'none',
                transition: 'color 0.3s'
              }} onMouseOver={e => e.currentTarget.style.color = 'white'} 
                 onMouseOut={e => e.currentTarget.style.color = 'rgba(248, 250, 252, 0.7)'}>
                {link}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/auth/login" style={{ 
              fontSize: '15px', 
              fontWeight: 700, 
              color: '#F8FAFC',
              textDecoration: 'none'
            }}>Sign In</Link>
            <Link href="/auth/register" style={{ 
              backgroundColor: '#6366F1',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
              transition: 'transform 0.3s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        paddingTop: '180px', 
        paddingBottom: '120px', 
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Background Glare */}
        <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0) 70%)',
          zIndex: -1
        }} />

        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '8px 16px',
            borderRadius: '100px',
            marginBottom: '24px'
          }}>
            <Zap size={14} color="#6366F1" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#818CF8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Phase 5 Now Live
            </span>
          </div>

          <h1 style={{ 
            fontSize: 'max(48px, 5vw)', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            letterSpacing: '-2px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Multi-Tenant Omnichannel <br />
            <span style={{ color: '#6366F1' }}>Growth Platform</span>
          </h1>

          <p style={{ 
            fontSize: '19px', 
            lineHeight: 1.6, 
            color: '#94A3B8', 
            maxWidth: '700px', 
            margin: '0 auto 40px',
            fontWeight: 500
          }}>
            Scale your business with automated WhatsApp workflows, real-time analytics, and enterprise multi-branch management. The only CRM built for high-velocity teams.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
             <Link href="/auth/register" style={{ 
                padding: '18px 36px', 
                backgroundColor: '#6366F1', 
                borderRadius: '14px', 
                fontSize: '17px', 
                fontWeight: 800, 
                color: 'white', 
                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
             }}>
                Create Workspace <ArrowRight size={20} />
             </Link>
             <button style={{ 
                padding: '18px 36px', 
                backgroundColor: 'transparent', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', 
                fontSize: '17px', 
                fontWeight: 700, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
             }}>
                <PlayCircle size={20} /> Watch Demo
             </button>
          </div>
        </div>
      </section>

      {/* Phase Modules Grid */}
      <section id="services" style={{ padding: '80px 0', backgroundColor: '#0F172A' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>One Platform. Every Channel.</h2>
            <p style={{ color: '#94A3B8', fontSize: '17px' }}>Seamlessly integrated modules for every stage of your growth.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {[
              { 
                icon: Globe, color: '#6366F1', title: 'Multi-Tenant SaaS', 
                desc: 'Independent workspaces with branch-level isolation, secure RBAC, and branded subdomains.' 
              },
              { 
                icon: Users, color: '#10B981', title: 'Unified Lead Hub', 
                desc: 'Centralize leads from WebHub, LinkedIn, and Ads. Auto-score leads and assign via Round Robin.' 
              },
              { 
                icon: MessageSquare, color: '#F59E0B', title: 'Omnichannel Support', 
                desc: 'Ticketing system integrated with WhatsApp, Email, and Customer Portal for 360-degree service.' 
              },
              { 
                icon: Zap, color: '#A855F7', title: 'Workflow Engine', 
                desc: 'Trigger automated WhatsApp templates and emails based on deal stage movements and ticket status.' 
              },
              { 
                icon: BarChart3, color: '#EC4899', title: 'AI Intelligence', 
                desc: 'Predictive revenue forecasting and team performance metrics baked into your analytics dashboard.' 
              },
              { 
                icon: Shield, color: '#06B6D4', title: 'Enterprise Audit', 
                desc: 'Complete transparency with timestamped audit logs for every action taken across your organization.' 
              }
            ].map((module, i) => (
              <div key={i} className="card" style={{ 
                padding: '40px', 
                backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                transition: 'all 0.3s ease',
              }} onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
              }} onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
              }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  backgroundColor: `${module.color}15`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <module.icon size={28} color={module.color} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>{module.title}</h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: '15px' }}>{module.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Journey Walkthrough */}
      <section style={{ padding: '100px 0', position: 'relative' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
                  <div>
                      <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
                        Built with Precision. <br />
                        <span style={{ color: '#6366F1' }}>Five Phases of Innovation.</span>
                      </h2>
                      {[
                        { ph: 'Phase 1', title: 'SaaS Foundation', desc: 'Secure multi-tenant workspace with branch-level isolation.' },
                        { ph: 'Phase 2', title: 'Sales & Service', desc: 'Complete lead handling, deal pipelines, and support portal.' },
                        { ph: 'Phase 3', title: 'Automation Hub', desc: 'WhatsApp & Email integration for business workflows.' },
                        { ph: 'Phase 4', title: 'Intelligent Data', desc: 'AI-forecasting and real-time performance analytics.' }
                      ].map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                           <div style={{ fontSize: '14px', fontWeight: 800, color: '#6366F1', width: '80px' }}>{p.ph}</div>
                           <div>
                              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{p.title}</h4>
                              <p style={{ color: '#94A3B8', fontSize: '15px' }}>{p.desc}</p>
                           </div>
                        </div>
                      ))}
                  </div>
                  <div style={{ position: 'relative' }}>
                      <div style={{ 
                        backgroundColor: '#1E293B', 
                        borderRadius: '32px', 
                        padding: '40px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
                      }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
                               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
                            </div>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {[1, 2, 3, 4].map(idx => (
                               <div key={idx} style={{ height: '120px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }} />
                            ))}
                         </div>
                         <div style={{ marginTop: '24px', height: '60px', borderRadius: '12px', background: 'linear-gradient(90deg, #6366F1, #A855F7)' }} />
                      </div>
                      
                      {/* Floating Indicator */}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '-30px', 
                        left: '-30px', 
                        backgroundColor: '#6366F1', 
                        padding: '24px', 
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                         <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Platform Status</div>
                         <div style={{ fontSize: '24px', fontWeight: 900, color: 'white' }}>100% Build</div>
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
            backgroundColor: '#6366F1', 
            borderRadius: '40px', 
            padding: '80px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            boxShadow: '0 40px 80px rgba(99, 102, 241, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '24px' }}>Ready to Scale Your Team?</h2>
                <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto 48px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Create your workspace today and discover the power of automated omnichannel growth.</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link href="/auth/register" style={{ padding: '20px 40px', backgroundColor: 'white', color: '#6366F1', borderRadius: '16px', fontWeight: 900, fontSize: '18px' }}>
                      Register Now
                    </Link>
                    <Link href="/contact" style={{ padding: '20px 40px', backgroundColor: 'rgba(0,0,0,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', fontWeight: 800, fontSize: '18px' }}>
                      Contact Sales
                    </Link>
                </div>
             </div>
             
             {/* Decorative Circles */}
             <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
             <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '100px 0 60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '80px' }}>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                      <Globe size={28} color="#6366F1" />
                      <span style={{ fontSize: '24px', fontWeight: 900 }}>Multi<span style={{ color: '#6366F1' }}>CRM</span></span>
                   </div>
                   <p style={{ color: '#94A3B8', lineHeight: 1.6, maxWidth: '300px' }}>
                      The complete growth engine for modern enterprise teams. 
                      Automated, intelligent, and scalable.
                   </p>
                   <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                      {[Github, Twitter, Linkedin, Facebook].map((Icon, i) => (
                        <div key={i} style={{ color: '#94A3B8', cursor: 'pointer' }}><Icon size={20} /></div>
                      ))}
                   </div>
                </div>
                {['Platform', 'Resources', 'Company'].map((title, i) => (
                   <div key={i}>
                      <h4 style={{ fontWeight: 800, marginBottom: '24px', color: 'white' }}>{title}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {['Overview', 'Features', 'Solutions', 'Pricing'].map(item => (
                           <li key={item} style={{ color: '#94A3B8', fontSize: '15px', cursor: 'pointer' }}>{item}</li>
                         ))}
                      </ul>
                   </div>
                ))}
             </div>
             <div style={{ 
               paddingTop: '40px', 
               borderTop: '1px solid rgba(255,255,255,0.05)', 
               display: 'flex', 
               justifyContent: 'space-between',
               color: '#94A3B8',
               fontSize: '14px'
             }}>
                <span>© 2026 MultiCRM Platform. Phase 5 Final Edition.</span>
                <div style={{ display: 'flex', gap: '24px' }}>
                   <span>Privacy Policy</span>
                   <span>Terms of Service</span>
                </div>
             </div>
          </div>
      </footer>

      <style jsx>{`
        .container { transition: all 0.3s ease; }
        .desktop-menu { display: flex !important; }
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
        }
      `}</style>
    </div>
  )
}
