'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Building2, UploadCloud, Users,
  ArrowRight, Check, AlertCircle, Loader2,
  Lock, Mail, Phone, ShieldCheck, X, FileText
} from 'lucide-react'

const SETUP_QUESTIONS: Record<string, { question: string; options: string[] }> = {
  REAL_ESTATE: {
    question: 'Residential, Commercial, or Both?',
    options: ['Residential Real Estate', 'Commercial Real Estate', 'Both Residential & Commercial'],
  },
  HEALTHCARE: {
    question: 'Clinic, Hospital, or Diagnostic Center?',
    options: ['Private Clinic', 'Multi-Specialty Hospital', 'Diagnostic Center', 'Healthcare Pharmacy'],
  },
  EDUCATION: {
    question: 'School, College, or Coaching Institute?',
    options: ['K-12 School', 'University / College', 'Coaching / Tuition Center', 'EdTech Platform'],
  },
  DISTANCE_EDUCATION: {
    question: 'Select your center organization type:',
    options: ['Learning Support Center (LSC)', 'Study Center', 'Regional Partner / Consultant'],
  },
  HOSPITALITY: {
    question: 'How many rooms/properties do you manage?',
    options: ['Boutique / Under 20 Rooms', 'Medium / 20-100 Rooms', 'Resort / 100+ Rooms', 'Vacation Rentals'],
  },
  FINANCE_INSURANCE: {
    question: 'Which policy / financial products do you sell?',
    options: ['Life & Health Insurance', 'Motor & General Insurance', 'Loans & Credit Products', 'Wealth & Mutual Funds'],
  },
}

