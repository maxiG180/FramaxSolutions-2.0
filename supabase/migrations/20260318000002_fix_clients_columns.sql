-- Fix clients table columns to match code expectations
-- The code uses 'logo' but migration created 'logo_url', rename it
-- Also add missing columns: address and preferred_language

-- Rename logo_url to logo if logo_url exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'clients'
        AND column_name = 'logo_url'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'clients'
        AND column_name = 'logo'
    ) THEN
        ALTER TABLE public.clients RENAME COLUMN logo_url TO logo;
    END IF;
END $$;

-- Add logo column if it doesn't exist (in case logo_url didn't exist either)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo TEXT;

-- Add missing address column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Add missing preferred_language column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS preferred_language TEXT CHECK (preferred_language IN ('pt', 'en')) DEFAULT 'pt';
