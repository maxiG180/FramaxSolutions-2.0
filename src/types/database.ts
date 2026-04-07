/**
 * Database Types
 *
 * TypeScript types matching the refactored Supabase schema.
 * All IDs are now UUID (not bigint).
 */

// ===================================================================
// PROFILES (Agency Team Members)
// ===================================================================

export interface Profile {
  id: string; // uuid (references auth.users)
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'Admin' | 'Member';
  created_at: string;
  updated_at: string | null;
  job_title: string | null;
}

// ===================================================================
// CLIENTS
// ===================================================================

export interface Client {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: 'Active' | 'Inactive';
  notes: string | null;
  nif: string | null;
  contact_person: string | null;
  logo: string | null;
  preferred_language: 'en' | 'pt' | null;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: 'Active' | 'Inactive';
  notes?: string;
  nif?: string;
  contact_person?: string;
  logo?: string;
  preferred_language?: 'en' | 'pt';
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

// ===================================================================
// CHATBOT LEADS (Landing Page Form Submissions)
// ===================================================================

export interface ChatbotLead {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  potential_value: number | null;
  currency: string;
  notes: string | null;
  next_follow_up: string | null;
}

// ===================================================================
// PROSPECTS (B2B Prospecting / Outreach)
// ===================================================================

export type BusinessCategory = 'dental' | 'beauty' | 'restaurant' | 'gym' | 'vet' | 'other';
export type WebsiteStatus = 'has_website' | 'outdated_website' | 'no_website';
export type OutreachStatus = 'not_contacted' | 'contacted' | 'replied' | 'meeting_scheduled' | 'converted' | 'rejected';
export type OutreachChannel = 'email' | 'phone' | 'in_person' | 'social';

export interface Prospect {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  business_category: BusinessCategory | null;
  website_status: WebsiteStatus | null;
  outreach_status: OutreachStatus;
  outreach_channel: OutreachChannel | null;
  contacted_at: string | null;
  last_followup_at: string | null;
  next_followup_at: string | null; // date
  converted_to_client_id: string | null; // uuid FK → clients
  converted_at: string | null;
  source: string;
  notes: string | null;
  spec_website_url: string | null; // Speculative landing page URL built for this prospect
}

export interface CreateProspectData {
  company_name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  business_category?: BusinessCategory;
  website_status?: WebsiteStatus;
  outreach_status?: OutreachStatus;
  outreach_channel?: OutreachChannel;
  contacted_at?: string;
  last_followup_at?: string;
  next_followup_at?: string;
  source?: string;
  notes?: string;
  spec_website_url?: string;
}

export interface UpdateProspectData extends Partial<CreateProspectData> {
  id: string;
}

// ===================================================================
// PROJECTS
// ===================================================================

export interface Project {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  client_id: string; // uuid FK → clients
  title: string;
  description: string | null;
  status: string;
  payment_type: 'One-Time' | 'Recurring';
  value: number;
  currency: string;
  payment_status: string;
  start_date: string | null; // date
  deadline: string | null; // date
  renewal_date: string | null; // date
  parent_project_id: string | null; // uuid self-FK
  quote_id: string | null; // uuid FK → quotes
}

export interface CreateProjectData {
  client_id: string;
  title: string;
  description?: string;
  status?: string;
  payment_type?: 'One-Time' | 'Recurring';
  value?: number;
  currency?: string;
  payment_status?: string;
  start_date?: string;
  deadline?: string;
  renewal_date?: string;
  parent_project_id?: string;
  quote_id?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

// ===================================================================
// TASKS
// ===================================================================

export interface Task {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  project_id: string | null; // uuid FK → projects
  title: string;
  description: string | null;
  status: string;
  assignee: string | null; // uuid FK → profiles
  priority: string;
  due_date: string | null; // date
}

export interface CreateTaskData {
  title: string;
  project_id?: string;
  description?: string;
  status?: string;
  assignee?: string;
  priority?: string;
  due_date?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

// ===================================================================
// NOTES
// ===================================================================

export interface Note {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  title: string;
  content: string | null;
  client_id: string | null; // uuid FK → clients
  project_id: string | null; // uuid FK → projects
  chatbot_lead_id: string | null; // uuid FK → chatbot_leads
  tags: string[] | null;
  created_by: string | null; // uuid FK → profiles
}

export interface CreateNoteData {
  title: string;
  content?: string;
  client_id?: string;
  project_id?: string;
  chatbot_lead_id?: string;
  tags?: string[];
  created_by?: string;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: string;
}

// ===================================================================
// EVENTS
// ===================================================================

export interface Event {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  start_time: string; // timestamptz
  end_time: string; // timestamptz
  is_all_day: boolean;
  location: string | null;
  client_id: string | null; // uuid FK → clients
  project_id: string | null; // uuid FK → projects
  chatbot_lead_id: string | null; // uuid FK → chatbot_leads
  created_by: string | null; // uuid FK → profiles
}

export interface CreateEventData {
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  is_all_day?: boolean;
  location?: string;
  client_id?: string;
  project_id?: string;
  chatbot_lead_id?: string;
  created_by?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

// ===================================================================
// DOCUMENTS
// ===================================================================

export interface Document {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  project_id: string; // uuid FK → projects
  name: string;
  type: string | null;
  size: number | null;
  url: string;
  uploaded_by: string | null; // uuid FK → profiles
}

export interface CreateDocumentData {
  project_id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploaded_by?: string;
}

// ===================================================================
// SERVICES
// ===================================================================

export type BillingType = 'One-Time' | 'Recurring';
export type PriceType = 'Fixed' | 'Starting From' | 'Custom Quote';
export type RecurringInterval = 'Monthly' | 'Quarterly' | 'Yearly';

export interface Service {
  id: string; // uuid
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  billing_type: BillingType;
  price_type: PriceType;
  base_price: number | null;
  recurring_interval: RecurringInterval | null;
  currency: string;
  user_id: string; // uuid FK → profiles
  category: string | null;
  icon: string | null;
  included_services?: Service[] | null; // Populated via JOIN with service_inclusions
}

export interface CreateServiceData {
  title: string;
  billing_type: BillingType;
  price_type: PriceType;
  description?: string;
  base_price?: number | null;
  recurring_interval?: RecurringInterval | null;
  currency?: string;
  category?: string;
  icon?: string;
  included_service_ids?: string[]; // IDs to insert into service_inclusions
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: string;
}

// ===================================================================
// SERVICE INCLUSIONS (N:M relationship)
// ===================================================================

export type InclusionType = 'bundled' | 'optional';

export interface ServiceInclusion {
  id: string; // uuid
  parent_service_id: string; // uuid FK → services
  included_service_id: string; // uuid FK → services
  inclusion_type: InclusionType;
  created_at: string;
}

// ===================================================================
// QUOTES
// ===================================================================

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';

export interface Quote {
  id: string; // uuid
  user_id: string; // uuid FK → auth.users
  quote_number: string; // UNIQUE (e.g., "ORC-0001")
  client_id: string | null; // uuid FK → clients
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_contact: string | null;
  client_address: string | null;
  client_nif: string | null;
  quote_date: string; // date
  expiry_date: string | null; // date
  items: any; // jsonb - kept for backward compatibility
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string; // DEFAULT 'EUR'
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteData {
  quote_number: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_contact?: string;
  client_address?: string;
  client_nif?: string;
  quote_date: string;
  expiry_date?: string;
  items: any; // TODO: migrar para quote_items
  subtotal: number;
  tax_rate?: number;
  tax_amount: number;
  total: number;
  currency?: string;
  notes?: string;
  status?: QuoteStatus;
}

export interface UpdateQuoteData extends Partial<CreateQuoteData> {
  id: string;
}

// ===================================================================
// QUOTE ITEMS (Normalized)
// ===================================================================

export interface QuoteItem {
  id: string; // uuid
  quote_id: string; // uuid FK → quotes
  service_id: string | null; // uuid FK → services
  description: string;
  quantity: number;
  unit_price: number;
  total: number; // GENERATED COLUMN
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteItemData {
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
}

export interface UpdateQuoteItemData extends Partial<Omit<CreateQuoteItemData, 'quote_id'>> {
  id: string;
}

// ===================================================================
// INVOICES
// ===================================================================

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string; // uuid
  user_id: string; // uuid FK → auth.users
  invoice_number: string; // UNIQUE (e.g., "FAT-0001")
  quote_id: string | null; // uuid FK → quotes
  client_id: string | null; // uuid FK → clients
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_contact: string | null;
  client_address: string | null;
  client_nif: string | null;
  invoice_date: string; // date
  due_date: string | null; // date
  items: any; // jsonb - kept for backward compatibility
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string; // DEFAULT 'EUR'
  notes: string | null;
  status: InvoiceStatus;
  payment_method: string | null;
  bank_account: string | null;
  swift_bic: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceData {
  invoice_number: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_contact?: string;
  client_address?: string;
  client_nif?: string;
  invoice_date: string;
  due_date?: string;
  items: any; // TODO: migrar para invoice_items
  subtotal: number;
  tax_rate?: number;
  tax_amount: number;
  total: number;
  currency?: string;
  notes?: string;
  status?: InvoiceStatus;
  quote_id?: string;
  payment_method?: string;
  bank_account?: string;
  swift_bic?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  id: string;
}

// ===================================================================
// INVOICE ITEMS (Normalized)
// ===================================================================

export interface InvoiceItem {
  id: string; // uuid
  invoice_id: string; // uuid FK → invoices
  service_id: string | null; // uuid FK → services
  description: string;
  quantity: number;
  unit_price: number;
  total: number; // GENERATED COLUMN
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceItemData {
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
}

export interface UpdateInvoiceItemData extends Partial<Omit<CreateInvoiceItemData, 'invoice_id'>> {
  id: string;
}

// ===================================================================
// PAYMENTS
// ===================================================================

export type PaymentStatus = 'active' | 'pending' | 'overdue' | 'cancelled' | 'completed';
export type BillingFrequency = 'monthly' | 'quarterly' | 'yearly' | 'one-time';

export interface Payment {
  id: string; // bigint (not migrated to uuid yet in payments table)
  user_id: string; // uuid FK → auth.users
  client_id: string | null; // uuid FK → clients
  client_name: string;
  service_name: string;
  service_type: 'Monthly' | 'One Time';
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  billing_frequency: BillingFrequency;
  start_date: string; // date
  next_payment_date: string | null; // date
  last_payment_date: string | null; // date
  end_date: string | null; // date
  notes: string | null;
  metadata: any; // jsonb
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentData {
  client_id?: string;
  client_name: string;
  service_name: string;
  service_type: 'Monthly' | 'One Time';
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  payment_method?: string;
  billing_frequency?: BillingFrequency;
  start_date: string;
  next_payment_date?: string;
  last_payment_date?: string;
  end_date?: string;
  notes?: string;
  metadata?: any;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {
  id: string;
}

// ===================================================================
// PAYMENT TRANSACTIONS
// ===================================================================

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentTransaction {
  id: string; // bigint
  payment_id: string; // bigint FK → payments
  user_id: string; // uuid FK → auth.users
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: string | null;
  transaction_date: string; // date
  due_date: string | null; // date
  paid_date: string | null; // date
  notes: string | null;
  metadata: any; // jsonb
  created_at: string;
  updated_at: string;
}

// ===================================================================
// QR CODES
// ===================================================================

export interface QRCode {
  id: string; // uuid
  created_at: string;
  slug: string; // UNIQUE
  target_url: string;
  user_id: string; // uuid FK → profiles
  scans_count: number;
  name: string | null;
}

export interface CreateQRCodeData {
  slug: string;
  target_url: string;
  name?: string;
}

export interface UpdateQRCodeData {
  id: string;
  slug?: string;
  target_url?: string;
  name?: string;
}

// ===================================================================
// QR SCANS
// ===================================================================

export interface QRScan {
  id: string; // uuid
  scanned_at: string;
  user_agent: string | null;
  referrer: string | null;
  qr_code_id: string | null; // uuid FK → qr_codes
}

// ===================================================================
// AUDIT LOGS
// ===================================================================

export interface AuditLog {
  id: string; // uuid
  created_at: string;
  table_name: string;
  record_id: string; // text (was bigint, now supports uuid as string)
  action: string;
  old_data: any; // jsonb
  new_data: any; // jsonb
  changed_by: string | null; // uuid FK → profiles
}
