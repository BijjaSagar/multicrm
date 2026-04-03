import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getRBACWhere } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  try {
    const where = getRBACWhere(session.user, 'TENANT') // Attendance is usually tenant-wide for managers
    
    // Filter by specific user if provided
    if (userId) {
      // Ensure the requester can see this user's data
      // For simplicity, we filter by the RBAC result
      where.userId = userId
    }

    if (startDate || endDate) {
      where.checkIn = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        },
        branch: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        checkIn: 'desc'
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, note } = await req.json()

  try {
    if (action === 'CHECK_OUT') {
      // Find latest active session
      const activeSession = await prisma.attendance.findFirst({
        where: {
          userId: session.user.id,
          status: 'ACTIVE',
        },
        orderBy: {
          checkIn: 'desc'
        }
      })

      if (!activeSession) {
        return NextResponse.json({ error: 'No active session found' }, { status: 400 })
      }

      const checkOut = new Date()
      const duration = Math.floor((checkOut.getTime() - activeSession.checkIn.getTime()) / (1000 * 60))

      await prisma.attendance.update({
        where: { id: activeSession.id },
        data: {
          checkOut,
          status: 'COMPLETED',
          duration,
          notes: note,
        }
      })

      return NextResponse.json({ message: 'Checked out successfully' })
    }

    if (action === 'CHECK_IN') {
      // Create new session
      const attendance = await prisma.attendance.create({
        data: {
          userId: session.user.id,
          tenantId: session.user.tenantId,
          branchId: session.user.branchId,
          status: 'ACTIVE',
          checkIn: new Date(),
          notes: note,
        }
      })

      return NextResponse.json(attendance)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Attendance track error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
