/**
 * MultiCRM Universal Vertical Templates
 * This file defines the industry-specific configurations for different business types.
 * When a new tenant signs up, these templates are used to auto-configure their workspace.
 */

export interface VerticalTemplate {
  name: string
  description: string
  modules: string[]
  pipelineStages: {
    name: string
    color: string
    probability: number
  }[]
  customFields: {
    entityType: 'LEAD' | 'DEAL' | 'TICKET' | 'CONTACT'
    fieldName: string
    fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX' | 'PHONE'
    isRequired: boolean
    options?: string[]
  }[]
}

export const VERTICAL_TEMPLATES: Record<string, VerticalTemplate> = {
  GENERAL: {
    name: 'General Business',
    description: 'Standard B2B/B2C sales and lead management.',
    modules: ['SALES_PIPELINE', 'SUPPORT_TICKETS', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'New Lead', color: '#3B82F6', probability: 0 },
      { name: 'Contacted', color: '#F59E0B', probability: 20 },
      { name: 'Proposal', color: '#6366F1', probability: 50 },
      { name: 'Negotiation', color: '#8B5CF6', probability: 80 },
      { name: 'Won', color: '#10B981', probability: 100 },
      { name: 'Lost', color: '#EF4444', probability: 0 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Lead Source', fieldType: 'DROPDOWN', isRequired: false, options: ['Website', 'Referral', 'Social Media', 'Advertisement'] },
      { entityType: 'DEAL', fieldName: 'Budget Range', fieldType: 'TEXT', isRequired: false },
      { entityType: 'DEAL', fieldName: 'Decision Maker Name', fieldType: 'TEXT', isRequired: false },
    ],
  },
  SALES_AGENCY: {
    name: 'Sales Agency',
    description: 'Standard B2B/B2C sales and lead management.',
    modules: ['SALES_PIPELINE', 'SUPPORT_TICKETS', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'New Lead', color: '#3B82F6', probability: 0 },
      { name: 'Contacted', color: '#F59E0B', probability: 20 },
      { name: 'Proposal', color: '#6366F1', probability: 50 },
      { name: 'Negotiation', color: '#8B5CF6', probability: 80 },
      { name: 'Won', color: '#10B981', probability: 100 },
      { name: 'Lost', color: '#EF4444', probability: 0 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Lead Source', fieldType: 'DROPDOWN', isRequired: false, options: ['Website', 'Referral', 'Social Media', 'Advertisement'] },
      { entityType: 'DEAL', fieldName: 'Budget Range', fieldType: 'TEXT', isRequired: false },
      { entityType: 'DEAL', fieldName: 'Decision Maker Name', fieldType: 'TEXT', isRequired: false },
    ],
  },
  REAL_ESTATE: {
    name: 'Real Estate',
    description: 'Property inventory, site visits, and buyer matching.',
    modules: ['PROPERTY_MANAGEMENT', 'SALES_PIPELINE', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Enquiry', color: '#3B82F6', probability: 0 },
      { name: 'Site Visit', color: '#F59E0B', probability: 40 },
      { name: 'Negotiation', color: '#6366F1', probability: 70 },
      { name: 'Agreement', color: '#8B5CF6', probability: 90 },
      { name: 'Registration', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Property Type', fieldType: 'DROPDOWN', isRequired: true, options: ['Apartment', 'Villa', 'Plot', 'Commercial'] },
      { entityType: 'DEAL', fieldName: 'BHK Required', fieldType: 'DROPDOWN', isRequired: false, options: ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'] },
      { entityType: 'LEAD', fieldName: 'Preferred Location', fieldType: 'TEXT', isRequired: false },
      { entityType: 'DEAL', fieldName: 'Loan Required', fieldType: 'CHECKBOX', isRequired: false },
    ],
  },
  HEALTHCARE: {
    name: 'Healthcare / Clinic',
    description: 'Patient appointments, prescriptions, and medical records.',
    modules: ['PATIENT_MANAGEMENT', 'BILLING_INVOICES', 'SUPPORT_TICKETS'],
    pipelineStages: [
      { name: 'New Patient', color: '#3B82F6', probability: 0 },
      { name: 'Appointment Booked', color: '#F59E0B', probability: 50 },
      { name: 'Visited', color: '#6366F1', probability: 80 },
      { name: 'Follow-up Required', color: '#8B5CF6', probability: 90 },
      { name: 'Discharged / Completed', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'CONTACT', fieldName: 'Blood Group', fieldType: 'DROPDOWN', isRequired: false, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
      { entityType: 'CONTACT', fieldName: 'Age', fieldType: 'NUMBER', isRequired: true },
      { entityType: 'CONTACT', fieldName: 'Gender', fieldType: 'DROPDOWN', isRequired: true, options: ['Male', 'Female', 'Other'] },
      { entityType: 'LEAD', fieldName: 'Referring Doctor', fieldType: 'TEXT', isRequired: false },
    ],
  },
  EDUCATION: {
    name: 'Education / School',
    description: 'Admissions, student tracking, and course management.',
    modules: ['STUDENT_MANAGEMENT', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Enquiry', color: '#3B82F6', probability: 0 },
      { name: 'Counselling', color: '#F59E0B', probability: 30 },
      { name: 'Applied', color: '#6366F1', probability: 60 },
      { name: 'Documents', color: '#8B5CF6', probability: 80 },
      { name: 'Fee Paid', color: '#10B981', probability: 100 },
      { name: 'Enrolled', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Grade Applying For', fieldType: 'TEXT', isRequired: true },
      { entityType: 'LEAD', fieldName: 'Board (CBSE/ICSE)', fieldType: 'DROPDOWN', isRequired: true, options: ['CBSE', 'ICSE', 'State Board', 'IB'] },
      { entityType: 'CONTACT', fieldName: 'Parent Name', fieldType: 'TEXT', isRequired: true },
      { entityType: 'DEAL', fieldName: 'School Budget', fieldType: 'NUMBER', isRequired: false },
    ],
  },
  TELECOM: {
    name: 'Telecom / ISP',
    description: 'Subscriber management, service plans, and NOC complaints.',
    modules: ['SUBSCRIBER_MANAGEMENT', 'SUPPORT_TICKETS', 'BILLING_INVOICES'],
    pipelineStages: [
      { name: 'New Enquiry', color: '#3B82F6', probability: 0 },
      { name: 'Demo', color: '#F59E0B', probability: 30 },
      { name: 'Plan Selected', color: '#6366F1', probability: 60 },
      { name: 'Installation', color: '#8B5CF6', probability: 90 },
      { name: 'Active', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Connection Type', fieldType: 'DROPDOWN', isRequired: true, options: ['Fiber', 'Broadband', 'Leased Line', 'Wireless'] },
      { entityType: 'DEAL', fieldName: 'Speed Plan', fieldType: 'TEXT', isRequired: true },
      { entityType: 'CONTACT', fieldName: 'Installation Address', fieldType: 'TEXT', isRequired: true },
      { entityType: 'DEAL', fieldName: 'Router Model', fieldType: 'TEXT', isRequired: false },
    ],
  },
  FIELD_SERVICE: {
    name: 'Field Service',
    description: 'Jobs, technicians, and maintenance scheduling.',
    modules: ['FIELD_SERVICE', 'SUPPORT_TICKETS', 'BILLING_INVOICES'],
    pipelineStages: [
      { name: 'Job Raised', color: '#3B82F6', probability: 0 },
      { name: 'Assigned', color: '#F59E0B', probability: 40 },
      { name: 'In Progress', color: '#6366F1', probability: 70 },
      { name: 'Completed', color: '#10B981', probability: 100 },
      { name: 'Invoiced', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Job Type', fieldType: 'DROPDOWN', isRequired: true, options: ['Repair', 'Installation', 'Maintenance', 'Survey'] },
      { entityType: 'LEAD', fieldName: 'Equipment Model', fieldType: 'TEXT', isRequired: false },
      { entityType: 'DEAL', fieldName: 'Warranty Status', fieldType: 'DROPDOWN', isRequired: false, options: ['In Warranty', 'Out of Warranty', 'AMC'] },
    ],
  },
  DISTANCE_EDUCATION: {
    name: 'Distance Education',
    description: 'LSC Admissions, student enrollment, and course tracking.',
    modules: ['STUDENT_MANAGEMENT', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'To be Enrol LSC', color: '#3B82F6', probability: 10 },
      { name: 'Counselling', color: '#F59E0B', probability: 30 },
      { name: 'Applied', color: '#6366F1', probability: 60 },
      { name: 'Documents Verifying', color: '#8B5CF6', probability: 80 },
      { name: 'Fees Paid', color: '#10B981', probability: 90 },
      { name: 'Admitted', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Salutation', fieldType: 'DROPDOWN', isRequired: true, options: ['Mr.', 'Ms.', 'Mrs.', 'M/s.'] },
      { entityType: 'LEAD', fieldName: 'Gender', fieldType: 'DROPDOWN', isRequired: true, options: ['Male', 'Female', 'Other'] },
      { entityType: 'LEAD', fieldName: 'Course', fieldType: 'DROPDOWN', isRequired: true, options: ['Dual Program', 'PGDM', 'PGDBA', 'PGCM', 'PGDM-Executive', 'SQL Power Bi Certification', 'PCP', 'Gen Al for Educators Program'] },
      { entityType: 'LEAD', fieldName: 'Specialization', fieldType: 'DROPDOWN', isRequired: true, options: [
        'Construction and Project Management', 'Marketing Management', 'Operations Management',
        'Finance Management', 'Human Resource Management', 'Project Management',
        'Information Technology', 'Material Management', 'Logistics & Supply chain Management',
        'Banking & Financial Services'
      ] },
      { entityType: 'LEAD', fieldName: 'Dual Specialization', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Password', fieldType: 'TEXT', isRequired: true },
      { entityType: 'LEAD', fieldName: 'Is Referral', fieldType: 'DROPDOWN', isRequired: true, options: ['No', 'Yes'] }
    ]
  },
  ECOMMERCE: {
    name: 'eCommerce / Retail',
    description: 'Online orders, customer lifetime value, and loyalty tracking.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'New', color: '#3B82F6', probability: 10 },
      { name: 'Cart Abandoned', color: '#F59E0B', probability: 30 },
      { name: 'Ordered', color: '#10B981', probability: 100 },
      { name: 'Repeat Customer', color: '#6366F1', probability: 100 },
      { name: 'VIP', color: '#8B5CF6', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Average Order Value', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Preferred Category', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Last Purchase Date', fieldType: 'DATE', isRequired: false },
    ],
  },
  HOSPITALITY: {
    name: 'Hospitality & Hotels',
    description: 'Guest management, booking pipeline, and room allocation.',
    modules: ['BOOKING_MANAGEMENT', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Booking Confirmed', color: '#F59E0B', probability: 40 },
      { name: 'Advance Paid', color: '#6366F1', probability: 60 },
      { name: 'Checked In', color: '#8B5CF6', probability: 80 },
      { name: 'Checked Out', color: '#10B981', probability: 100 },
      { name: 'Repeat Guest', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Check-in Date', fieldType: 'DATE', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Check-out Date', fieldType: 'DATE', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Room Type', fieldType: 'DROPDOWN', isRequired: false, options: ['Single', 'Double', 'Suite', 'Deluxe'] },
      { entityType: 'LEAD', fieldName: 'Guest Count', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Booking Source', fieldType: 'DROPDOWN', isRequired: false, options: ['Direct', 'OTA', 'Walk-in', 'WhatsApp'] },
    ],
  },
  FINANCE_INSURANCE: {
    name: 'Finance & Insurance',
    description: 'Loan/policy leads, KYC documents, and renewals.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Document Collection', color: '#F59E0B', probability: 30 },
      { name: 'Underwriting', color: '#6366F1', probability: 60 },
      { name: 'Policy Issued', color: '#8B5CF6', probability: 90 },
      { name: 'Renewal Due', color: '#10B981', probability: 100 },
      { name: 'Renewed/Lapsed', color: '#EF4444', probability: 0 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Policy Type', fieldType: 'DROPDOWN', isRequired: false, options: ['Life', 'Health', 'Motor', 'Loan'] },
      { entityType: 'LEAD', fieldName: 'Sum Insured', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'KYC Status', fieldType: 'DROPDOWN', isRequired: false, options: ['Pending', 'Submitted', 'Verified'] },
      { entityType: 'LEAD', fieldName: 'Renewal Date', fieldType: 'DATE', isRequired: false },
    ],
  },
  AUTOMOTIVE: {
    name: 'Automotive Dealership',
    description: 'Vehicle inquiry, test drives, sales, and service cycles.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Test Drive', color: '#F59E0B', probability: 40 },
      { name: 'Quotation', color: '#6366F1', probability: 70 },
      { name: 'Sold', color: '#10B981', probability: 100 },
      { name: 'Service Due', color: '#8B5CF6', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Vehicle Model', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Exchange Vehicle', fieldType: 'DROPDOWN', isRequired: false, options: ['No', 'Yes'] },
      { entityType: 'LEAD', fieldName: 'Budget', fieldType: 'NUMBER', isRequired: false },
    ],
  },
  LEGAL: {
    name: 'Legal & Law Firms',
    description: 'Case management, hearing dates, and legal client tracking.',
    modules: ['SALES_PIPELINE', 'SUPPORT_TICKETS', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Consultation', color: '#3B82F6', probability: 10 },
      { name: 'Case Filed', color: '#F59E0B', probability: 40 },
      { name: 'In Progress', color: '#6366F1', probability: 70 },
      { name: 'Hearing Scheduled', color: '#8B5CF6', probability: 90 },
      { name: 'Closed', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Case Type', fieldType: 'DROPDOWN', isRequired: false, options: ['Civil', 'Criminal', 'Corporate', 'Family', 'Property'] },
      { entityType: 'LEAD', fieldName: 'Court', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Next Hearing Date', fieldType: 'DATE', isRequired: false },
    ],
  },
  FITNESS_WELLNESS: {
    name: 'Fitness & Wellness',
    description: 'Gyms, salons, and spas — membership and trainer booking.',
    modules: ['SALES_PIPELINE', 'SUPPORT_TICKETS', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Trial', color: '#F59E0B', probability: 40 },
      { name: 'Membership Sold', color: '#10B981', probability: 100 },
      { name: 'Active', color: '#6366F1', probability: 100 },
      { name: 'Renewal', color: '#8B5CF6', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Membership Plan', fieldType: 'DROPDOWN', isRequired: false, options: ['Monthly', 'Quarterly', 'Annual'] },
      { entityType: 'LEAD', fieldName: 'Trainer Assigned', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Expiry Date', fieldType: 'DATE', isRequired: false },
    ],
  },
  EVENTS: {
    name: 'Events & Wedding Planning',
    description: 'Event bookings, vendor coordination, and budgets.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Proposal', color: '#F59E0B', probability: 30 },
      { name: 'Advance Paid', color: '#6366F1', probability: 60 },
      { name: 'Confirmed', color: '#8B5CF6', probability: 90 },
      { name: 'Event Done', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Event Date', fieldType: 'DATE', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Vendor List', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Budget', fieldType: 'NUMBER', isRequired: false },
    ],
  },
  RESTAURANT: {
    name: 'Restaurants & Catering',
    description: 'Table bookings, catering pipelines, and loyalty management.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Reservation Booked', color: '#F59E0B', probability: 40 },
      { name: 'Order Confirmed', color: '#6366F1', probability: 70 },
      { name: 'Completed', color: '#10B981', probability: 100 },
      { name: 'Repeat', color: '#8B5CF6', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Reservation Date', fieldType: 'DATE', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Table Number', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Event Type', fieldType: 'DROPDOWN', isRequired: false, options: ['Dine-in', 'Catering', 'Private Party'] },
    ],
  },
  LOGISTICS: {
    name: 'Logistics & Transport',
    description: 'Shipments, transport bookings, and B2B pricing.',
    modules: ['SALES_PIPELINE', 'BILLING_INVOICES'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Quote Sent', color: '#F59E0B', probability: 40 },
      { name: 'Contract Signed', color: '#6366F1', probability: 70 },
      { name: 'In Transit', color: '#8B5CF6', probability: 90 },
      { name: 'Delivered', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Cargo Type', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Vehicle Required', fieldType: 'DROPDOWN', isRequired: false, options: ['Mini Truck', 'Full Truck', 'Container'] },
      { entityType: 'LEAD', fieldName: 'Source Location', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Destination', fieldType: 'TEXT', isRequired: false },
    ],
  },
  COWORKING: {
    name: 'Coworking & Commercial Rental',
    description: 'Office bookings, lease pipelines, and workspace tracking.',
    modules: ['PROPERTY_MANAGEMENT', 'SALES_PIPELINE', 'BILLING_INVOICES'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Tour Scheduled', color: '#F59E0B', probability: 40 },
      { name: 'Proposal Sent', color: '#6366F1', probability: 70 },
      { name: 'Lease Signed', color: '#8B5CF6', probability: 90 },
      { name: 'Active', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Desk Type', fieldType: 'DROPDOWN', isRequired: false, options: ['Hot Desk', 'Dedicated Desk', 'Private Office'] },
      { entityType: 'LEAD', fieldName: 'Seat Count', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Move-in Date', fieldType: 'DATE', isRequired: false },
    ],
  },
  IT_SERVICES: {
    name: 'IT Services & Agencies',
    description: 'Project-based client pipeline and retainer tracking.',
    modules: ['SALES_PIPELINE', 'SUPPORT_TICKETS', 'CAMPAIGN_MANAGER'],
    pipelineStages: [
      { name: 'Inquiry', color: '#3B82F6', probability: 10 },
      { name: 'Discovery Call', color: '#F59E0B', probability: 30 },
      { name: 'Proposal', color: '#6366F1', probability: 60 },
      { name: 'Contract', color: '#8B5CF6', probability: 90 },
      { name: 'Onboarded', color: '#10B981', probability: 100 },
    ],
    customFields: [
      { entityType: 'LEAD', fieldName: 'Project Budget', fieldType: 'NUMBER', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Project Timeline', fieldType: 'TEXT', isRequired: false },
      { entityType: 'LEAD', fieldName: 'Tech Stack', fieldType: 'TEXT', isRequired: false },
    ],
  },
}
