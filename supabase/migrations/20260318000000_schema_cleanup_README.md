# Schema Cleanup & Refactoring - README

## Resumo das Alterações

Esta migration (`20260318000000_schema_cleanup.sql`) implementa uma refatoração completa do schema da base de dados Supabase, resolvendo inconsistências de tipos, normalizando dados e adicionando constraints em falta.

## ✅ Problemas Corrigidos

### 1. Uniformização de IDs (bigint → uuid)
**Tabelas migradas:**
- ✅ `clients` (bigint → uuid)
- ✅ `projects` (bigint → uuid)
- ✅ `tasks` (bigint → uuid)
- ✅ `notes` (bigint → uuid)
- ✅ `events` (bigint → uuid)
- ✅ `documents` (bigint → uuid)
- ✅ `audit_logs` (bigint → uuid, record_id: bigint → text)
- ✅ `chatbot_leads` (renomeado de `leads`, bigint → uuid)

**Foreign Keys atualizadas:**
- `projects.client_id`: integer → uuid
- `quotes.client_id`: integer → uuid
- `invoices.client_id`: integer → uuid
- `payments.client_id`: bigint → uuid
- `notes.client_id`, `notes.project_id`, `notes.chatbot_lead_id`: bigint → uuid
- `events.client_id`, `events.project_id`, `events.chatbot_lead_id`: bigint → uuid
- `tasks.project_id`: bigint → uuid
- `documents.project_id`: bigint → uuid

### 2. Normalização de Line Items

**Novas tabelas criadas:**

#### `quote_items`
```sql
id uuid PRIMARY KEY
quote_id uuid → quotes.id (ON DELETE CASCADE)
service_id uuid → services.id (ON DELETE SET NULL)
description text NOT NULL
quantity integer DEFAULT 1
unit_price numeric(10,2) NOT NULL
total numeric(10,2) GENERATED (quantity * unit_price)
created_at timestamptz
updated_at timestamptz
```

#### `invoice_items`
```sql
id uuid PRIMARY KEY
invoice_id uuid → invoices.id (ON DELETE CASCADE)
service_id uuid → services.id (ON DELETE SET NULL)
description text NOT NULL
quantity integer DEFAULT 1
unit_price numeric(10,2) NOT NULL
total numeric(10,2) GENERATED (quantity * unit_price)
created_at timestamptz
updated_at timestamptz
```

**Benefícios:**
- ✅ Permite queries analíticas: "qual serviço mais vendido?"
- ✅ Integridade referencial com `services` table
- ✅ Totais calculados automaticamente (GENERATED COLUMN)
- ✅ Suporte para tracking histórico de preços

**Nota:** O campo `items jsonb` nas tabelas `quotes` e `invoices` foi **mantido** para retrocompatibilidade. Os comentários TODO foram adicionados no código para orientar a migração futura.

### 3. Foreign Keys em Falta

**Constraints adicionados:**
- ✅ `tasks.project_id` → `projects.id` (ON DELETE SET NULL)
- ✅ `events.project_id` → `projects.id` (ON DELETE SET NULL)
- ✅ `documents.project_id` → `projects.id` (ON DELETE CASCADE)
- ✅ `notes.project_id` → `projects.id` (ON DELETE SET NULL)
- ✅ `notes.client_id` → `clients.id` (ON DELETE SET NULL)
- ✅ `notes.chatbot_lead_id` → `chatbot_leads.id` (ON DELETE SET NULL)
- ✅ `events.client_id` → `clients.id` (ON DELETE SET NULL)
- ✅ `events.chatbot_lead_id` → `chatbot_leads.id` (ON DELETE SET NULL)
- ✅ `qr_scans.qr_code_id` → `qr_codes.id` (ON DELETE CASCADE)

### 4. Tabela Prospects (CRM B2B)

**Nova tabela criada:**
```sql
prospects (
  id uuid PRIMARY KEY
  company_name text NOT NULL
  email, phone, website, address, city
  business_category text -- 'dental', 'beauty', 'restaurant', etc.
  website_status text -- 'has_website', 'outdated_website', 'no_website'
  outreach_status text -- 'not_contacted', 'contacted', 'replied', etc.
  outreach_channel text -- 'email', 'phone', 'in_person', 'social'
  contacted_at, last_followup_at, next_followup_at
  converted_to_client_id uuid → clients.id
  converted_at timestamptz
  source text DEFAULT 'pai.pt'
  notes text
  spec_website_url text -- URL da landing page proativa
)
```

**Tabela `leads` renomeada:**
- `leads` → `chatbot_leads` (formulário de captura do chatbot)
- Referências atualizadas: `notes.lead_id` → `notes.chatbot_lead_id`, `events.lead_id` → `events.chatbot_lead_id`

### 5. Ligação Projects → Quotes

**Coluna adicionada:**
```sql
ALTER TABLE projects ADD COLUMN quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL;
```

Permite rastrear qual orçamento originou cada projeto.

### 6. Service Inclusions com Tipo

**Coluna adicionada:**
```sql
ALTER TABLE service_inclusions
  ADD COLUMN inclusion_type text DEFAULT 'bundled'
  CHECK (inclusion_type IN ('bundled', 'optional'));
```

Permite distinguir serviços incluídos obrigatoriamente vs. opcionais.

### 7. Currency Defaults (USD → EUR)

