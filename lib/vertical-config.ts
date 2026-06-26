/**
 * Vertical UI Configuration
 * Maps vertical keys to UI-specific labels so the CRM adapts its language
 * (entity names, status labels, KPI card titles) to the tenant's industry.
 */

export interface VerticalUIConfig {
  entityName: string
  entityNamePlural: string
  dashboardTitle: string
  dashboardSubtitle: string
  kpiLabels: {
    primary: string
    secondary: string
    tertiary: string
    quaternary: string
  }
  statusLabels: Record<string, string>
  pipelineName: string
}

export const VERTICAL_UI: Record<string, VerticalUIConfig> = {
  GENERAL: {
    entityName: 'Lead', entityNamePlural: 'Leads',
    dashboardTitle: 'Sales Dashboard', dashboardSubtitle: 'B2B/B2C sales performance overview',
    kpiLabels: { primary: 'Total Leads', secondary: 'Pipeline Value', tertiary: 'Win Rate', quaternary: 'Open Tickets' },
    statusLabels: { NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', PROPOSAL_SENT: 'Proposal Sent', NEGOTIATION: 'Negotiation', CONVERTED: 'Converted', LOST: 'Lost', JUNK: 'Junk' },
    pipelineName: 'Sales Pipeline',
  },
  SALES_AGENCY: {
    entityName: 'Lead', entityNamePlural: 'Leads',
    dashboardTitle: 'Agency Sales Dashboard', dashboardSubtitle: 'Lead pipeline and conversion overview',
    kpiLabels: { primary: 'Total Leads', secondary: 'Pipeline Value', tertiary: 'Conversion Rate', quaternary: 'Open Tickets' },
    statusLabels: { NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', PROPOSAL_SENT: 'Proposal Sent', NEGOTIATION: 'Negotiation', CONVERTED: 'Converted', LOST: 'Lost', JUNK: 'Junk' },
    pipelineName: 'Sales Pipeline',
  },
  REAL_ESTATE: {
    entityName: 'Property Lead', entityNamePlural: 'Property Leads',
    dashboardTitle: 'Property Pipeline', dashboardSubtitle: 'Site visits, negotiations & closures at a glance',
    kpiLabels: { primary: 'Property Inquiries', secondary: 'Pipeline Value', tertiary: 'Conversion Rate', quaternary: 'Site Visits' },
    statusLabels: { NEW: 'New Enquiry', CONTACTED: 'Site Visit Scheduled', QUALIFIED: 'Negotiation', PROPOSAL_SENT: 'Agreement', NEGOTIATION: 'Closing', CONVERTED: 'Registered', LOST: 'Lost', JUNK: 'Junk' },
    pipelineName: 'Property Pipeline',
  },
  HEALTHCARE: {
    entityName: 'Patient', entityNamePlural: 'Patients',
    dashboardTitle: 'Patient Management', dashboardSubtitle: 'Appointments, follow-ups & treatment overview',
    kpiLabels: { primary: 'Total Patients', secondary: 'Monthly Revenue', tertiary: 'Treatment Rate', quaternary: 'Follow-ups Due' },
    statusLabels: { NEW: 'New Patient', CONTACTED: 'Appointment Booked', QUALIFIED: 'Consulted', PROPOSAL_SENT: 'Treatment Ongoing', NEGOTIATION: 'Follow-up Due', CONVERTED: 'Discharged', LOST: 'Dropped', JUNK: 'Invalid' },
    pipelineName: 'Patient Pipeline',
  },
  EDUCATION: {
    entityName: 'Applicant', entityNamePlural: 'Applicants',
    dashboardTitle: 'Admissions Dashboard', dashboardSubtitle: 'Admissions, enrollments & course tracking',
    kpiLabels: { primary: 'Total Applicants', secondary: 'Fee Revenue', tertiary: 'Enrollment Rate', quaternary: 'Pending Counselling' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Counselling Done', QUALIFIED: 'Applied', PROPOSAL_SENT: 'Documents Submitted', NEGOTIATION: 'Fee Paid', CONVERTED: 'Enrolled', LOST: 'Dropped', JUNK: 'Invalid' },
    pipelineName: 'Admissions Pipeline',
  },
  DISTANCE_EDUCATION: {
    entityName: 'Applicant', entityNamePlural: 'Applicants',
    dashboardTitle: 'LSC Admissions Dashboard', dashboardSubtitle: 'Distance education admissions & enrollment tracking',
    kpiLabels: { primary: 'Total Applicants', secondary: 'Fee Revenue', tertiary: 'Admission Rate', quaternary: 'Pending Documents' },
    statusLabels: { NEW: 'To be Enrol LSC', CONTACTED: 'Counselling', QUALIFIED: 'Applied', PROPOSAL_SENT: 'Documents Verifying', NEGOTIATION: 'Fees Paid', CONVERTED: 'Admitted', LOST: 'Lost', JUNK: 'Junk' },
    pipelineName: 'LSC Admissions Pipeline',
  },
  ECOMMERCE: {
    entityName: 'Customer', entityNamePlural: 'Customers',
    dashboardTitle: 'eCommerce Dashboard', dashboardSubtitle: 'Customer lifetime value & order pipeline overview',
    kpiLabels: { primary: 'Total Customers', secondary: 'Monthly Revenue', tertiary: 'Repeat Rate', quaternary: 'Support Tickets' },
    statusLabels: { NEW: 'New', CONTACTED: 'First Purchase', QUALIFIED: 'Repeat Customer', PROPOSAL_SENT: 'VIP', NEGOTIATION: 'Cart Abandoned', CONVERTED: 'Loyal Customer', LOST: 'Churned', JUNK: 'Invalid' },
    pipelineName: 'Customer Pipeline',
  },
  HOSPITALITY: {
    entityName: 'Guest', entityNamePlural: 'Guests',
    dashboardTitle: 'Hospitality Dashboard', dashboardSubtitle: 'Bookings, occupancy & guest management overview',
    kpiLabels: { primary: 'Total Bookings', secondary: 'Booking Revenue', tertiary: 'Occupancy Rate', quaternary: 'Check-ins This Week' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Booking Confirmed', QUALIFIED: 'Advance Paid', PROPOSAL_SENT: 'Checked In', NEGOTIATION: 'Checked Out', CONVERTED: 'Repeat Guest', LOST: 'Cancelled', JUNK: 'Invalid' },
    pipelineName: 'Booking Pipeline',
  },
  FINANCE_INSURANCE: {
    entityName: 'Policy Lead', entityNamePlural: 'Policy Leads',
    dashboardTitle: 'Finance & Insurance Dashboard', dashboardSubtitle: 'Policy leads, KYC, renewals & premium overview',
    kpiLabels: { primary: 'Total Policy Leads', secondary: 'Premium Collected', tertiary: 'Issuance Rate', quaternary: 'Renewals Due' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Document Collection', QUALIFIED: 'Underwriting', PROPOSAL_SENT: 'Policy Issued', NEGOTIATION: 'Renewal Due', CONVERTED: 'Renewed', LOST: 'Lapsed', JUNK: 'Invalid' },
    pipelineName: 'Policy Pipeline',
  },
  AUTOMOTIVE: {
    entityName: 'Vehicle Inquiry', entityNamePlural: 'Vehicle Inquiries',
    dashboardTitle: 'Dealership Dashboard', dashboardSubtitle: 'Inquiries, test drives, sales & service overview',
    kpiLabels: { primary: 'Total Inquiries', secondary: 'Sales Revenue', tertiary: 'Conversion Rate', quaternary: 'Test Drives' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Test Drive', QUALIFIED: 'Quotation', PROPOSAL_SENT: 'Negotiation', NEGOTIATION: 'Closing', CONVERTED: 'Sold', LOST: 'Lost', JUNK: 'Invalid' },
    pipelineName: 'Vehicle Sales Pipeline',
  },
  LEGAL: {
    entityName: 'Case', entityNamePlural: 'Cases',
    dashboardTitle: 'Case Management', dashboardSubtitle: 'Active cases, hearings & client management overview',
    kpiLabels: { primary: 'Total Cases', secondary: 'Fees Billed', tertiary: 'Case Win Rate', quaternary: 'Upcoming Hearings' },
    statusLabels: { NEW: 'Consultation', CONTACTED: 'Case Filed', QUALIFIED: 'In Progress', PROPOSAL_SENT: 'Hearing Scheduled', NEGOTIATION: 'Awaiting Judgment', CONVERTED: 'Closed — Won', LOST: 'Closed — Lost', JUNK: 'Invalid' },
    pipelineName: 'Case Pipeline',
  },
  FITNESS_WELLNESS: {
    entityName: 'Member', entityNamePlural: 'Members',
    dashboardTitle: 'Membership Dashboard', dashboardSubtitle: 'Active memberships, renewals & trainer bookings',
    kpiLabels: { primary: 'Total Members', secondary: 'Monthly Revenue', tertiary: 'Retention Rate', quaternary: 'Expiring This Week' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Trial', QUALIFIED: 'Membership Sold', PROPOSAL_SENT: 'Active', NEGOTIATION: 'Renewal Due', CONVERTED: 'Renewed', LOST: 'Lapsed', JUNK: 'Invalid' },
    pipelineName: 'Membership Pipeline',
  },
  EVENTS: {
    entityName: 'Booking', entityNamePlural: 'Bookings',
    dashboardTitle: 'Events Dashboard', dashboardSubtitle: 'Event bookings, vendor coordination & budget overview',
    kpiLabels: { primary: 'Total Bookings', secondary: 'Booking Value', tertiary: 'Confirmed Rate', quaternary: 'Upcoming Events' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Proposal Sent', QUALIFIED: 'Advance Paid', PROPOSAL_SENT: 'Confirmed', NEGOTIATION: 'In Progress', CONVERTED: 'Event Completed', LOST: 'Cancelled', JUNK: 'Invalid' },
    pipelineName: 'Events Pipeline',
  },
  RESTAURANT: {
    entityName: 'Reservation', entityNamePlural: 'Reservations',
    dashboardTitle: 'Restaurant Dashboard', dashboardSubtitle: 'Table bookings, catering orders & customer loyalty',
    kpiLabels: { primary: 'Total Reservations', secondary: 'Monthly Revenue', tertiary: 'Repeat Rate', quaternary: "Today's Reservations" },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Reservation Booked', QUALIFIED: 'Order Confirmed', PROPOSAL_SENT: 'Served', NEGOTIATION: 'Follow-up', CONVERTED: 'Repeat Customer', LOST: 'No Show', JUNK: 'Invalid' },
    pipelineName: 'Reservation Pipeline',
  },
  LOGISTICS: {
    entityName: 'Shipment Lead', entityNamePlural: 'Shipment Leads',
    dashboardTitle: 'Logistics Dashboard', dashboardSubtitle: 'Shipments, contracts & delivery tracking overview',
    kpiLabels: { primary: 'Total Leads', secondary: 'Contract Value', tertiary: 'Delivery Rate', quaternary: 'In Transit' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Quote Sent', QUALIFIED: 'Contract Signed', PROPOSAL_SENT: 'Pickup Scheduled', NEGOTIATION: 'In Transit', CONVERTED: 'Delivered', LOST: 'Lost', JUNK: 'Invalid' },
    pipelineName: 'Shipment Pipeline',
  },
  COWORKING: {
    entityName: 'Space Inquiry', entityNamePlural: 'Space Inquiries',
    dashboardTitle: 'Workspace Dashboard', dashboardSubtitle: 'Space inquiries, tours, leases & occupancy overview',
    kpiLabels: { primary: 'Total Inquiries', secondary: 'Lease Revenue', tertiary: 'Occupancy Rate', quaternary: 'Tours Scheduled' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Tour Scheduled', QUALIFIED: 'Proposal Sent', PROPOSAL_SENT: 'Lease Negotiation', NEGOTIATION: 'Pending Sign-off', CONVERTED: 'Lease Active', LOST: 'Lost', JUNK: 'Invalid' },
    pipelineName: 'Leasing Pipeline',
  },
  IT_SERVICES: {
    entityName: 'Project Lead', entityNamePlural: 'Project Leads',
    dashboardTitle: 'Agency Dashboard', dashboardSubtitle: 'Project pipeline, retainers & client overview',
    kpiLabels: { primary: 'Total Leads', secondary: 'Project Revenue', tertiary: 'Closure Rate', quaternary: 'Active Projects' },
    statusLabels: { NEW: 'Inquiry', CONTACTED: 'Discovery Call', QUALIFIED: 'Proposal Sent', PROPOSAL_SENT: 'Negotiation', NEGOTIATION: 'Contract Review', CONVERTED: 'Onboarded', LOST: 'Lost', JUNK: 'Invalid' },
    pipelineName: 'Project Pipeline',
  },
  TELECOM: {
    entityName: 'Subscriber Lead', entityNamePlural: 'Subscriber Leads',
    dashboardTitle: 'Telecom Dashboard', dashboardSubtitle: 'Subscriber acquisition, installation & support',
    kpiLabels: { primary: 'Total Leads', secondary: 'Monthly Revenue', tertiary: 'Activation Rate', quaternary: 'Open Tickets' },
    statusLabels: { NEW: 'New Enquiry', CONTACTED: 'Demo', QUALIFIED: 'Plan Selected', PROPOSAL_SENT: 'Installation', NEGOTIATION: 'Pending Activation', CONVERTED: 'Active', LOST: 'Lost', JUNK: 'Invalid' },
    pipelineName: 'Subscriber Pipeline',
  },
  FIELD_SERVICE: {
    entityName: 'Job', entityNamePlural: 'Jobs',
    dashboardTitle: 'Field Service Dashboard', dashboardSubtitle: 'Jobs, technicians & maintenance scheduling',
    kpiLabels: { primary: 'Total Jobs', secondary: 'Revenue Billed', tertiary: 'Completion Rate', quaternary: 'Open Jobs' },
    statusLabels: { NEW: 'Job Raised', CONTACTED: 'Assigned', QUALIFIED: 'In Progress', PROPOSAL_SENT: 'Completed', NEGOTIATION: 'Invoiced', CONVERTED: 'Paid', LOST: 'Cancelled', JUNK: 'Invalid' },
    pipelineName: 'Job Pipeline',
  },
}

export function getVerticalConfig(verticalKey?: string | null): VerticalUIConfig {
  return VERTICAL_UI[verticalKey || 'GENERAL'] || VERTICAL_UI.GENERAL
}
