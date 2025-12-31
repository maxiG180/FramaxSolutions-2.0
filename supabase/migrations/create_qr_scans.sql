-- QR Code Scans Tracking Table
CREATE TABLE qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Enable Row Level Security
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (tracking scans)
CREATE POLICY "Allow public insert" ON qr_scans
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Allow authenticated read" ON qr_scans
  FOR SELECT
  TO authenticated
  USING (true);
