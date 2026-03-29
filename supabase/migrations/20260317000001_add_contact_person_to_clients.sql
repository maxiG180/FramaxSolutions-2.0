-- Add contact_person field to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS contact_person TEXT;
