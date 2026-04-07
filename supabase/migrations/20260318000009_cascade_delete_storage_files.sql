-- Cascade delete storage files when file records are deleted
-- This ensures that when a file entry is deleted from the database,
-- the actual file in Supabase Storage is also removed

-- Function to delete the physical file from storage
CREATE OR REPLACE FUNCTION delete_storage_file()
RETURNS trigger AS $$
DECLARE
  bucket_name text;
  file_path text;
BEGIN
  -- Extract bucket and path from storage_path
  -- Format is usually "bucket-name/path/to/file.ext"

  -- Parse storage_path to get bucket and file path
  IF OLD.storage_path IS NOT NULL AND OLD.storage_path != '' THEN
    -- Check if path starts with a bucket name
    IF OLD.storage_path LIKE 'client-logos/%' THEN
      bucket_name := 'client-logos';
      file_path := substring(OLD.storage_path from 'client-logos/(.+)');
    ELSIF OLD.storage_path LIKE 'client-files/%' THEN
      bucket_name := 'client-files';
      file_path := substring(OLD.storage_path from 'client-files/(.+)');
    ELSE
      -- Try to split by first slash
      bucket_name := split_part(OLD.storage_path, '/', 1);
      file_path := substring(OLD.storage_path from position('/' in OLD.storage_path) + 1);
    END IF;

    -- Delete from storage
    BEGIN
      PERFORM storage.delete(bucket_name, file_path);
      RAISE NOTICE '🗑️ Deleted storage file: % from bucket: %', file_path, bucket_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '⚠️ Could not delete storage file % from %: %', file_path, bucket_name, SQLERRM;
      -- Don't fail the trigger if storage deletion fails
    END;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on files table
DROP TRIGGER IF EXISTS on_file_delete ON files;
CREATE TRIGGER on_file_delete
  BEFORE DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION delete_storage_file();

-- Add comment for documentation
COMMENT ON FUNCTION delete_storage_file() IS
  'Automatically deletes physical files from Supabase Storage when file records are deleted. '
  'Supports client-logos and client-files buckets. Does not fail if storage deletion fails.';

COMMENT ON TRIGGER on_file_delete ON files IS
  'Cascade delete: removes physical file from storage when database record is deleted';
