-- Add language field to clients, quotes, and invoices tables

-- Add language field to clients table (main preference)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'en'));

-- Add language field to quotes table (can override client preference)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_language TEXT DEFAULT 'pt' CHECK (client_language IN ('pt', 'en'));

-- Add language field to invoices table (can override client preference)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_language TEXT DEFAULT 'pt' CHECK (client_language IN ('pt', 'en'));

-- Add comments to explain the fields
COMMENT ON COLUMN clients.preferred_language IS 'Client preferred language for email communications (pt=Portuguese, en=English). Used as default when creating new documents.';
COMMENT ON COLUMN quotes.client_language IS 'Language for this specific quote email (pt=Portuguese, en=English). Defaults to client preferred_language.';
COMMENT ON COLUMN invoices.client_language IS 'Language for this specific invoice email (pt=Portuguese, en=English). Defaults to client preferred_language.';
