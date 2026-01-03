-- Add name column to qr_codes table for user-friendly QR code names
alter table public.qr_codes
add column if not exists name text not null default 'Unnamed QR Code';

-- Remove default after adding the column (for future inserts, name should be required)
alter table public.qr_codes
alter column name drop default;