**Alterações:**
```sql
ALTER TABLE quotes ALTER COLUMN currency SET DEFAULT 'EUR';
ALTER TABLE invoices ALTER COLUMN currency SET DEFAULT 'EUR';
```

### 8. Updated_at Triggers

**Triggers criados/atualizados para:**
- `clients`, `projects`, `tasks`, `notes`, `events`, `documents`
- `chatbot_leads`, `prospects`
- `quote_items`, `invoice_items`

## 📁 Ficheiros Criados/Modificados

### Migrations
- ✅ `supabase/migrations/20260318000000_schema_cleanup.sql` (nova migration completa)

### Types TypeScript
- ✅ `src/types/database.ts` (novo ficheiro com todos os tipos do schema refatorado)
- ✅ `src/types/service.ts` (atualizado com `InclusionType` e `ServiceInclusion`)

### Código Anotado (TODO comments)
- ✅ `src/app/api/quotes/route.ts` (2 comentários TODO)
- ✅ `src/app/api/quotes/[id]/route.ts` (2 comentários TODO)
- ✅ `src/app/api/invoices/route.ts` (2 comentários TODO)
- ✅ `src/app/api/invoices/[id]/route.ts` (2 comentários TODO)

## 🚀 Como Aplicar a Migration

### Opção 1: Supabase CLI (Recomendado)

```bash
# 1. Verificar se a migration é válida
npx supabase db diff

# 2. Aplicar a migration
npx supabase db push

# 3. Verificar se foi aplicada com sucesso
npx supabase db remote ls
```

### Opção 2: Supabase Dashboard

1. Aceder ao Supabase Dashboard → SQL Editor
2. Copiar o conteúdo de `20260318000000_schema_cleanup.sql`
3. Executar a query
4. Verificar logs de erro

## ⚠️ Avisos Importantes

### Backup Obrigatório
```bash
# Criar backup antes de aplicar
npx supabase db dump -f backup_pre_cleanup.sql
```

### Verificações Pós-Migration

```sql
-- 1. Verificar se os IDs foram migrados corretamente
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM quotes;

-- 2. Verificar FKs
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- 3. Verificar se as novas tabelas foram criadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('quote_items', 'invoice_items', 'prospects', 'chatbot_leads');
```

### Testar Funcionalidades Críticas

Após a migration, testar:
1. ✅ Criação de novos orçamentos (quotes)
2. ✅ Criação de novas faturas (invoices)
3. ✅ Criação de novos clientes (clients)
4. ✅ Criação de novos projetos (projects)
5. ✅ Dashboard de projetos
6. ✅ Sistema de pagamentos

## 🔄 Próximos Passos (Migração de Dados)

### Fase 2: Migração de Items JSONB → Tabelas Normalizadas

**Quando implementar:**
Após confirmar que a migration base foi aplicada com sucesso e o sistema está estável.

**O que fazer:**
1. Criar script de migração de dados:
   - Ler `quotes.items` (jsonb) e popular `quote_items`
   - Ler `invoices.items` (jsonb) e popular `invoice_items`
2. Atualizar código das APIs para usar as novas tabelas
3. Remover comentários TODO
4. (Opcional) Deprecar campo `items` jsonb após confirmação

**Script exemplo:**
```sql
-- Migrar quote items
INSERT INTO quote_items (quote_id, description, quantity, unit_price, service_id)
SELECT
  q.id,
  item->>'description',
  (item->>'quantity')::integer,
  (item->>'price')::numeric,
  (item->>'serviceId')::uuid
FROM quotes q, jsonb_array_elements(q.items) AS item;

-- Migrar invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, service_id)
SELECT
  i.id,
  item->>'description',
  (item->>'quantity')::integer,
  (item->>'price')::numeric,
  (item->>'serviceId')::uuid
FROM invoices i, jsonb_array_elements(i.items) AS item;
```

## 📊 Impacto Estimado

### Performance
- ✅ **Melhoria:** Queries analíticas em items agora são possíveis com JOIN
- ✅ **Melhoria:** Foreign keys permitem otimização de queries pelo Postgres
- ⚠️ **Neutro:** UUID vs bigint tem impacto mínimo em performance (PostgreSQL optimizado para ambos)

### Storage
- ⚠️ **Aumento temporário:** Manter `items` jsonb + novas tabelas duplica dados temporariamente
- ✅ **Futuro:** Remover `items` jsonb reduzirá storage

### Compatibilidade
- ✅ **Retrocompatível:** Código existente continua a funcionar (campo `items` mantido)
- ⚠️ **Tipos TypeScript:** Código que usa tipos antigos precisa ser atualizado para importar de `src/types/database.ts`

## 🆘 Rollback (Em caso de erro)

```bash
# Restaurar backup
npx supabase db reset
psql -h <host> -U postgres -d postgres -f backup_pre_cleanup.sql

# OU criar migration de rollback (não recomendado, perda de dados)
```

**Nota:** Rollback completo de mudanças de tipo (bigint → uuid) é complexo e pode resultar em perda de dados criados após a migration. Sempre testar em ambiente de desenvolvimento primeiro.

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do Supabase Dashboard → Database → Logs
2. Executar queries de verificação acima
3. Consultar documentação: https://supabase.com/docs/guides/database/migrations

---

**Data da Migration:** 2026-03-18
**Versão do Schema:** 2.0.0
**Status:** ✅ Pronto para aplicar (testar primeiro em dev/staging)
