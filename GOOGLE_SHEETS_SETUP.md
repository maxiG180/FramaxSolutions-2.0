# Configuração Google Sheets - Leitura e Escrita

## Problema Atual

A Google Sheets API Key (`GOOGLE_SHEETS_API_KEY`) só permite **operações de leitura**. Para atualizar dados (como mudar o estado das leads), precisamos de usar **Google Service Account** com permissões de escrita.

## Solução: Configurar Service Account

### 1. Criar Service Account na Google Cloud Console

1. Vai a [Google Cloud Console](https://console.cloud.google.com/)
2. Seleciona o projeto existente ou cria um novo
3. No menu lateral, vai a **IAM & Admin** > **Service Accounts**
4. Clica em **CREATE SERVICE ACCOUNT**
5. Preenche:
   - **Service account name**: `framax-sheets-editor` (ou outro nome)
   - **Service account ID**: (gerado automaticamente)
   - **Description**: `Service account for editing leads in Google Sheets`
6. Clica em **CREATE AND CONTINUE**
7. Em **Grant this service account access to project**, podes saltar (opcional)
8. Clica em **DONE**

### 2. Gerar Chave JSON

1. Na lista de Service Accounts, clica nos **3 pontos** à direita da conta criada
2. Seleciona **Manage keys**
3. Clica em **ADD KEY** > **Create new key**
4. Escolhe **JSON** e clica em **CREATE**
5. O ficheiro JSON será descarregado automaticamente

### 3. Extrair Credenciais do JSON

Abre o ficheiro JSON descarregado. Vais ver algo assim:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "framax-sheets-editor@seu-projeto-123456.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

### 4. Adicionar ao `.env.local`

Copia os valores de `client_email` e `private_key` para o teu ficheiro `.env.local`:

```env
# Google Service Account (para escrita em Sheets)
GOOGLE_SERVICE_ACCOUNT_EMAIL="framax-sheets-editor@seu-projeto-123456.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE**: Mantém as aspas e os `\n` na private key tal como aparecem no JSON!

### 5. Partilhar a Google Sheet com o Service Account

1. Abre a tua Google Sheet: https://docs.google.com/spreadsheets/d/1Di85QHcKc4uSBd1-ZaVpeOmhcaif1iOucz16y8Wpo0Q
2. Clica em **Share** (Partilhar)
3. Adiciona o email do Service Account: `framax-sheets-editor@seu-projeto-123456.iam.gserviceaccount.com`
4. Define permissão como **Editor**
5. Clica em **Send**

### 6. Ativar Google Sheets API

1. Na [Google Cloud Console](https://console.cloud.google.com/)
2. Vai a **APIs & Services** > **Library**
3. Pesquisa por **Google Sheets API**
4. Clica e depois em **ENABLE**

### 7. Reiniciar Servidor de Desenvolvimento

```bash
# Para o servidor (Ctrl+C)
# Depois reinicia
npm run dev
```

## Verificar Configuração

Após reiniciar o servidor, tenta mover uma lead de "New" para "Contacted". Se tudo estiver bem configurado:

- O card move-se imediatamente
- A Google Sheet atualiza automaticamente
- Não aparece erro na consola

Se aparecer erro, verifica:
1. As variáveis de ambiente estão no `.env.local` (não `.env`)
2. O Service Account email está partilhado na Google Sheet com permissão de **Editor**
3. A private key está correta (com `\n` preservados)
4. Reiniciaste o servidor após adicionar as variáveis

## Manter Ambas as Configurações

Podes manter tanto a API Key (leitura) como o Service Account (escrita):

```env
# Para leitura (operações rápidas sem autenticação OAuth)
GOOGLE_SHEETS_API_KEY="AIzaSy..."

# Para escrita (atualizar estados, adicionar/remover leads)
GOOGLE_SERVICE_ACCOUNT_EMAIL="framax-sheets-editor@projeto.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Desta forma:
- **GET** (ler leads) usa API Key (mais rápido)
- **PUT** (atualizar estado) usa Service Account (permissões de escrita)
