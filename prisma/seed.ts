import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL!
const url = new URL(databaseUrl)

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company Pvt Ltd',
      slug: 'demo-company',
      domain: 'demo.multicrm.in',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
      settings: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        language: 'en',
      },
    },
  })
  console.log(`✅ Tenant created: ${tenant.name}`)

  // Create Head Office Branch
  const headOffice = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Head Office - Mumbai',
      code: 'HO-MUM',
      address: 'Bandra Kurla Complex, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      phone: '+91 22 1234 5678',
      email: 'ho@democompany.com',
      isHeadquarters: true,
      status: 'ACTIVE',
    },
  })

  const delhiBranch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Delhi NCR Branch',
      code: 'BR-DEL',
      address: 'Connaught Place, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      phone: '+91 11 9876 5432',
      email: 'delhi@democompany.com',
      isHeadquarters: false,
      status: 'ACTIVE',
    },
  })

  const bangaloreBranch = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: 'Bangalore Tech Hub',
      code: 'BR-BLR',
      address: 'Electronic City, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      phone: '+91 80 5555 1234',
      email: 'blr@democompany.com',
      isHeadquarters: false,
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Branches created: ${headOffice.name}, ${delhiBranch.name}, ${bangaloreBranch.name}`)

  // Create Users  
  const hashedPassword = await bcrypt.hash('MultiCRM@2026', 12)

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@democompany.com',
      password: hashedPassword,
      firstName: 'Akash',
      lastName: 'Admin',
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
      tenantId: tenant.id,
      branchId: headOffice.id,
      status: 'ACTIVE',
    },
  })

  const salesManager = await prisma.user.create({
    data: {
      email: 'sales@democompany.com',
      password: hashedPassword,
      firstName: 'Rahul',
      lastName: 'Sharma',
      phone: '+91 98765 11111',
      role: 'SALES_MANAGER',
      tenantId: tenant.id,
      branchId: headOffice.id,
      status: 'ACTIVE',
    },
  })

  const salesRep = await prisma.user.create({
    data: {
      email: 'rep@democompany.com',
      password: hashedPassword,
      firstName: 'Priya',
      lastName: 'Patel',
      phone: '+91 98765 22222',
      role: 'SALES_REP',
      tenantId: tenant.id,
      branchId: delhiBranch.id,
      status: 'ACTIVE',
    },
  })

  const supportAgent = await prisma.user.create({
    data: {
      email: 'support@democompany.com',
      password: hashedPassword,
      firstName: 'Amit',
      lastName: 'Kumar',
      phone: '+91 98765 33333',
      role: 'SUPPORT_AGENT',
      tenantId: tenant.id,
      branchId: bangaloreBranch.id,
      status: 'ACTIVE',
    },
  })
  console.log(`✅ Users created: ${superAdmin.email}, ${salesManager.email}, ${salesRep.email}, ${supportAgent.email}`)

  // Create Products
  const products = [
    { name: 'CRM Basic', sku: 'CRM-BASIC', price: 999, description: 'Basic CRM with essential features' },
    { name: 'CRM Professional', sku: 'CRM-PRO', price: 2999, description: 'Professional CRM with advanced analytics' },
    { name: 'CRM Enterprise', sku: 'CRM-ENT', price: 9999, description: 'Enterprise CRM with full customization' },
    { name: 'Support Add-on', sku: 'SUP-ADDON', price: 1499, description: 'Ticketing & SLA management add-on' },
    { name: 'API Integration Pack', sku: 'API-PACK', price: 4999, description: 'REST API & webhook integration pack' },
    { name: 'Custom Consulting', sku: 'CONSULT', price: 25000, description: 'Per-day consulting & implementation' },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        tenantId_sku: { tenantId: tenant.id, sku: product.sku },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        description: product.description,
        category: 'Software',
        isActive: true,
      },
    })
  }
  console.log(`✅ Products created: ${products.length}`)

  // Create Sample Leads
  const leadData = [
    { firstName: 'Rajesh', lastName: 'Gupta', email: 'rajesh@tcs.com', company: 'TCS', jobTitle: 'VP Engineering', status: 'QUALIFIED' as const, source: 'SOCIAL_MEDIA' as const },
    { firstName: 'Sunita', lastName: 'Reddy', email: 'sunita@infosys.com', company: 'Infosys', jobTitle: 'CTO', status: 'CONTACTED' as const, source: 'REFERRAL' as const },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@wipro.com', company: 'Wipro', jobTitle: 'Director IT', status: 'NEW' as const, source: 'WEBSITE' as const },
    { firstName: 'Meera', lastName: 'Joshi', email: 'meera@hcl.com', company: 'HCL Technologies', jobTitle: 'Head of Sales', status: 'PROPOSAL_SENT' as const, source: 'TRADE_SHOW' as const },
    { firstName: 'Arjun', lastName: 'Nair', email: 'arjun@reliance.com', company: 'Reliance Industries', jobTitle: 'GM Digital', status: 'NEGOTIATION' as const, source: 'COLD_CALL' as const },
    { firstName: 'Kavita', lastName: 'Deshmukh', email: 'kavita@mahindra.com', company: 'Mahindra Group', jobTitle: 'SVP Technology', status: 'NEW' as const, source: 'ADVERTISEMENT' as const },
    { firstName: 'Sanjay', lastName: 'Mehta', email: 'sanjay@adani.com', company: 'Adani Group', jobTitle: 'CIO', status: 'CONTACTED' as const, source: 'EMAIL_CAMPAIGN' as const },
    { firstName: 'Deepa', lastName: 'Krishnan', email: 'deepa@cognizant.com', company: 'Cognizant', jobTitle: 'VP Operations', status: 'QUALIFIED' as const, source: 'PARTNER' as const },
  ]

  for (const lead of leadData) {
    await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        branchId: headOffice.id,
        assignedToId: salesRep.id,
        createdById: salesManager.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.company,
        jobTitle: lead.jobTitle,
        status: lead.status,
        source: lead.source,
        phone: '+91 ' + Math.floor(9000000000 + Math.random() * 999999999),
        expectedRevenue: Math.floor(100000 + Math.random() * 5000000),
        score: Math.floor(20 + Math.random() * 80),
      },
    })
  }
  console.log(`✅ Leads created: ${leadData.length}`)

  // Create Sample Contacts
  const contactData = [
    { firstName: 'Amit', lastName: 'Shah', email: 'amit.shah@tatasteel.com', company: 'Tata Steel', jobTitle: 'Purchase Head' },
    { firstName: 'Neha', lastName: 'Kapoor', email: 'neha@flipkart.com', company: 'Flipkart', jobTitle: 'Head of Technology' },
    { firstName: 'Rohit', lastName: 'Verma', email: 'rohit@ola.com', company: 'Ola Cabs', jobTitle: 'Engineering Manager' },
    { firstName: 'Anita', lastName: 'Rao', email: 'anita@zomato.com', company: 'Zomato', jobTitle: 'VP Product' },
    { firstName: 'Karthik', lastName: 'Iyer', email: 'karthik@freshworks.com', company: 'Freshworks', jobTitle: 'Solutions Architect' },
  ]

  for (const contact of contactData) {
    await prisma.contact.create({
      data: {
        tenantId: tenant.id,
        branchId: headOffice.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        jobTitle: contact.jobTitle,
        phone: '+91 ' + Math.floor(9000000000 + Math.random() * 999999999),
        status: 'ACTIVE',
        type: 'CUSTOMER',
      },
    })
  }
  console.log(`✅ Contacts created: ${contactData.length}`)

  // Create Pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      tenantId: tenant.id,
      name: 'Default Sales Pipeline',
      isDefault: true,
      stages: {
        create: [
          { name: 'Qualification', order: 1, probability: 10, color: '#3B82F6' },
          { name: 'Needs Analysis', order: 2, probability: 25, color: '#8B5CF6' },
          { name: 'Proposal', order: 3, probability: 50, color: '#F59E0B' },
          { name: 'Negotiation', order: 4, probability: 75, color: '#06B6D4' },
          { name: 'Closed Won', order: 5, probability: 100, color: '#10B981', isWon: true },
          { name: 'Closed Lost', order: 6, probability: 0, color: '#EF4444', isLost: true },
        ],
      },
    },
    include: { stages: true },
  })
  console.log(`✅ Pipeline created: ${pipeline.name} with ${pipeline.stages.length} stages`)

  // Create Sample Deals
  const contacts = await prisma.contact.findMany({ where: { tenantId: tenant.id } })
  const dealData = [
    { title: 'Enterprise Cloud Suite', value: 8500000, stage: 'Proposal' },
    { title: 'Digital Transformation', value: 12000000, stage: 'Negotiation' },
    { title: 'CRM Implementation', value: 4500000, stage: 'Qualification' },
    { title: 'Security Audit Package', value: 3200000, stage: 'Needs Analysis' },
    { title: 'AI Integration Project', value: 6800000, stage: 'Proposal' },
    { title: 'Annual Support Contract', value: 1800000, stage: 'Closed Won' },
  ]

  for (let i = 0; i < dealData.length; i++) {
    const deal = dealData[i]
    const stage = pipeline.stages.find((s) => s.name === deal.stage)
    const contact = contacts[i % contacts.length]

    await prisma.deal.create({
      data: {
        tenantId: tenant.id,
        branchId: headOffice.id,
        pipelineId: pipeline.id,
        stageId: stage!.id,
        contactId: contact.id,
        assignedToId: salesManager.id,
        title: deal.title,
        value: deal.value,
        currency: 'INR',
        probability: stage!.probability,
        status: deal.stage.startsWith('Closed') ? (deal.stage === 'Closed Won' ? 'WON' : 'LOST') : 'OPEN',
        expectedCloseDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    })
  }
  console.log(`✅ Deals created: ${dealData.length}`)

  // Create Sample Tickets
  const ticketData = [
    { subject: 'Login issues on mobile app', description: 'Users unable to login via mobile app after recent update', priority: 'HIGH' as const, status: 'OPEN' as const },
    { subject: 'Dashboard loading slowly', description: 'Dashboard takes more than 10 seconds to load for enterprise users', priority: 'MEDIUM' as const, status: 'IN_PROGRESS' as const },
    { subject: 'Export to CSV not working', description: 'CSV export fails for reports with more than 10k records', priority: 'LOW' as const, status: 'OPEN' as const },
    { subject: 'Critical: Data sync failure', description: 'Real-time sync between branches stopped working', priority: 'CRITICAL' as const, status: 'OPEN' as const },
    { subject: 'Feature request: Dark mode', description: 'Multiple users requested dark mode for the dashboard', priority: 'LOW' as const, status: 'IN_PROGRESS' as const },
    { subject: 'API rate limit exceeded', description: 'Third-party integration hitting rate limits during peak hours', priority: 'URGENT' as const, status: 'OPEN' as const },
  ]

  for (const ticket of ticketData) {
    const slaDeadline = new Date()
    const hoursMap: Record<string, number> = { CRITICAL: 2, URGENT: 4, HIGH: 8, MEDIUM: 24, LOW: 72 }
    slaDeadline.setHours(slaDeadline.getHours() + (hoursMap[ticket.priority] || 24))

    await prisma.ticket.create({
      data: {
        tenantId: tenant.id,
        branchId: headOffice.id,
        assignedToId: supportAgent.id,
        createdById: superAdmin.id,
        contactId: contacts[Math.floor(Math.random() * contacts.length)].id,
        ticketNumber: `MCR-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: 'TECHNICAL',
        slaDeadline,
      },
    })
  }
  console.log(`✅ Tickets created: ${ticketData.length}`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login Credentials:')
  console.log('  Super Admin: admin@democompany.com / MultiCRM@2026')
  console.log('  Sales Manager: sales@democompany.com / MultiCRM@2026')
  console.log('  Sales Rep: rep@democompany.com / MultiCRM@2026')
  console.log('  Support Agent: support@democompany.com / MultiCRM@2026')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
