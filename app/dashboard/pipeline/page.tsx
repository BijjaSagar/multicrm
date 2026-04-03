'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BarChart3, Building2, Calendar, Loader2, RefreshCw, AlertCircle, GripVertical
} from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Deal {
  id: string
  title: string
  value: number
  priority: string
  expectedCloseDate: string | null
  contact: { firstName: string; lastName: string; company: string | null } | null
  assignedTo: { id: string; firstName: string; lastName: string } | null
}

interface Stage {
  id: string
  name: string
  color: string
  probability: number
  deals: Deal[]
}

interface PipelineData {
  id: string
  name: string
  stages: Stage[]
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

/**
 * Individual Deal Card (Sortable)
 */
function SortableDeal({ deal, isOverlay = false }: { deal: Deal; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'Deal', deal },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 1000 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '14px',
        background: 'var(--surface-raised)',
        borderRadius: '10px',
        border: '1px solid var(--surface-border)',
        cursor: 'default',
        position: 'relative',
        boxShadow: isOverlay ? '0 10px 25px rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{deal.title}</div>
          {deal.contact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Building2 size={12} color="var(--text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{deal.contact.company || `${deal.contact.firstName} ${deal.contact.lastName}`}</span>
            </div>
          )}
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#10B981', marginBottom: '8px' }}>{formatCurrency(Number(deal.value))}</div>
        </div>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px', color: 'var(--text-muted)' }}>
          <GripVertical size={16} />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {deal.expectedCloseDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Calendar size={11} /> {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </div>
        )}
        {deal.assignedTo && (
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 600 }}>
            {deal.assignedTo.firstName[0]}{deal.assignedTo.lastName[0]}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Stage Column
 */
function PipelineStageColumn({ stage }: { stage: Stage }) {
  const { setNodeRef } = useSortable({
    id: stage.id,
    data: { type: 'Stage', stage },
  })

  const stageTotal = stage.deals.reduce((sum, d) => sum + Number(d.value), 0)

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '300px',
        maxWidth: '300px',
        flex: 1,
        background: 'var(--surface-bg)',
        border: '1px solid var(--surface-border)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 'calc(100vh - 200px)'
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--surface-border)', borderTop: `3px solid ${stage.color || '#6366F1'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{stage.name}</span>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: `${stage.color || '#6366F1'}20`, color: stage.color || '#6366F1' }}>
            {stage.deals.length}
          </span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(stageTotal)}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{stage.probability}% probability</div>
      </div>
      
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
        <SortableContext items={stage.deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {stage.deals.map(deal => (
            <SortableDeal key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        
        {stage.deals.length === 0 && (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, 
            color: 'var(--text-muted)', fontSize: '13px', border: '2px dashed var(--surface-border)', 
            borderRadius: '10px', padding: '24px', minHeight: '120px' 
          }}>
            Drop deals here
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchPipeline = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline')
      if (!res.ok) throw new Error('Failed to load pipeline')
      const data = await res.json()
      setPipeline(data.pipelines?.[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPipeline() }, [fetchPipeline])

  const findStageOfStore = (id: string, stages: Stage[]) => {
    if (stages.find(s => s.id === id)) return id
    const stage = stages.find(s => s.deals.some(d => d.id === id))
    return stage ? stage.id : null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = (active.data.current as any)?.deal
    if (deal) setActiveDeal(deal)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (!pipeline) return

    const activeStageId = findStageOfStore(activeId, pipeline.stages)
    const overStageId = findStageOfStore(overId, pipeline.stages)

    if (!activeStageId || !overStageId || activeStageId === overStageId) return

    setPipeline(prev => {
      if (!prev) return null
      const updatedStages = prev.stages.map(stage => {
        if (stage.id === activeStageId) {
          return { ...stage, deals: stage.deals.filter(d => d.id !== activeId) }
        }
        if (stage.id === overStageId) {
          const dealToMove = prev.stages.find(s => s.id === activeStageId)?.deals.find(d => d.id === activeId)
          if (!dealToMove) return stage
          
          // Add to proper position if over another deal
          const overDealIndex = stage.deals.findIndex(d => d.id === overId)
          const newDeals = [...stage.deals]
          if (overDealIndex === -1) {
            newDeals.push(dealToMove)
          } else {
            newDeals.splice(overDealIndex, 0, dealToMove)
          }
          return { ...stage, deals: newDeals }
        }
        return stage
      })
      return { ...prev, stages: updatedStages }
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDeal(null)

    if (!over || !pipeline) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeStageId = findStageOfStore(activeId, pipeline.stages)
    const overStageId = findStageOfStore(overId, pipeline.stages)

    if (!activeStageId || !overStageId) return

    // If same stage, just reorder
    if (activeStageId === overStageId) {
      const stage = pipeline.stages.find(s => s.id === activeStageId)!
      const oldIndex = stage.deals.findIndex(d => d.id === activeId)
      const newIndex = stage.deals.findIndex(d => d.id === overId)
      if (oldIndex !== newIndex) {
        setPipeline(prev => {
          if (!prev) return null
          const updatedStages = prev.stages.map(s => {
            if (s.id === activeStageId) {
              return { ...s, deals: arrayMove(s.deals, oldIndex, newIndex) }
            }
            return s
          })
          return { ...prev, stages: updatedStages }
        })
      }
      return
    }

    // Call API to persist the move
    const stage = pipeline.stages.find(s => s.id === overStageId)
    const updateData: any = { stageId: overStageId }
    if (stage?.name.toUpperCase().includes('WON')) updateData.status = 'WON'
    if (stage?.name.toUpperCase().includes('LOST')) updateData.status = 'LOST'

    try {
      await fetch(`/api/deals/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
    } catch (err) {
      console.error('Failed to sync move:', err)
      fetchPipeline() // Revert on failure
    }
  }

  if (loading && !pipeline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '10px', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="animate-spin" /> Loading pipeline...
      </div>
    )
  }

  const stages = pipeline?.stages || []
  const totalValue = stages.reduce((sum, s) => sum + s.deals.reduce((ds, d) => ds + Number(d.value), 0), 0)
  const totalDeals = stages.reduce((sum, s) => sum + s.deals.length, 0)

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: '#8B5CF6' }} /> Pipeline Board
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {totalDeals} deals · {formatCurrency(totalValue)} total pipeline
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchPipeline}><RefreshCw size={14} /> Refresh</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{ 
          display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', 
          flex: 1, minHeight: '0' 
        }}>
          {stages.map(stage => (
            <PipelineStageColumn key={stage.id} stage={stage} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
          {activeDeal ? (
            <div style={{ width: '300px' }}>
              <SortableDeal deal={activeDeal} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
