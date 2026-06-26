import { getAuthSession, unauthorized, serverError } from '@/lib/api-utils'
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024

function noKeyResponse() {
  return Response.json(
    { error: 'AI features require ANTHROPIC_API_KEY to be configured in your server environment.' },
    { status: 503 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    if (!process.env.ANTHROPIC_API_KEY) return noKeyResponse()

    const body = await request.json()
    const { action } = body

    // ── Email / WhatsApp template generator ────────────────────────────────
    if (action === 'email-generate') {
      const { prompt, vertical, category } = body
      if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 })

      const systemPrompt = `You are a CRM email/message template writer for a ${vertical || 'General Business'} company.
Write professional, warm, and concise templates. Use {{firstName}}, {{companyName}}, {{agentName}} as merge tags where appropriate.
Category: ${category || 'General'}. Reply with ONLY the template body — no subject line, no explanation.`

      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      return Response.json({ result: text.trim() })
    }

    // ── Subject line generator ──────────────────────────────────────────────
    if (action === 'subject-generate') {
      const { body: emailBody, vertical } = body
      if (!emailBody) return Response.json({ error: 'body is required' }, { status: 400 })

      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 100,
        system: `Generate a single compelling email subject line for a ${vertical || 'CRM'} email. Reply with ONLY the subject line, no quotes.`,
        messages: [{ role: 'user', content: `Email body:\n${emailBody.slice(0, 500)}` }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      return Response.json({ result: text.trim() })
    }

    // ── Lead smart summary + next action ───────────────────────────────────
    if (action === 'lead-summary') {
      const { lead, vertical } = body
      if (!lead) return Response.json({ error: 'lead is required' }, { status: 400 })

      const leadContext = `
Name: ${lead.firstName} ${lead.lastName || ''}
Company: ${lead.company || 'N/A'}
Email: ${lead.email || 'N/A'}
Phone: ${lead.phone || 'N/A'}
Status: ${lead.status}
Priority: ${lead.priority}
Score: ${lead.score}/100
Source: ${lead.source}
Expected Revenue: ${lead.expectedRevenue ? `₹${lead.expectedRevenue}` : 'N/A'}
Notes: ${lead.notes?.slice(0, 300) || 'None'}
Recent Activities (last 3):
${lead.activities?.slice(0, 3).map((a: any) => `- [${a.type}] ${a.subject} on ${new Date(a.createdAt).toLocaleDateString()}`).join('\n') || 'None recorded'}
`.trim()

      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 400,
        system: `You are a CRM assistant for a ${vertical || 'General Business'} team. Analyze this lead and respond in JSON with exactly two fields:
"summary": a 1-sentence plain-English summary of who this lead is and where they are in the sales process.
"nextAction": the single best next action the sales rep should take RIGHT NOW (be specific and actionable, max 20 words).
Respond ONLY with valid JSON, no markdown.`,
        messages: [{ role: 'user', content: leadContext }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
      try {
        const parsed = JSON.parse(text.trim())
        return Response.json({ result: parsed })
      } catch {
        return Response.json({ result: { summary: text.trim(), nextAction: '' } })
      }
    }

    // ── CRM Chat Assistant ─────────────────────────────────────────────────
    if (action === 'chat') {
      const { messages, context } = body
      if (!messages?.length) return Response.json({ error: 'messages are required' }, { status: 400 })

      const systemPrompt = `You are MultiCRM Pro's AI assistant — a helpful, concise CRM advisor for a ${context?.vertical || 'General Business'} company.
You help sales reps with: lead qualification advice, follow-up strategies, pipeline tips, draft messages, and CRM navigation.
Company: ${context?.tenantName || 'the company'}. User role: ${context?.role || 'Sales Rep'}.
Keep answers brief and practical. Use bullet points for lists. Never make up CRM data you haven't been given.`

      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      return Response.json({ result: text.trim() })
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (error: any) {
    if (error?.status === 401) {
      return Response.json({ error: 'Invalid ANTHROPIC_API_KEY. Check your server environment.' }, { status: 503 })
    }
    return serverError(error)
  }
}
