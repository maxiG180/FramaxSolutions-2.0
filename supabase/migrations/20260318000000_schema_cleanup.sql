-- ===================================================================
-- SCHEMA CLEANUP & REFACTORING
-- ===================================================================

-- ===================================================================
-- PART 1: UNIFORMIZE IDs (bigint → uuid)
-- ===================================================================

DO $$
BEGIN
  ALTER TABLE clients ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();

  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
  ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_client_id_fkey;
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_client_id_fkey;

  UPDATE clients SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  CREATE TEMP TABLE IF NOT EXISTS client_id_mapping AS
  SELECT id AS old_id, id_new AS new_id FROM clients;

  ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_pkey CASCADE;
  ALTER TABLE clients DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE clients RENAME COLUMN id_new TO id;
  ALTER TABLE clients ADD PRIMARY KEY (id);
  ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
  ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id_new uuid;

  ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
  ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_project_id_fkey;
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_project_id_fkey;
  ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_project_id_fkey;

  UPDATE projects SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  CREATE TEMP TABLE IF NOT EXISTS project_id_mapping AS
  SELECT id AS old_id, id_new AS new_id FROM projects;

  UPDATE projects p
  SET client_id_new = m.new_id
  FROM client_id_mapping m
  WHERE p.client_id = m.old_id;

  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_pkey CASCADE;
  ALTER TABLE projects DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE projects DROP COLUMN IF EXISTS client_id CASCADE;

  ALTER TABLE projects RENAME COLUMN id_new TO id;
  ALTER TABLE projects RENAME COLUMN client_id_new TO client_id;

  ALTER TABLE projects ADD PRIMARY KEY (id);
  ALTER TABLE projects ALTER COLUMN client_id SET NOT NULL;
  ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

  ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id_new uuid;

  UPDATE tasks SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  UPDATE tasks t
  SET project_id_new = m.new_id
  FROM project_id_mapping m
  WHERE t.project_id = m.old_id;

  ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_pkey CASCADE;
  ALTER TABLE tasks DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE tasks DROP COLUMN IF EXISTS project_id CASCADE;

  ALTER TABLE tasks RENAME COLUMN id_new TO id;
  ALTER TABLE tasks RENAME COLUMN project_id_new TO project_id;

  ALTER TABLE tasks ADD PRIMARY KEY (id);
  ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS client_id_new uuid;
  ALTER TABLE notes ADD COLUMN IF NOT EXISTS project_id_new uuid;

  UPDATE notes SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  UPDATE notes n
  SET client_id_new = m.new_id
  FROM client_id_mapping m
  WHERE n.client_id = m.old_id;

  UPDATE notes n
  SET project_id_new = m.new_id
  FROM project_id_mapping m
  WHERE n.project_id = m.old_id;

  ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_pkey CASCADE;
  ALTER TABLE notes DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE notes DROP COLUMN IF EXISTS client_id CASCADE;
  ALTER TABLE notes DROP COLUMN IF EXISTS project_id CASCADE;

  ALTER TABLE notes RENAME COLUMN id_new TO id;
  ALTER TABLE notes RENAME COLUMN client_id_new TO client_id;
  ALTER TABLE notes RENAME COLUMN project_id_new TO project_id;

  ALTER TABLE notes ADD PRIMARY KEY (id);
  ALTER TABLE notes ADD CONSTRAINT notes_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  ALTER TABLE notes ADD CONSTRAINT notes_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

  ALTER TABLE notes ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE events ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
  ALTER TABLE events ADD COLUMN IF NOT EXISTS client_id_new uuid;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS project_id_new uuid;

  UPDATE events SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  UPDATE events e
  SET client_id_new = m.new_id
  FROM client_id_mapping m
  WHERE e.client_id = m.old_id;

  UPDATE events e
  SET project_id_new = m.new_id
  FROM project_id_mapping m
  WHERE e.project_id = m.old_id;

  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_pkey CASCADE;
  ALTER TABLE events DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE events DROP COLUMN IF EXISTS client_id CASCADE;
  ALTER TABLE events DROP COLUMN IF EXISTS project_id CASCADE;

  ALTER TABLE events RENAME COLUMN id_new TO id;
  ALTER TABLE events RENAME COLUMN client_id_new TO client_id;
  ALTER TABLE events RENAME COLUMN project_id_new TO project_id;

  ALTER TABLE events ADD PRIMARY KEY (id);
  ALTER TABLE events ADD CONSTRAINT events_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
  ALTER TABLE events ADD CONSTRAINT events_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

  ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE documents ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
  ALTER TABLE documents ADD COLUMN IF NOT EXISTS project_id_new uuid;

  UPDATE documents SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  UPDATE documents d
  SET project_id_new = m.new_id
  FROM project_id_mapping m
  WHERE d.project_id = m.old_id;

  ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_pkey CASCADE;
  ALTER TABLE documents DROP COLUMN IF EXISTS id CASCADE;
  ALTER TABLE documents DROP COLUMN IF EXISTS project_id CASCADE;

  ALTER TABLE documents RENAME COLUMN id_new TO id;
  ALTER TABLE documents RENAME COLUMN project_id_new TO project_id;

  ALTER TABLE documents ADD PRIMARY KEY (id);
  ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

  ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
