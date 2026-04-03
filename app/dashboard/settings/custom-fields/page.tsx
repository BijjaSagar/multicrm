'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Plus,
  Trash2,
  MoreVertical,
  Type,
  Hash,
  Calendar,
  ChevronDown,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  GripVertical
} from 'lucide-react'

const ENTITY_TYPES = [
  { id: 'LEAD', label: 'Leads' },
  { id: 'DEAL', label: 'Deals' },
  { id: 'TICKET', label: 'Tickets' },
  { id: 'CONTACT', label: 'Contacts' },
]

const FIELD_TYPES = [
  { id: 'TEXT', label: 'Short Text', icon: Type },
  { id: 'NUMBER', label: 'Number', icon: Hash },
  { id: 'DATE', label: 'Date', icon: Calendar },
  { id: 'DROPDOWN', label: 'Dropdown', icon: ChevronDown },
  { id: 'CHECKBOX', label: 'Checkbox', icon: CheckCircle2 },
  { id: 'PHONE', label: 'Phone', icon: Type },
]

export default function CustomFieldsSettings() {
  const [activeTab, setActiveTab] = useState('LEAD')
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // New Field State
  const [newField, setNewField] = useState({
    fieldName: '',
    fieldType: 'TEXT',
    isRequired: false,
    options: [] as string[],
  })
  const [optionInput, setOptionInput] = useState('')

  useEffect(() => {
    fetchFields()
  }, [activeTab])

  const fetchFields = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/settings/custom-fields?entityType=${activeTab}`)
      const data = await res.json()
      setFields(data.fields || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setNewField({ ...newField, options: [...newField.options, optionInput.trim()] })
      setOptionInput('')
    }
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = [...newField.options]
    newOptions.splice(index, 1)
    setNewField({ ...newField, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newField,
          entityType: activeTab,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setNewField({ fieldName: '', fieldType: 'TEXT', isRequired: false, options: [] })
        fetchFields()
      } else {
        alert('Failed to save field')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this field? Data stored in this field will be lost.')) return
    
    try {
      const res = await fetch(`/api/settings/custom-fields/${id}`, { method: 'DELETE' })
      if (res.ok) fetchFields()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings size={28} className="text-blue-600" />
            Custom Fields Builder
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Define custom data points to tailor MultiCRM to your specific business needs.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--brand-primary)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Plus size={18} />
          Add Custom Field
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '4px', 
        background: 'var(--surface-subtle)', 
        borderRadius: '12px',
        marginBottom: '24px',
        width: 'fit-content'
      }}>
        {ENTITY_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeTab === type.id ? 'white' : 'transparent',
              color: activeTab === type.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === type.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Fields List */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading field definitions...</span>
          </div>
        ) : fields.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-subtle)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
            }}>
              <AlertCircle size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No custom fields yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '24px' }}>
              Create fields to capture industry-specific data for your {ENTITY_TYPES.find(t => t.id === activeTab)?.label.toLowerCase()}.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ color: 'var(--brand-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Add your first field
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {fields.map((field, idx) => (
              <div 
                key={field.id}
                style={{ 
                  padding: '16px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  borderBottom: idx === fields.length - 1 ? 'none' : '1px solid var(--surface-border)',
                  transition: 'background 0.2s'
                }}
                className="hover-bg-subtle"
              >
                <div style={{ color: 'var(--text-muted)', marginRight: '16px' }}>
                  <GripVertical size={18} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{field.fieldName}</span>
                    {field.isRequired && (
                      <span style={{ fontSize: '10px', background: '#FEF2F2', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {(() => {
                      const FT = FIELD_TYPES.find(t => t.id === field.fieldType)
                      const Icon = FT?.icon || Type
                      return <><Icon size={12} /> {FT?.label || field.fieldType}</>
                    })()}
                  </div>
                </div>

                {field.options && (
                  <div style={{ flex: 2, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {JSON.parse(field.options).map((opt: string, i: number) => (
                      <span key={i} style={{ fontSize: '11px', background: 'var(--surface-subtle)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => handleDelete(field.id)}
                  style={{ color: 'var(--text-muted)', padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  className="hover-text-red"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ 
            background: 'white', border: '1px solid var(--surface-border)', borderRadius: '20px', 
            width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', overflow: 'hidden' 
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add Custom Field</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Field Label</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Blood Group, Property Type"
                  value={newField.fieldName}
                  onChange={e => setNewField({ ...newField, fieldName: e.target.value })}
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--surface-border)',
                    outline: 'none', fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Field Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {FIELD_TYPES.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewField({ ...newField, fieldType: type.id })}
                      style={{
                        padding: '10px', borderRadius: '8px', border: '1px solid',
                        borderColor: newField.fieldType === type.id ? 'var(--brand-primary)' : 'var(--surface-border)',
                        background: newField.fieldType === type.id ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                        color: newField.fieldType === type.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '13px', transition: 'all 0.2s'
                      }}
                    >
                      <type.icon size={16} />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {newField.fieldType === 'DROPDOWN' && (
                <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: 'var(--surface-subtle)' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Options</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Add option..."
                      value={optionInput}
                      onChange={e => setOptionInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                      style={{ 
                        flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--surface-border)',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      style={{ background: 'var(--brand-primary)', color: 'white', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {newField.options.map((opt, i) => (
                      <span key={i} style={{ 
                        fontSize: '12px', background: 'white', padding: '4px 10px', borderRadius: '6px', 
                        border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '6px' 
                      }}>
                        {opt}
                        <X size={12} className="cursor-pointer text-muted" onClick={() => handleRemoveOption(i)} />
                      </span>
                    ))}
                  </div>
                  {newField.options.length === 0 && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Add at least one option for the dropdown.</p>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="required"
                  checked={newField.isRequired}
                  onChange={e => setNewField({ ...newField, isRequired: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="required" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Mark as Required</label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  disabled={saving || !newField.fieldName || (newField.fieldType === 'DROPDOWN' && newField.options.length === 0)}
                  type="submit"
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', 
                    background: (saving || !newField.fieldName) ? 'var(--surface-border)' : 'var(--brand-primary)', 
                    color: 'white', fontWeight: 600, cursor: (saving || !newField.fieldName) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hover-bg-subtle:hover { background: var(--surface-subtle); }
        .hover-text-red:hover { color: #EF4444 !important; background: #FEF2F2 !important; }
      `}</style>
    </div>
  )
}
