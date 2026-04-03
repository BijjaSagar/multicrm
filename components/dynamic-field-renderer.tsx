'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Loader2, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Type, 
  Hash, 
  ChevronDown,
  Settings
} from 'lucide-react'

interface FieldDefinition {
  id: string
  fieldName: string
  fieldType: string // "TEXT" | "NUMBER" | "DATE" | "DROPDOWN" | "CHECKBOX" | "PHONE"
  options: string | null // JSON string
  isRequired: boolean
}

interface DynamicFieldRendererProps {
  entityId: string
  entityType: 'LEAD' | 'DEAL' | 'TICKET' | 'CONTACT'
  onSave?: () => void
}

export function DynamicFieldRenderer({ entityId, entityType, onSave }: DynamicFieldRendererProps) {
  const [definitions, setDefinitions] = useState<FieldDefinition[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchFieldData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch Definitions
      const defRes = await fetch(`/api/settings/custom-fields?entityType=${entityType}`)
      const defData = await defRes.json()
      setDefinitions(defData.fields || [])

      // 2. Fetch Current Values
      if (entityId) {
        const valRes = await fetch(`/api/custom-fields/values?entityId=${entityId}&entityType=${entityType}`)
        const valData = await valRes.json()
        const valMap: Record<string, any> = {}
        valData.values?.forEach((v: any) => {
          valMap[v.fieldId] = v.value
        })
        setValues(valMap)
      }
    } catch (err) {
      console.error('Error fetching dynamic fields:', err)
    } finally {
      setLoading(false)
    }
  }, [entityId, entityType])

  useEffect(() => {
    fetchFieldData()
  }, [fetchFieldData])

  const handleInputChange = (fieldId: string, val: any) => {
    setValues(prev => ({ ...prev, [fieldId]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/custom-fields/values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId,
          values,
        }),
      })

      if (res.ok) {
        setMessage('Changes saved successfully!')
        setTimeout(() => setMessage(''), 3000)
        if (onSave) onSave()
      } else {
        setMessage('Error saving custom fields.')
      }
    } catch (err) {
      setMessage('Network error.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={18} />
        <span style={{ fontSize: '13px' }}>Loading custom data...</span>
      </div>
    )
  }

  if (definitions.length === 0) return null

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      border: '1px solid var(--surface-border)',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={16} className="text-blue-500" />
          Industry-Specific Information
        </h3>
        
        {message && (
          <span style={{ 
            fontSize: '12px', fontWeight: 600, color: '#10B981', 
            background: '#F0FDF4', padding: '4px 10px', borderRadius: '6px' 
          }}>
            {message}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
        {definitions.map((def) => {
          const val = values[def.id] || ''
          const options = def.options ? JSON.parse(def.options) : []

          return (
            <div key={def.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {def.fieldName}
                {def.isRequired && <span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>}
              </label>

              {def.fieldType === 'DROPDOWN' ? (
                <select
                  value={val}
                  onChange={(e) => handleInputChange(def.id, e.target.value)}
                  style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)',
                    outline: 'none', fontSize: '13px', background: 'white'
                  }}
                >
                  <option value="">Select option...</option>
                  {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : def.fieldType === 'CHECKBOX' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
                  <input
                    type="checkbox"
                    checked={val === 'true'}
                    onChange={(e) => handleInputChange(def.id, e.target.checked ? 'true' : 'false')}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{def.fieldName} enabled</span>
                </div>
              ) : (
                <input
                  type={def.fieldType === 'NUMBER' ? 'number' : def.fieldType === 'DATE' ? 'date' : 'text'}
                  value={val}
                  onChange={(e) => handleInputChange(def.id, e.target.value)}
                  placeholder={`Enter ${def.fieldName.toLowerCase()}...`}
                  style={{
                    padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)',
                    outline: 'none', fontSize: '13px'
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'var(--brand-primary)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 10px rgba(37,99,235,0.15)'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Custom Fields'}
        </button>
      </div>
    </div>
  )
}