END $$;

DO $$
BEGIN
  ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();

  UPDATE audit_logs SET id_new = gen_random_uuid() WHERE id_new IS NULL;

  ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey CASCADE;
  ALTER TABLE audit_logs DROP COLUMN IF EXISTS id CASCADE;

  ALTER TABLE audit_logs RENAME COLUMN id_new TO id;
  ALTER TABLE audit_logs ADD PRIMARY KEY (id);
  ALTER TABLE audit_logs ALTER COLUMN record_id TYPE text;
END $$;

-- Fix quotes.client_id (was integer, should be uuid)
DO $$
BEGIN
  ALTER TABLE quotes ADD COLUMN IF NOT EXISTS client_id_new uuid;

  UPDATE quotes q
  SET client_id_new = m.new_id
  FROM client_id_mapping m
  WHERE q.client_id::text = m.old_id::text;

  ALTER TABLE quotes DROP COLUMN IF EXISTS client_id CASCADE;
  ALTER TABLE quotes RENAME COLUMN client_id_new TO client_id;

  ALTER TABLE quotes ADD CONSTRAINT quotes_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
END $$;

-- Fix invoices.client_id (was integer, should be uuid)
DO $$
BEGIN
  ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_id_new uuid;

  UPDATE invoices i
  SET client_id_new = m.new_id
  FROM client_id_mapping m
  WHERE i.client_id::text = m.old_id::text;

  ALTER TABLE invoices DROP COLUMN IF EXISTS client_id CASCADE;
  ALTER TABLE invoices RENAME COLUMN client_id_new TO client_id;

  ALTER TABLE invoices ADD CONSTRAINT invoices_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
END $$;

-- ===================================================================
-- PART 2: NORMALIZE QUOTE/INVOICE ITEMS
-- ===================================================================

CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total numeric(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10, 2) NOT NULL,
  total numeric(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quote items from their quotes"
  ON quote_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert quote items to their quotes"
  ON quote_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update quote items from their quotes"
  ON quote_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete quote items from their quotes"
  ON quote_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()
  ));

CREATE POLICY "Users can view invoice items from their invoices"
  ON invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert invoice items to their invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can update invoice items from their invoices"
  ON invoice_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete invoice items from their invoices"
  ON invoice_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS quote_items_service_id_idx ON quote_items(service_id);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_items_service_id_idx ON invoice_items(service_id);

-- ===================================================================
-- PART 3: FIX QR_SCANS
-- ===================================================================

ALTER TABLE qr_scans ADD COLUMN IF NOT EXISTS qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS qr_scans_qr_code_id_idx ON qr_scans(qr_code_id);

-- ===================================================================
-- PART 4: RENAME LEADS → CHATBOT_LEADS AND CREATE PROSPECTS
-- ===================================================================

