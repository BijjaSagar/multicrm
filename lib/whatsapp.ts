import prisma from './prisma'

interface GupshupConfig {
  apiKey: string
  source: string
  appName?: string
}

export async function getWhatsappConfig(tenantId: string): Promise<GupshupConfig | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  })

  const settings = tenant?.settings as any
  if (!settings?.sms?.apiKey || !settings?.sms?.senderId) {
    return null
  }

  return {
    apiKey: settings.sms.apiKey,
    source: settings.sms.senderId,
    appName: settings.meta?.displayName || 'MultiCRM'
  }
}

export async function sendWhatsappMessage(to: string, message: string, tenantId: string) {
  const config = await getWhatsappConfig(tenantId)
  if (!config) throw new Error('WhatsApp not configured for this tenant')

  const response = await fetch(`https://api.gupshup.io/wa/api/v1/msg`, {
    method: 'POST',
    headers: {
      'apikey': config.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'channel': 'whatsapp',
      'source': config.source,
      'destination': to.replace(/\+/g, ''),
      'message': JSON.stringify({ type: 'text', text: message }),
      'src.name': config.appName || 'MultiCRM'
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`WhatsApp sending failed: ${errorBody}`)
  }

  return response.json()
}

export async function sendWhatsappTemplate(to: string, templateId: string, params: string[], tenantId: string) {
  const config = await getWhatsappConfig(tenantId)
  if (!config) throw new Error('WhatsApp not configured')

  const response = await fetch(`https://api.gupshup.io/wa/api/v1/template/msg`, {
    method: 'POST',
    headers: {
      'apikey': config.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      'source': config.source,
      'destination': to.replace(/\+/g, ''),
      'template': JSON.stringify({
        id: templateId,
        params: params
      })
    })
  })

  if (!response.ok) {
     const errorBody = await response.text()
     throw new Error(`WhatsApp template failed: ${errorBody}`)
  }

  return response.json()
}
