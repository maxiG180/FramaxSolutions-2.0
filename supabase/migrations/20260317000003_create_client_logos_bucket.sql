-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to view logos
CREATE POLICY "Public Access to Client Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'client-logos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update logos
CREATE POLICY "Authenticated users can update client logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'client-logos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete client logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'client-logos'
  AND auth.role() = 'authenticated'
);
