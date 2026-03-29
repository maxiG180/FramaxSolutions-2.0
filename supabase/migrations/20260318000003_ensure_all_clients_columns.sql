-- Ensure ALL required columns exist in clients table
-- This migration adds any missing columns that the application code expects

-- Basic columns (should exist from original schema)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS id bigint;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes text;

-- Status column with constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'clients'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN status text CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active';
    END IF;
END $$;

-- Additional columns from migrations
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS nif text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS contact_person text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address text;

-- Preferred language with constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'clients'
        AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN preferred_language text CHECK (preferred_language IN ('pt', 'en')) DEFAULT 'pt';
    END IF;
END $$;

-- Drop logo_url column if it exists (we use 'logo' instead)
ALTER TABLE public.clients DROP COLUMN IF EXISTS logo_url;

-- Ensure name column is NOT NULL
DO $$
BEGIN
    ALTER TABLE public.clients ALTER COLUMN name SET NOT NULL;
EXCEPTION
    WHEN others THEN
        -- If there are NULL values, we can't set NOT NULL
        RAISE NOTICE 'Could not set name to NOT NULL - table may have NULL values';
END $$;
