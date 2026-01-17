-- Add client_id column to folders table to link folders to clients
ALTER TABLE folders
ADD COLUMN IF NOT EXISTS client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_folders_client_id ON folders(client_id);

-- Add comment to document the column
COMMENT ON COLUMN folders.client_id IS 'Links a folder to a specific client. When set, the folder represents client-specific documents.';
