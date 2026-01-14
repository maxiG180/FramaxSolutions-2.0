-- Change default currency from USD to EUR for quotes and invoices tables

-- Update default for quotes table
ALTER TABLE quotes
ALTER COLUMN currency SET DEFAULT 'EUR';

-- Update default for invoices table
ALTER TABLE invoices
ALTER COLUMN currency SET DEFAULT 'EUR';

-- Update existing records that have USD to EUR (optional - only if you want to update existing data)
-- UPDATE quotes SET currency = 'EUR' WHERE currency = 'USD';
-- UPDATE invoices SET currency = 'EUR' WHERE currency = 'USD';
