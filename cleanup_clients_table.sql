-- Clean up clients table

-- 1. Remove duplicate 'logo' field (we use 'logo_url' instead)
ALTER TABLE clients DROP COLUMN IF EXISTS logo;

-- 2. Remove unused fields
ALTER TABLE clients DROP COLUMN IF EXISTS status;
ALTER TABLE clients DROP COLUMN IF EXISTS country;

-- 3. Update contact_person with actual name
-- Replace 'Nome da Pessoa de Contacto' with the real contact person name
UPDATE clients
SET contact_person = 'Dr. João Silva'  -- Change this to the actual contact person name
WHERE name = 'Clínica Alves';

-- Or if you want to clear it until you have the real name:
-- UPDATE clients SET contact_person = NULL WHERE name = 'Clínica Alves';

-- 4. Verify the changes
SELECT id, name, email, phone, website, nif, contact_person, logo_url, address
FROM clients;
