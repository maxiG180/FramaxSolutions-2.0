-- ============================================
-- MIGRATION: Update Document Prefixes
-- Date: 2026-01-11
-- Description: Change QTE- to ORC- and INV- to FAT-
-- ============================================

-- Update quote numbers from QTE- to ORC-
UPDATE quotes
SET quote_number = REPLACE(quote_number, 'QTE-', 'ORC-')
WHERE quote_number LIKE 'QTE-%';

-- Update invoice numbers from INV- to FAT-
UPDATE invoices
SET invoice_number = REPLACE(invoice_number, 'INV-', 'FAT-')
WHERE invoice_number LIKE 'INV-%';

-- Show updated counts
SELECT
    'Quotes Updated' as operation,
    COUNT(*) as count
FROM quotes
WHERE quote_number LIKE 'ORC-%'
UNION ALL
SELECT
    'Invoices Updated' as operation,
    COUNT(*) as count
FROM invoices
WHERE invoice_number LIKE 'FAT-%';
