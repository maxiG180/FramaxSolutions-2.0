-- Fix RLS policies to allow inserting folders with client_id
-- The existing "Users can create their own folders" policy might be blocking client_id

-- Drop and recreate the INSERT policy to ensure it allows client_id
DROP POLICY IF EXISTS "Users can create their own folders" ON public.folders;

CREATE POLICY "Users can create their own folders"
  ON public.folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verify the column exists and show its type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'folders'
    AND column_name = 'client_id'
  ) THEN
    RAISE NOTICE 'client_id column exists in folders table';
  ELSE
    RAISE NOTICE 'WARNING: client_id column does NOT exist in folders table!';
  END IF;
END $$;
