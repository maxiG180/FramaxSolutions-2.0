-- Create client-files bucket for storing client-specific documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to their client folders
CREATE POLICY "Allow authenticated users to upload client files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-files');

-- Policy: Allow authenticated users to read files from client folders
CREATE POLICY "Allow authenticated users to read client files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-files');

-- Policy: Allow authenticated users to update files in client folders
CREATE POLICY "Allow authenticated users to update client files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-files');

-- Policy: Allow authenticated users to delete files from client folders
CREATE POLICY "Allow authenticated users to delete client files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-files');
