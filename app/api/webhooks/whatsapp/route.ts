import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Gupshup / WhatsApp Status Webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // 1. Identify the event (Gupshup format)
    // type: "msg-status", payload: { externalId: "...", status: "delivered/read/failed" }
    const { type, payload } = body
    
    if (type !== 'msg-status') {
      return NextResponse.json({ received: true }) // Ignore other types for now
    }
    
    const { externalId, status, ts } = payload
    
    if (!externalId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    // 2. Map status to our schema
    const statusMap: Record<string, any> = {
      'sent': 'SENT',
      'delivered': 'DELIVERED',
      'read': 'READ',
      'failed': 'FAILED'
    }

    const newStatus = statusMap[status.toLowerCase()] || 'SENT'
    const timestamp = ts ? new Date(ts) : new Date()

    // 3. Update the recipient record
    const recipient = await prisma.recipient.findFirst({
       where: { providerMsgId: externalId }
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    const updateData: any = { status: newStatus }
    if (newStatus === 'SENT') updateData.sentAt = timestamp
    if (newStatus === 'DELIVERED') updateData.deliveredAt = timestamp
    if (newStatus === 'READ') updateData.readAt = timestamp

    await prisma.recipient.update({
      where: { id: recipient.id },
      data: updateData
    })

    // 4. Update the aggregate broadcast counts
    const broadcast = await prisma.broadcast.findUnique({
      where: { id: recipient.broadcastId }
    })

    if (broadcast) {
      // Re-calculate counts (Simple atomic update for scale)
      const countUpdates: any = {}
      if (newStatus === 'SENT') countUpdates.sentCount = { increment: 1 }
      if (newStatus === 'DELIVERED') countUpdates.deliveredCount = { increment: 1 }
      if (newStatus === 'READ') countUpdates.readCount = { increment: 1 }
      if (newStatus === 'FAILED') countUpdates.failedCount = { increment: 1 }

      await prisma.broadcast.update({
        where: { id: broadcast.id },
        data: countUpdates
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Verification for Gupshup/Meta
export async function GET(req: NextRequest) {
   return NextResponse.json({ status: 'active', platform: 'MultiCRM Webhook' })
}
