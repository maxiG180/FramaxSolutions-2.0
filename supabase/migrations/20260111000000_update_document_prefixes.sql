-- Update quote numbers from QTE- to ORC-
UPDATE quotes
SET quote_number = REPLACE(quote_number, 'QTE-', 'ORC-')
WHERE quote_number LIKE 'QTE-%';

-- Update invoice numbers from INV- to FAT-
UPDATE invoices
SET invoice_number = REPLACE(invoice_number, 'INV-', 'FAT-')
WHERE invoice_number LIKE 'INV-%';
