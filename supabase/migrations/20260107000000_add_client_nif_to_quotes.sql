-- Add client_nif column to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_nif TEXT;

-- Add client_nif column to invoices table as well for consistency
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_nif TEXT;
