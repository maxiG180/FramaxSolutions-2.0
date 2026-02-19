-- Add payment and banking fields to invoices table

-- Payment information fields
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('transfer', 'multibanco', 'mbway', 'cash', 'check', 'card', 'other')),
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Banking information fields (for displaying on invoice PDF)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS swift_bic TEXT;

-- Add index for payment_date for better query performance
CREATE INDEX IF NOT EXISTS invoices_payment_date_idx ON invoices(payment_date);

-- Add comment for documentation
COMMENT ON COLUMN invoices.payment_method IS 'Payment method: transfer, multibanco, mbway, cash, check, card, other';
COMMENT ON COLUMN invoices.payment_date IS 'Date when payment was received (set when status changes to paid)';
COMMENT ON COLUMN invoices.payment_reference IS 'Payment reference number (e.g., Multibanco reference, transaction ID)';
COMMENT ON COLUMN invoices.payment_notes IS 'Additional notes about the payment';
COMMENT ON COLUMN invoices.bank_name IS 'Bank name for transfer payments';
COMMENT ON COLUMN invoices.iban IS 'IBAN for bank transfers';
COMMENT ON COLUMN invoices.swift_bic IS 'SWIFT/BIC code for international transfers';
