-- Add NIF field to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nif TEXT;
