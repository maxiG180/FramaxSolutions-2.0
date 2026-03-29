# Client Deletion with CASCADE

## Como Funciona

Quando apagas um cliente na página `/dashboard/clients`, o sistema agora apaga **automaticamente**:

### ✅ O que é apagado (CASCADE)

1. **Cliente** - Registo na tabela `clients`
2. **Pasta no Docs** - Pasta associada na tabela `folders` (através de `client_id`)
3. **Ficheiros da Pasta** - Todos os ficheiros dentro dessa pasta (através de `folder_id`)
4. **Projectos** - Projectos associados ao cliente (se configurado)

### 🔧 Configuração Técnica

#### Base de Dados (PostgreSQL)

```sql
-- Migração: 20260318000005_add_client_id_to_folders.sql
ALTER TABLE public.folders
  ADD COLUMN client_id bigint
  REFERENCES public.clients(id)
  ON DELETE CASCADE;  -- ← Esta linha faz a magia!
```

O `ON DELETE CASCADE` diz ao PostgreSQL:
> "Quando um registo em `clients` é apagado, apaga automaticamente todos os registos em `folders` que referenciam esse cliente através de `client_id`"

#### Código (TypeScript)

**Criação de Pasta (linha 224):**
```tsx
const { data: folderData, error: folderError } = await supabase
  .from('folders')
  .insert({
    user_id: user.id,
    name: clientFolderName,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    client_id: data.id  // ← Link para o cliente
  });
```

**Eliminação de Cliente (linha 263):**
```tsx
const { error } = await supabase
  .from('clients')
  .delete()
  .eq('id', id);
// ✨ PostgreSQL apaga automaticamente pastas + ficheiros
```

### 📋 Fluxo de Eliminação

```
Utilizador clica "Delete" no cliente
         ↓
Confirma modal de aviso
         ↓
DELETE FROM clients WHERE id = X
         ↓
PostgreSQL CASCADE trigger
         ↓
DELETE FROM folders WHERE client_id = X
         ↓
PostgreSQL CASCADE trigger
         ↓
DELETE FROM files WHERE folder_id IN (...)
         ↓
✅ Tudo limpo!
```

### 🛡️ Proteção contra Eliminação Acidental

O modal de confirmação agora avisa explicitamente:

```
Tem a certeza que pretende apagar "Nome do Cliente"?

⚠️ Isto irá também apagar:
• Pasta associada no Docs
• Todos os ficheiros da pasta
• Projectos associados

Esta acção não pode ser revertida.
```

### 🧪 Como Testar

1. **Cria um cliente novo:**
   - Nome: "Cliente Teste CASCADE"
   - Preenche os dados
   - Clica "Add Client"

2. **Verifica que a pasta foi criada:**
   - Vai a `/dashboard/docs`
   - Deve aparecer uma pasta "Cliente Teste CASCADE" (azul)

3. **(Opcional) Adiciona ficheiros à pasta:**
   - Faz upload de 1-2 ficheiros para testar o CASCADE em cadeia

4. **Apaga o cliente:**
   - Volta a `/dashboard/clients`
   - Clica no ícone de lixo
   - Confirma o modal de aviso
   - ✅ Cliente desaparece

5. **Confirma que a pasta também foi apagada:**
   - Volta a `/dashboard/docs`
   - A pasta "Cliente Teste CASCADE" não deve existir
   - ✅ Todos os ficheiros também foram apagados

### 📊 Logs de Consola

Quando apagas um cliente, verás:

```
✅ Cliente "Nome do Cliente" apagado com sucesso
📁 Pastas associadas foram automaticamente apagadas (CASCADE)
```

### ⚠️ Notas Importantes

1. **Irreversível:** Não há "undo" - a eliminação é permanente
2. **Storage:** Os ficheiros no Supabase Storage **NÃO** são apagados automaticamente
   - Apenas os registos na base de dados
   - Para apagar ficheiros do storage, seria necessário um trigger adicional
3. **RLS:** As Row Level Security policies garantem que só podes apagar os teus próprios clientes

### 🔮 Melhorias Futuras (Opcional)

Se quiseres apagar também os ficheiros físicos do storage:

```sql
-- Trigger para apagar ficheiros do storage quando a pasta é apagada
CREATE OR REPLACE FUNCTION delete_folder_files()
RETURNS trigger AS $$
BEGIN
  -- Apagar ficheiros do storage bucket
  DELETE FROM storage.objects
  WHERE bucket_id = 'client-files'
  AND name LIKE OLD.id || '/%';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_folder_delete
  BEFORE DELETE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION delete_folder_files();
```

---

**Status:** ✅ Implementado e funcional
**Migração:** `20260318000005_add_client_id_to_folders.sql`
**Última atualização:** 2026-03-18
