'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package, Plus, Search, Edit, Trash2, X,
  Loader2, RefreshCw, AlertCircle, CheckCircle2, XCircle,
  IndianRupee,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: number
  currency: string
  category: string | null
  unit: string | null
  taxRate: number
  isActive: boolean
  createdAt: string
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?search=${search}`)
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data.products)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          sku: form.get('sku'),
          description: form.get('description'),
          price: Number(form.get('price')),
          category: form.get('category'),
          unit: form.get('unit'),
          taxRate: Number(form.get('taxRate') || 18),
        }),
      })
      if (!res.ok) throw new Error('Failed to create product')
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally {
      setCreating(false)
    }
  }

  const active = products.filter(p => p.isActive)
  const totalValue = products.reduce((s, p) => s + Number(p.price), 0)

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={24} style={{ color: '#8B5CF6' }} /> Products
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage your product catalog</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchProducts}><RefreshCw size={14} /></button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Products', value: products.length, color: '#8B5CF6' },
          { label: 'Active', value: active.length, color: '#10B981' },
          { label: 'Avg Price', value: formatCurrency(products.length > 0 ? totalValue / products.length : 0), color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: '18px', animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }} />
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444' }}><AlertCircle size={16} /> {error}</div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spinner" /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px', fontWeight: 500 }}>No products yet</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Tax</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'backwards' }}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.sku || '—'}</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: 'rgba(139,92,246,.1)', color: '#8B5CF6' }}>{p.category || 'General'}</span></td>
                    <td style={{ fontWeight: 700, color: '#10B981' }}>{formatCurrency(Number(p.price))}</td>
                    <td style={{ fontSize: '13px' }}>{Number(p.taxRate)}%</td>
                    <td>
                      {p.isActive
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10B981' }}><CheckCircle2 size={14} /> Active</span>
                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6B7280' }}><XCircle size={14} /> Inactive</span>
                      }
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div className="card animate-scale-in" style={{ width: '560px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Product</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Product Name *</label><input name="name" className="input" placeholder="Product name" required /></div>
                <div><label className="label">SKU</label><input name="sku" className="input" placeholder="PRD-001" /></div>
                <div><label className="label">Category</label><input name="category" className="input" placeholder="e.g. Software" /></div>
                <div><label className="label">Price (₹) *</label><input name="price" className="input" type="number" placeholder="0" required /></div>
                <div><label className="label">Unit</label><input name="unit" className="input" placeholder="e.g. license" defaultValue="unit" /></div>
                <div><label className="label">Tax Rate (%)</label><input name="taxRate" className="input" type="number" placeholder="18" defaultValue="18" /></div>
                <div style={{ gridColumn: 'span 2' }}><label className="label">Description</label><textarea name="description" className="input" rows={2} placeholder="Product description..." style={{ resize: 'vertical' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><Loader2 size={16} className="spinner" /> Creating...</> : <><Plus size={16} /> Create Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
