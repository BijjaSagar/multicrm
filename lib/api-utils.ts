import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function getAuthSession() {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return session
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function success(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function serverError(error: unknown) {
  console.error('API Error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function parseSearchParams(url: string) {
  const { searchParams } = new URL(url)
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
