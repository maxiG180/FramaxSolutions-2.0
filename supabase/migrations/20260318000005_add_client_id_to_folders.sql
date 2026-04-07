-- Add client_id to folders table to link folders with clients
ALTER TABLE public.folders ADD COLUMN IF NOT EXISTS client_id bigint REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS folders_client_id_idx ON public.folders(client_id);
