import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(d)
}

export function generateInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function generateTicketNumber(tenantSlug: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${tenantSlug.substring(0, 3).toUpperCase()}-${timestamp}-${random}`
}

export function calculateSLADeadline(priority: string, createdAt: Date = new Date()): Date {
  const hoursMap: Record<string, number> = {
    CRITICAL: 2,
    URGENT: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 72,
  }
  const hours = hoursMap[priority] || 24
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000)
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    NEW: '#3B82F6',
    ACTIVE: '#10B981',
    OPEN: '#3B82F6',
    IN_PROGRESS: '#F59E0B',
    QUALIFIED: '#8B5CF6',
    CONVERTED: '#10B981',
    WON: '#10B981',
    LOST: '#EF4444',
    CLOSED: '#6B7280',
    RESOLVED: '#10B981',
    SUSPENDED: '#EF4444',
    INACTIVE: '#9CA3AF',
  }
  return colorMap[status] || '#6B7280'
}

export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    LOW: '#6B7280',
    MEDIUM: '#3B82F6',
    HIGH: '#F59E0B',
    URGENT: '#EF4444',
    CRITICAL: '#DC2626',
  }
  return colorMap[priority] || '#6B7280'
}

export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function parseSearchParams(searchParams: URLSearchParams) {
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
