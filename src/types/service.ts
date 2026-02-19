/**
 * Billing type - How the client pays
 */
export type BillingType = 'One-Time' | 'Recurring';

/**
 * Price type - How pricing is structured
 */
export type PriceType = 'Fixed' | 'Starting From' | 'Custom Quote';

/**
 * Recurring interval - For recurring billing
 */
export type RecurringInterval = 'Monthly' | 'Quarterly' | 'Yearly';

/**
 * Service interface matching the Supabase services table
 */
export interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  billing_type: BillingType;
  price_type: PriceType;
  base_price: number | null;
  recurring_interval: RecurringInterval | null;
  currency: string;
  user_id: string;
  category?: string | null;
  icon?: string | null;
  included_services?: Service[] | null; // Services included in this package
}

/**
 * Data required to create a new service
 */
export interface CreateServiceData {
  title: string;
  description?: string;
  billing_type: BillingType;
  price_type: PriceType;
  base_price?: number | null;
  recurring_interval?: RecurringInterval | null;
  currency?: string;
  category?: string;
  icon?: string;
  included_service_ids?: string[]; // IDs of services to include in this package
}

/**
 * Data required to update an existing service
 */
export interface UpdateServiceData {
  id: string;
  title?: string;
  description?: string;
  billing_type?: BillingType;
  price_type?: PriceType;
  base_price?: number | null;
  recurring_interval?: RecurringInterval | null;
  currency?: string;
  category?: string;
  icon?: string;
  included_service_ids?: string[]; // IDs of services to include in this package
}
