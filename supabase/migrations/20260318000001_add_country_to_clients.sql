-- Add country field to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS country TEXT;
