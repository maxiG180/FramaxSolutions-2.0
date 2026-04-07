-- Fix files.folder_id to CASCADE delete instead of SET NULL
-- When a folder is deleted, its files should also be deleted, not orphaned

-- Drop the existing foreign key constraint
ALTER TABLE public.files
  DROP CONSTRAINT IF EXISTS files_folder_id_fkey;

-- Recreate with CASCADE delete
ALTER TABLE public.files
  ADD CONSTRAINT files_folder_id_fkey
  FOREIGN KEY (folder_id)
  REFERENCES public.folders(id)
  ON DELETE CASCADE;  -- Changed from SET NULL to CASCADE

-- Verify the change
DO $$
BEGIN
  RAISE NOTICE '✅ files.folder_id now has ON DELETE CASCADE';
END $$;
