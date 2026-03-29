-- Ensure projects table has the correct columns
-- Add title column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN title TEXT NOT NULL DEFAULT 'Projeto Sem Título';
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN description TEXT;
    END IF;
END $$;
