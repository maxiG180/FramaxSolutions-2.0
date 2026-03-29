-- Add logo URL field to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo_url TEXT;
