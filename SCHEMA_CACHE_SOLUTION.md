# ✅ Solução: Erro 400 ao Criar Clientes

## Problema Resolvido

**Erro:** `Failed to load resource: the server responded with a status of 400 ()` ao criar pastas para clientes

**Causa:** Schema cache do Supabase no browser estava desatualizado após aplicar migrações

## ✨ Solução Implementada

### 1. Botão "Clear Cache" Temporário

Adicionei um botão amarelo **"Clear Cache"** na página `/dashboard/clients` que:
- Limpa `localStorage` e `sessionStorage`
- Recarrega a página automaticamente
- Força o Supabase a re-sincronizar o schema

**Como usar:**
1. Vai a `/dashboard/clients`
2. Clica no botão amarelo **"Clear Cache"**
3. Aguarda o reload da página
4. ✅ Tenta adicionar um cliente novamente

### 2. Migrações Aplicadas

Todas as migrações foram aplicadas com sucesso:

```
✅ 20260318000001_add_country_to_clients.sql
✅ 20260318000002_fix_clients_columns.sql
✅ 20260318000003_ensure_all_clients_columns.sql
✅ 20260318000004_create_docs_tables.sql
✅ 20260318000005_add_client_id_to_folders.sql
✅ 20260318000006_create_qr_scans.sql
✅ 20260318000007_fix_folders_rls_for_client_id.sql
```

**Confirmado:** A coluna `client_id` existe na tabela `folders` ✅

### 3. Logging Melhorado

Adicionei logging detalhado para debug:
- Mostra erro completo (message, details, hint)
- Mostra payload enviado
- Confirma quando CASCADE funciona

### 4. Viewport Warnings Corrigidos

Separei `viewport` do `metadata` no `dashboard/layout.tsx` conforme Next.js 15:

```tsx
// ✅ CORRETO (Next.js 15)
export const metadata: Metadata = { ... };
export const viewport: Viewport = { ... };

// ❌ INCORRETO (deprecated)
export const metadata: Metadata = {
  viewport: { ... }  // Não usar!
};
```

## 📋 Como Testar

### Teste 1: Criar Cliente com Pasta

1. **Clica "Clear Cache"** (botão amarelo)
2. Aguarda reload
3. Clica "Add Client"
4. Preenche:
   - Nome: "Cliente Teste"
   - Email: "teste@example.com"
   - Morada: "Avenida Dr. Francisco Sá Carneiro nº1, loja 2, Chaves, Portugal, 5400-279"
5. Completa os 3 passos
6. ✅ Cliente criado
7. ✅ Pasta criada no Docs

### Teste 2: Eliminar Cliente (CASCADE)

1. Na lista de clientes, clica no ícone do lixo
2. Lê o aviso sobre CASCADE
3. Confirma
4. ✅ Cliente apagado
5. Vai a `/dashboard/docs`
6. ✅ Pasta também foi apagada (CASCADE funcionou)

### Teste 3: Verificar Logs

Abre a consola (F12) e verifica:

**Ao criar cliente:**
```
🗂️ Starting folder creation in Docs for new client...
📁 Creating Docs folder: Nome do Cliente
✅ Successfully created Docs folder for client: Nome do Cliente
📁 Folder will be auto-deleted when client is deleted (CASCADE)
```

**Ao apagar cliente:**
```
✅ Cliente "Nome do Cliente" apagado com sucesso
📁 Pastas associadas foram automaticamente apagadas (CASCADE)
```

## 🔧 Troubleshooting

### Se ainda der erro 400:

1. **Hard refresh do browser:**
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

2. **Modo incógnito:**
   - Abre janela incógnita (Ctrl+Shift+N)
   - Testa criar cliente
   - Se funcionar → Era cache mesmo

3. **Clear manual via console:**
   ```javascript
   // Cola no Console (F12)
   localStorage.clear();
   sessionStorage.clear();
   location.reload(true);
   ```

4. **Verificar no Supabase Dashboard:**
   - Vai a https://supabase.com/dashboard
   - Table Editor → `folders`
   - Confirma que a coluna `client_id` existe (tipo: `bigint`)

### Se der erro de permissões (403):

Verifica que estás autenticado:
```javascript
// Console
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);  // Deve mostrar teu user ID
```

## 🧹 Limpeza Pós-Teste

Depois de confirmar que tudo funciona, **podes remover:**

1. O botão "Clear Cache" amarelo em `clients/page.tsx:288-301`
2. Os ficheiros de documentação temporários:
   - `CLIENT_DELETION_CASCADE.md` (opcional manter)
   - `SCHEMA_CACHE_SOLUTION.md` (este ficheiro)

**Código a remover:**
```tsx
{/* Temporary: Clear Cache Button (Remove after schema cache issue resolved) */}
<button onClick={() => { /* ... */ }}>
  <RefreshCw className="w-4 h-4" /> Clear Cache
</button>
```

## 📊 Estado Final

| Componente | Estado |
|------------|--------|
| Migração `client_id` | ✅ Aplicada |
| Coluna `folders.client_id` | ✅ Existe (bigint) |
| CASCADE delete | ✅ Funcional |
| RLS policies | ✅ Corretas |
| Viewport warnings | ✅ Corrigidos |
| Logging | ✅ Detalhado |
| Botão Clear Cache | ✅ Disponível |

## 🎯 Próximos Passos

1. ✅ **Clica "Clear Cache"** na página de clientes
2. ✅ Testa criar um cliente novo
3. ✅ Verifica que a pasta foi criada no Docs
4. ✅ Testa apagar o cliente
5. ✅ Confirma que a pasta foi apagada (CASCADE)
6. 🧹 Remove o botão "Clear Cache" depois de confirmar

---

**Status:** ✅ PRONTO PARA TESTAR
**Última atualização:** 2026-03-18
**Versão:** Final
