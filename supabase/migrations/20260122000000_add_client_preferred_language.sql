-- Add preferred_language to clients table
-- This allows storing the client's preferred language for emails and communications

-- Add the column with default 'pt' (Portuguese)
ALTER TABLE public.clients
ADD COLUMN preferred_language text DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'en'));

-- Update existing clients to have 'pt' as default (if not already set)
UPDATE public.clients
SET preferred_language = 'pt'
WHERE preferred_language IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.clients.preferred_language IS 'Client preferred language for communications: pt (Portuguese) or en (English)';