DO $$
BEGIN
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_lead_id_fkey;
  ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_lead_id_fkey;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads' AND table_schema = 'public')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chatbot_leads' AND table_schema = 'public') THEN

    ALTER TABLE leads RENAME TO chatbot_leads;

    ALTER TABLE chatbot_leads ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();

    CREATE TEMP TABLE IF NOT EXISTS chatbot_lead_id_mapping AS
    SELECT id AS old_id, id_new AS new_id FROM chatbot_leads;

    UPDATE chatbot_leads SET id_new = gen_random_uuid() WHERE id_new IS NULL;

    ALTER TABLE chatbot_leads DROP CONSTRAINT IF EXISTS leads_pkey CASCADE;
    ALTER TABLE chatbot_leads DROP COLUMN IF EXISTS id CASCADE;
    ALTER TABLE chatbot_leads RENAME COLUMN id_new TO id;
    ALTER TABLE chatbot_leads ADD PRIMARY KEY (id);
    ALTER TABLE chatbot_leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

    -- Migrate notes.lead_id → chatbot_lead_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'lead_id') THEN
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS chatbot_lead_id uuid;

      UPDATE notes n
      SET chatbot_lead_id = m.new_id
      FROM chatbot_lead_id_mapping m
      WHERE n.lead_id::text = m.old_id::text;

      ALTER TABLE notes DROP COLUMN IF EXISTS lead_id CASCADE;

      ALTER TABLE notes ADD CONSTRAINT notes_chatbot_lead_id_fkey
        FOREIGN KEY (chatbot_lead_id) REFERENCES chatbot_leads(id) ON DELETE SET NULL;
    END IF;

    -- Migrate events.lead_id → chatbot_lead_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'lead_id') THEN
      ALTER TABLE events ADD COLUMN IF NOT EXISTS chatbot_lead_id uuid;

      UPDATE events e
      SET chatbot_lead_id = m.new_id
      FROM chatbot_lead_id_mapping m
      WHERE e.lead_id::text = m.old_id::text;

      ALTER TABLE events DROP COLUMN IF EXISTS lead_id CASCADE;

      ALTER TABLE events ADD CONSTRAINT events_chatbot_lead_id_fkey
        FOREIGN KEY (chatbot_lead_id) REFERENCES chatbot_leads(id) ON DELETE SET NULL;
    END IF;

    ALTER TABLE chatbot_leads ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'chatbot_leads' AND policyname = 'Enable all access for all users'
    ) THEN
      CREATE POLICY "Enable all access for all users" ON chatbot_leads FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  company_name text NOT NULL,
  email text,
  phone text,
  website text,
  address text,
  city text,
  business_category text,
  website_status text CHECK (website_status IN ('has_website', 'outdated_website', 'no_website')),
  outreach_status text DEFAULT 'not_contacted' CHECK (outreach_status IN ('not_contacted', 'contacted', 'replied', 'meeting_scheduled', 'converted', 'rejected')),
  outreach_channel text CHECK (outreach_channel IN ('email', 'phone', 'in_person', 'social')),
  contacted_at timestamptz,
  last_followup_at timestamptz,
  next_followup_at date,
  converted_to_client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  converted_at timestamptz,
  source text DEFAULT 'pai.pt',
  notes text,
  spec_website_url text
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'prospects' AND policyname = 'Enable all access for all users'
  ) THEN
    CREATE POLICY "Enable all access for all users" ON prospects FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS prospects_outreach_status_idx ON prospects(outreach_status);
CREATE INDEX IF NOT EXISTS prospects_business_category_idx ON prospects(business_category);
CREATE INDEX IF NOT EXISTS prospects_next_followup_at_idx ON prospects(next_followup_at);
CREATE INDEX IF NOT EXISTS prospects_converted_to_client_id_idx ON prospects(converted_to_client_id);

-- ===================================================================
-- PART 5: CREATE PAYMENTS TABLE (não existia)
-- ===================================================================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL,
  method text CHECK (method IN ('transfer', 'multibanco', 'mbway', 'cash', 'card', 'other')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payment_date date,
  reference text,
  notes text
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Enable all access for all users'
  ) THEN
    CREATE POLICY "Enable all access for all users" ON payments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS payments_client_id_idx ON payments(client_id);
CREATE INDEX IF NOT EXISTS payments_invoice_id_idx ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);

-- ===================================================================
-- PART 6: CREATE SERVICE_INCLUSIONS TABLE (não existia)
-- ===================================================================

CREATE TABLE IF NOT EXISTS service_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  included_service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  inclusion_type text DEFAULT 'bundled' CHECK (inclusion_type IN ('bundled', 'optional')),
  UNIQUE(parent_service_id, included_service_id)
);

ALTER TABLE service_inclusions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'service_inclusions' AND policyname = 'Enable all access for all users'
  ) THEN
    CREATE POLICY "Enable all access for all users" ON service_inclusions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ===================================================================
-- PART 7: ADD QUOTE_ID TO PROJECTS
-- ===================================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS projects_quote_id_idx ON projects(quote_id);

-- ===================================================================
-- PART 8: FIX CURRENCY DEFAULTS
-- ===================================================================

ALTER TABLE quotes ALTER COLUMN currency SET DEFAULT 'EUR';
ALTER TABLE invoices ALTER COLUMN currency SET DEFAULT 'EUR';

-- ===================================================================
-- PART 9: UPDATED_AT TRIGGERS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chatbot_leads_updated_at ON chatbot_leads;
CREATE TRIGGER update_chatbot_leads_updated_at BEFORE UPDATE ON chatbot_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prospects_updated_at ON prospects;
CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quote_items_updated_at ON quote_items;
CREATE TRIGGER update_quote_items_updated_at BEFORE UPDATE ON quote_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON invoice_items;
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- CLEANUP
-- ===================================================================

DROP TABLE IF EXISTS client_id_mapping;
DROP TABLE IF EXISTS project_id_mapping;
DROP TABLE IF EXISTS chatbot_lead_id_mapping;