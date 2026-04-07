# ✅ Storage Cascade Delete - Implementado

## 🎯 Funcionalidade

Quando um ficheiro é apagado da tabela `files`, o ficheiro físico correspondente no **Supabase Storage** é também apagado automaticamente.

## 🔧 Como Funciona

### Fluxo de Eliminação

```
Utilizador apaga cliente
         ↓
PostgreSQL CASCADE: Apaga registo em clients
         ↓
PostgreSQL CASCADE: Apaga pasta em folders (client_id FK)
         ↓
PostgreSQL CASCADE: Apaga ficheiros em files (folder_id FK)
         ↓
TRIGGER: delete_storage_file() dispara
         ↓
Parse storage_path: "client-logos/0.12345.png"
         ↓
Extrai bucket: "client-logos"
Extrai caminho: "0.12345.png"
         ↓
storage.delete('client-logos', '0.12345.png')
         ↓
✅ Ficheiro físico apagado do storage!
```

### Código do Trigger

**Função:** `delete_storage_file()`
- Extrai nome do bucket e caminho do ficheiro do campo `storage_path`
- Suporta buckets: `client-logos`, `client-files` e outros
- Chama `storage.delete(bucket, path)` para apagar ficheiro físico
- **Não falha** se a eliminação do storage falhar (apenas avisa)

**Trigger:** `on_file_delete`
- Executa **BEFORE DELETE** na tabela `files`
- Chama `delete_storage_file()` para cada linha apagada
- `SECURITY DEFINER` = executa com permissões da função (bypass RLS)

## 📋 Buckets Suportados

O trigger detecta automaticamente estes buckets:

| Bucket | Conteúdo | Exemplo de Path |
|--------|----------|-----------------|
| `client-logos` | Logos de clientes | `client-logos/0.12345.png` |
| `client-files` | Documentos de clientes | `client-files/uuid/doc.pdf` |
| Outros | Formato genérico | `bucket-name/path/file.ext` |

## 🧪 Como Testar

### Teste 1: Apagar Cliente com Logo

1. **Cria cliente com logo:**
   ```
   Cliente: "Teste Storage Delete"
   Logo: upload qualquer imagem
   ```

2. **Verifica storage antes:**
   - Vai a Supabase Dashboard
   - Storage → `client-logos`
   - ✅ Vês o ficheiro do logo

3. **Apaga o cliente:**
   - Página `/dashboard/clients`
   - Clica no ícone do lixo
   - Confirma

4. **Verifica storage depois:**
   - Storage → `client-logos`
   - ✅ Ficheiro foi apagado!

### Teste 2: Apagar Ficheiro Directamente

1. **Vai à página Docs:** `/dashboard/docs`
2. **Abre pasta de um cliente**
3. **Apaga um ficheiro da lista**
4. **Verifica no Storage:**
   - ✅ Ficheiro físico também foi apagado

### Teste 3: Verificar Logs

Abre SQL Editor no Supabase e executa:

```sql
-- Ativar logging de notices
SET client_min_messages TO NOTICE;

-- Apagar um ficheiro de teste
DELETE FROM files WHERE id = 'algum-uuid';

-- Deverás ver:
-- 🗑️ Deleted storage file: 0.12345.png from bucket: client-logos
```

## 📊 Estrutura da Migração

**Ficheiro:** `20260318000009_cascade_delete_storage_files.sql`

**Componentes:**
1. Função `delete_storage_file()` - Lógica de eliminação
2. Trigger `on_file_delete` - Execução automática
3. Comments - Documentação inline

**Segurança:**
- `SECURITY DEFINER` - Necessário para aceder a `storage.delete()`
- Não falha se storage delete falhar - apenas avisa
- RAISE WARNING em vez de RAISE EXCEPTION

## 🔒 Permissões Necessárias

O trigger usa `SECURITY DEFINER`, o que significa:
- Executa com permissões do **owner da função** (não do user)
- Pode aceder ao schema `storage` mesmo com RLS ativo
- **IMPORTANTE:** Função criada durante migração = owner correto ✅

## ⚠️ Casos Especiais

### Se storage delete falhar

O trigger **não bloqueia** a eliminação do registo:

```sql
-- Mesmo se storage.delete() falhar:
DELETE FROM files WHERE id = 'x';  -- ✅ Registo apagado na mesma

-- Log mostra:
-- ⚠️ Could not delete storage file: <erro>
```

**Motivos para falhar:**
- Ficheiro já não existe no storage
- Bucket foi apagado
- Permissões incorrectas (raro com SECURITY DEFINER)

### Storage path inválido ou NULL

```sql
-- Se storage_path for NULL ou vazio:
-- Trigger simplesmente não faz nada (sem erro)
```

### Formato de path desconhecido

```sql
-- Path: "algum-bucket/pasta/ficheiro.txt"
-- Trigger tenta parse genérico:
bucket_name = split_part(path, '/', 1)  -- "algum-bucket"
file_path = substring após primeira '/'  -- "pasta/ficheiro.txt"
```

## 🎁 Benefícios

### Antes (Sem Trigger)
```
DELETE FROM clients WHERE id = X;
↓
- Registo apagado ✅
- Pasta apagada (CASCADE) ✅
- Ficheiros apagados (CASCADE) ✅
- Storage CHEIO de ficheiros órfãos ❌ 💾💾💾
```

### Agora (Com Trigger)
```
DELETE FROM clients WHERE id = X;
↓
- Registo apagado ✅
- Pasta apagada (CASCADE) ✅
- Ficheiros apagados (CASCADE) ✅
- Storage limpo automaticamente ✅ 🧹
```

## 🚀 Extensões Futuras

Se precisares de mais funcionalidades:

### 1. Logging detalhado
```sql
-- Criar tabela de audit
CREATE TABLE storage_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_at timestamptz DEFAULT now(),
  bucket text,
  file_path text,
  success boolean
);

-- Modificar função para registar
INSERT INTO storage_deletions (bucket, file_path, success)
VALUES (bucket_name, file_path, true/false);
```

### 2. Soft delete
```sql
-- Mover ficheiros para bucket "trash" em vez de apagar
PERFORM storage.move(bucket_name, file_path, 'trash', file_path);
```

### 3. Backup antes de apagar
```sql
-- Copiar para bucket de backup
PERFORM storage.copy(bucket_name, file_path, 'backups', file_path);
-- Depois apagar original
PERFORM storage.delete(bucket_name, file_path);
```

## 📝 Notas de Manutenção

- **Migração aplicada:** 2026-03-18
- **Trigger ativo:** `on_file_delete` em `files` table
- **Função:** `delete_storage_file()` (SECURITY DEFINER)
- **Buckets monitorizados:** `client-logos`, `client-files`, outros

---

**Status:** ✅ ATIVO E FUNCIONAL
**Testado:** Sim
**Reversível:** Sim (DROP TRIGGER + DROP FUNCTION)
