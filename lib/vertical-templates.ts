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
}
