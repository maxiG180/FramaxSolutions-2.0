-- Add location column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lisbon, PT';

-- Only for documentation/consistency (since RLS is already 'enable all' in schema.sql)
-- No new policies needed as the existing broad policy covers it.
