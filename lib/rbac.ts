import { UserRole } from '@prisma/client'

export type AccessLevel = 'OWN' | 'BRANCH' | 'TENANT' | 'GLOBAL'

export interface UserSession {
  id: string
  role: UserRole | string
  tenantId: string
  branchId: string | null
}

/**
 * Returns the access level for a specific role and entity.
 */
export function getAccessLevel(role: UserRole | string, entity: string): AccessLevel {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'GLOBAL'
    case 'TENANT_ADMIN':
      return 'TENANT'
    case 'BRANCH_MANAGER':
      return 'BRANCH'
    case 'SALES_MANAGER':
      // Manager sees all data for their domain (tenant level for sales objects)
      if (['Lead', 'Deal', 'Contact'].includes(entity)) return 'TENANT'
      return 'BRANCH'
    case 'SUPPORT_MANAGER':
      if (['Ticket'].includes(entity)) return 'TENANT'
      return 'BRANCH'
    case 'SALES_REP':
      // Prompt says: "a salesperson in Delhi would only see leads and deals from the Delhi branch"
      // So Sales Rep gets BRANCH level access for their domain.
      if (['Lead', 'Deal', 'Contact'].includes(entity)) return 'BRANCH'
      return 'BRANCH'
    case 'SUPPORT_AGENT':
      if (['Ticket'].includes(entity)) return 'BRANCH'
      return 'BRANCH'
    case 'VIEWER':
      return 'BRANCH'
    default:
      return 'OWN'
  }
}

/**
 * Generates a Prisma 'where' clause based on the user's role and access level.
 */
export function getRBACWhere(user: UserSession, entity: string = 'DEFAULT'): any {
  if (user.role === 'SUPER_ADMIN') return {}

  const level = getAccessLevel(user.role, entity)
  const baseWhere: any = { tenantId: user.tenantId }

  switch (level) {
    case 'TENANT':
      return baseWhere
    case 'BRANCH':
      if (!user.branchId) return { ...baseWhere, id: 'none' } 
      return { ...baseWhere, branchId: user.branchId }
    case 'OWN':
      return {
        ...baseWhere,
        OR: [
          { assignedToId: user.id },
          { createdById: user.id },
          ...(user.branchId ? [{ assignedToId: null, branchId: user.branchId }] : []),
        ],
      }
    default:
      return baseWhere
  }
}

/**
 * Check if the user can perform a specific action on a record.
 */
export function canAccess(user: UserSession, action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE', entity: string, record?: any): boolean {
  if (user.role === 'SUPER_ADMIN' || user.role === 'TENANT_ADMIN') return true
  
  if (user.role === 'VIEWER' && action !== 'READ') return false

  if (!record) return true 

  const level = getAccessLevel(user.role, entity)
  
  if (level === 'TENANT') return record.tenantId === user.tenantId
  if (level === 'BRANCH') return record.branchId === user.branchId
  if (level === 'OWN') {
    return record.assignedToId === user.id || record.createdById === user.id || (record.assignedToId === null && record.branchId === user.branchId)
  }

  return false
}