export default function SetupPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [subVertical, setSubVertical] = useState('')
  const [teamForm, setTeamForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'SALES_REP'
  })
  const [teamMemberAdded, setTeamMemberAdded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const verticalKey = session?.user?.tenantSettings?.verticalKey || 'GENERAL'
  const verticalName = session?.user?.tenantSettings?.verticalName || 'General Business'
  const questionConfig = SETUP_QUESTIONS[verticalKey] || {
    question: 'What is your primary sub-industry target?',
    options: [`Standard ${verticalName} Sales`, `Enterprise ${verticalName} Operations`, `Consulting & Services`],
  }

  // Pre-fill sub-vertical default
  useEffect(() => {
    if (questionConfig.options.length > 0 && !subVertical) {
      setSubVertical(questionConfig.options[0])
    }
  }, [questionConfig, subVertical])

  const handleCreateMember = async () => {
    if (!teamForm.firstName || !teamForm.lastName || !teamForm.email || !teamForm.password) {
      setError('Please fill in First Name, Last Name, Email, and Password')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add member')
      setTeamMemberAdded(true)
      setTeamForm({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'SALES_REP' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportCSV = async () => {
    if (!csvFile) return
    setIsImporting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      const res = await fetch('/api/leads/import', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setImportResult({ imported: data.imported, skipped: data.skipped })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV import failed')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFinishSetup = async () => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'onboarding',
          subVertical,
        })
      })
      if (!res.ok) throw new Error('Failed to save onboarding settings')
      
      // Update session storage details
      await update()
      
      // Force reload to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup completion failed')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card animate-fade-in-up" style={{ padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', borderRadius: '16px', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
      {/* Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} color="white" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800 }}>Workspace Setup Wizard</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Step {step} of 4</span>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Step 1: Sub-Vertical Selection */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Configure Business Profile</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You registered as a <strong>{verticalName}</strong> tenant. Let's configure your exact sub-category below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>{questionConfig.question}</label>
            {questionConfig.options.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '10px', border: subVertical === opt ? '2px solid #6366F1' : '1px solid var(--surface-border)', background: subVertical === opt ? 'rgba(99,102,241,0.03)' : 'var(--surface-bg)', cursor: 'pointer', transition: 'all 150ms' }}>
                <input type="radio" checked={subVertical === opt} onChange={() => setSubVertical(opt)} style={{ accentColor: '#6366F1' }} />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{opt}</span>
              </label>
            ))}
          </div>

          <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '10px', gap: '8px', fontSize: '14px', fontWeight: 800 }}>
            Continue to Data Import <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Import Data */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Import Existing Customer Data</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Upload a CSV to bulk-import leads. Required column: <strong>firstName</strong>. Optional: lastName, email, phone, company, source, status, priority, notes.
          </p>

          {importResult ? (
            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10B981', fontWeight: 700, fontSize: '15px' }}>
                <Check size={18} /> Import Complete
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: '#10B981' }}>{importResult.imported} records</strong> imported successfully.
                {importResult.skipped > 0 && <> <strong style={{ color: '#F59E0B' }}>{importResult.skipped} rows</strong> were skipped (duplicates or missing required fields).</>}
              </p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: '10px', fontSize: '12px' }} onClick={() => { setCsvFile(null); setImportResult(null) }}>
                Import another file
              </button>
            </div>
          ) : (
            <>
              <label
                htmlFor="csv-upload"
                style={{ display: 'block', border: `2px dashed ${csvFile ? '#6366F1' : 'var(--surface-border)'}`, borderRadius: '12px', padding: '32px 20px', textAlign: 'center', background: csvFile ? 'rgba(99,102,241,0.03)' : 'var(--surface-raised)', marginBottom: '16px', cursor: 'pointer', transition: 'all 150ms' }}
              >
                {csvFile ? (
                  <>
                    <FileText size={32} color="#6366F1" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#6366F1', marginBottom: '4px' }}>{csvFile.name}</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(csvFile.size / 1024).toFixed(1)} KB — click to change</p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Click to select your CSV file</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supports .csv files up to 10MB · max 5,000 rows</p>
                  </>
                )}
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    setCsvFile(f)
                    setImportResult(null)
                    setError('')
                  }}
                />
              </label>

              {csvFile && (
                <button
                  onClick={handleImportCSV}
                  disabled={isImporting}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginBottom: '16px', gap: '6px' }}
                >
                  {isImporting ? <><Loader2 size={14} className="spinner" /> Importing...</> : <><UploadCloud size={14} /> Import {csvFile.name}</>}
                </button>
              )}
            </>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ flex: 1 }}>
              {importResult ? 'Continue' : 'Skip for Now'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Invite Team Members */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px' }}>Setup Team Members</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Create accounts for your staff, sales reps, or support agents.
          </p>

          {teamMemberAdded && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px' }}>
              <Check size={16} /> Team member successfully created! You can add another one or click continue.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>FIRST NAME *</label>
                <input type="text" className="input" placeholder="Satya" value={teamForm.firstName} onChange={e => setTeamForm({ ...teamForm, firstName: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>LAST NAME *</label>
                <input type="text" className="input" placeholder="Nadella" value={teamForm.lastName} onChange={e => setTeamForm({ ...teamForm, lastName: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>EMAIL ADDRESS *</label>
                <input type="email" className="input" placeholder="satya@company.com" value={teamForm.email} onChange={e => setTeamForm({ ...teamForm, email: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>PASSWORD *</label>
                <input type="password" className="input" placeholder="••••••••" value={teamForm.password} onChange={e => setTeamForm({ ...teamForm, password: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>PHONE</label>
                <input type="text" className="input" placeholder="+91 98765 43210" value={teamForm.phone} onChange={e => setTeamForm({ ...teamForm, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>ROLE</label>
                <select className="input" value={teamForm.role} onChange={e => setTeamForm({ ...teamForm, role: e.target.value })}>
                  <option value="SALES_REP">Sales Rep</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="SUPPORT_MANAGER">Support Manager</option>
                  <option value="BRANCH_MANAGER">Branch Manager</option>
                </select>
              </div>
            </div>
            <button onClick={handleCreateMember} className="btn btn-secondary btn-sm" disabled={isSubmitting} style={{ alignSelf: 'flex-start', gap: '6px' }}>
              {isSubmitting ? <Loader2 size={12} className="spinner" /> : <Users size={14} />} Add Team Member
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
            <button onClick={() => setStep(4)} className="btn btn-primary" style={{ flex: 1 }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 4: Completion */}
      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShieldCheck size={32} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '8px' }}>Workspace Ready!</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Your vertical dashboard has been fully customized with default pipelines, dynamic CRM custom fields, and access credentials. Let's explore your workspace.
          </p>

          <button onClick={handleFinishSetup} className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '16px', borderRadius: '10px', fontSize: '14px', fontWeight: 800, gap: '8px' }}>
            {isSubmitting ? <><Loader2 size={16} className="spinner" /> Launching...</> : <>Enter Dashboard <ArrowRight size={16} /></>}
          </button>
        </div>
      )}
    </div>
  )
}
