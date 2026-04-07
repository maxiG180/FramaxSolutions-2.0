-- QR Code Scans Tracking Table
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- Enable Row Level Security
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (tracking scans)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_scans' AND policyname = 'Allow public insert') THEN
    CREATE POLICY "Allow public insert" ON qr_scans FOR INSERT TO public WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to read their own data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_scans' AND policyname = 'Allow authenticated read') THEN
    CREATE POLICY "Allow authenticated read" ON qr_scans FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
