import { getAuthSession, unauthorized, success, serverError } from '@/lib/api-utils'
import prisma from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { calculateLeadScore } from '@/lib/lead-automation'

// Maps CSV header aliases to canonical Lead field names
const FIELD_MAP: Record<string, string> = {
  // Name
  firstname: 'firstName', first_name: 'firstName', 'first name': 'firstName', name: 'firstName',
  lastname: 'lastName', last_name: 'lastName', 'last name': 'lastName', surname: 'lastName',
  // Contact
  email: 'email', 'email address': 'email',
  phone: 'phone', mobile: 'phone', 'phone number': 'phone', contact: 'phone',
  // Company / Job
  company: 'company', organization: 'company', 'company name': 'company',
  jobtitle: 'jobTitle', job_title: 'jobTitle', 'job title': 'jobTitle', title: 'jobTitle',
  // Lead metadata
  source: 'source', 'lead source': 'source', leadsource: 'source',
  status: 'status', 'lead status': 'status',
  priority: 'priority',
  notes: 'notes', description: 'notes', remarks: 'notes',
  expectedrevenue: 'expectedRevenue', expected_revenue: 'expectedRevenue', revenue: 'expectedRevenue',
  address: 'address', location: 'address', city: 'city', state: 'state',
}

const VALID_SOURCES = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'SOCIAL_MEDIA', 'ADVERTISEMENT', 'TRADE_SHOW', 'PARTNER', 'OTHER']
const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST', 'JUNK']
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else { inQuotes = !inQuotes }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const rawHeaders = parseRow(lines[0])
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9 _]/g, '').trim())

  const rows = lines.slice(1).map(line => {
    const values = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] || '' })
    return row
  }).filter(row => Object.values(row).some(v => v.trim() !== ''))

  return { headers, rows }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return Response.json({ error: 'Only .csv files are supported' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum 10MB allowed.' }, { status: 400 })
    }

    const text = await file.text()
    const { rows } = parseCSV(text)

    if (rows.length === 0) {
      return Response.json({ error: 'CSV file is empty or has no valid rows' }, { status: 400 })
    }
    if (rows.length > 5000) {
      return Response.json({ error: 'Maximum 5000 rows per import. Please split into smaller files.' }, { status: 400 })
    }

    const { tenantId, id: userId, branchId } = session.user

    const imported: string[] = []
    const skipped: Array<{ row: number; reason: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // 1-indexed, row 1 = header

      // Map headers to canonical fields
      const mapped: Record<string, string> = {}
      for (const [rawHeader, value] of Object.entries(row)) {
        const canonical = FIELD_MAP[rawHeader]
        if (canonical && value) mapped[canonical] = value
      }

      // firstName is required
      if (!mapped.firstName?.trim()) {
        skipped.push({ row: rowNum, reason: 'Missing firstName' })
        continue
      }

      // Validate and sanitize enum fields
      const source = mapped.source?.toUpperCase().replace(/ /g, '_')
      const status = mapped.status?.toUpperCase().replace(/ /g, '_')
      const priority = mapped.priority?.toUpperCase().replace(/ /g, '_')

      const leadData: any = {
        tenantId,
        branchId: branchId || undefined,
        createdById: userId,
        firstName: mapped.firstName.trim(),
        lastName: (mapped.lastName || '').trim() || null,
        email: mapped.email?.toLowerCase().trim() || null,
        phone: mapped.phone?.trim() || null,
        company: mapped.company?.trim() || null,
        jobTitle: mapped.jobTitle?.trim() || null,
        source: VALID_SOURCES.includes(source) ? source : 'OTHER',
        status: VALID_STATUSES.includes(status) ? status : 'NEW',
        priority: VALID_PRIORITIES.includes(priority) ? priority : 'MEDIUM',
        notes: mapped.notes?.trim() || null,
        expectedRevenue: mapped.expectedRevenue ? parseFloat(mapped.expectedRevenue.replace(/[^0-9.]/g, '')) || null : null,
        address: mapped.address?.trim() || null,
        city: mapped.city?.trim() || null,
        state: mapped.state?.trim() || null,
      }

      try {
        const lead = await prisma.lead.create({ data: leadData })
        imported.push(lead.id)

        // Score async but don't block
        calculateLeadScore(lead.id).catch(() => {})
      } catch (err: any) {
        if (err?.code === 'P2002') {
          skipped.push({ row: rowNum, reason: 'Duplicate email' })
        } else {
          skipped.push({ row: rowNum, reason: 'Database error' })
        }
      }
    }

    return success({
      imported: imported.length,
      skipped: skipped.length,
      total: rows.length,
      skippedDetails: skipped.slice(0, 20), // cap response size
    })
  } catch (error) {
    return serverError(error)
  }
}
