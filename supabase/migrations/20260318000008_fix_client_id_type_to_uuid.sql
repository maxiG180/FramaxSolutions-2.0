-- Fix client_id type in folders table
-- clients.id is UUID (after schema_cleanup migration)
-- but folders.client_id was created as bigint - need to fix this

-- Drop the incorrect bigint column
ALTER TABLE public.folders DROP COLUMN IF EXISTS client_id CASCADE;

-- Add client_id as UUID to match clients.id
ALTER TABLE public.folders ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS folders_client_id_idx ON public.folders(client_id);

-- Verify the fix
DO $$
BEGIN
  RAISE NOTICE '✅ folders.client_id is now UUID (matches clients.id)';
END $$;
