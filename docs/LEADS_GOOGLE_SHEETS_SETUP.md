# Configuração de Leads da Google Spreadsheet

Este documento explica como configurar a integração entre a página de Leads do dashboard e a Google Spreadsheet.

## 📋 Visão Geral

A página de Leads (`/dashboard/leads`) carrega automaticamente dados de uma Google Spreadsheet e organiza-os num Kanban board baseado no campo "Estado da Lead":

- **New** → Coluna "New"
- **Contacted** → Coluna "Contacted"
- **Proposal** → Coluna "Proposal"
- **Won** → Coluna "Won"

## 🔧 Configuração Passo a Passo

### 1. Tornar a Spreadsheet Pública

1. Abra a sua [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1Di85QHcKc4uSBd1-ZaVpeOmhcaif1iOucz16y8Wpo0Q/edit)
2. Clique em "Share" (Partilhar) no canto superior direito
3. Em "General access", selecione **"Anyone with the link"** e **"Viewer"**
4. Clique em "Done"

### 2. Obter uma Google Sheets API Key

1. Aceda à [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione ou crie um projeto
3. Vá para **APIs & Services > Credentials**
4. Clique em **"+ CREATE CREDENTIALS"** → **"API key"**
5. Copie a API key gerada
6. **(Recomendado)** Clique em "Edit API key" e restrinja a chave:
   - **API restrictions**: Selecione "Restrict key" e escolha apenas **"Google Sheets API"**
   - **Application restrictions**: Configure para aceitar apenas pedidos do seu domínio

### 3. Ativar a Google Sheets API

1. Na Google Cloud Console, vá para **APIs & Services > Library**
2. Procure por **"Google Sheets API"**
3. Clique em **"Enable"**

### 4. Adicionar a API Key ao Projeto

Abra o ficheiro `.env.local` e adicione:

```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

⚠️ **IMPORTANTE**: Nunca faça commit do ficheiro `.env.local` para o Git!

### 5. Estrutura da Spreadsheet

A spreadsheet **DEVE** ter a seguinte estrutura mínima:

#### Aba: "Leads Sem Página"

| Nome/Empresa | Contacto | Email | Telefone | Estado da Lead | Valor | Tag/Tipo |
|--------------|----------|-------|----------|----------------|-------|----------|
| TechStart    | Sarah    | ...   | ...      | New            | €5000 | Web      |
| Coffee Shop  | Mike     | ...   | ...      | Contacted      | €2000 | SEO      |

**Colunas Reconhecidas** (podem estar em qualquer ordem):
- **Nome/Empresa**: `nome`, `name`, `empresa`, `company`
- **Contacto**: `contacto`, `contact`, `pessoa`
- **Email**: `email`, `e-mail`
- **Telefone**: `telefone`, `phone`, `telemóvel`, `mobile`
- **Estado**: `estado`, `status` (**OBRIGATÓRIO**)
- **Valor**: `valor`, `value`, `orçamento`, `budget`
- **Tag**: `tag`, `tipo`, `type`, `serviço`, `service`

### 6. Mapeamento de Estados

O sistema normaliza automaticamente os estados da spreadsheet:

| Estado na Spreadsheet | Coluna no Kanban |
|----------------------|------------------|
| New, Novo, Nova      | New              |
| Contacted, Contactado, Contactada, Em Contacto | Contacted |
| Proposal, Proposta, Orçamento | Proposal |
| Won, Ganho, Ganha, Fechado, Convertido | Won |

Se o estado não for reconhecido, a lead irá automaticamente para "New".

## 🚀 Como Usar

### Carregar Leads

1. Aceda a `/dashboard/leads`
2. As leads serão carregadas automaticamente ao abrir a página
3. Clique em **"Sync from Sheets"** para refrescar os dados

### Funcionalidades

- **Drag & Drop**: Arraste os cards entre colunas para alterar o estado
- **Adicionar Lead**: Clique em "Add Lead" para criar uma nova lead manualmente (apenas local)
- **Sincronizar**: Clique em "Sync from Sheets" para carregar os dados mais recentes
- **Eliminar**: Hover sobre um card e clique no ícone do lixo

## 📝 Notas Importantes

### Permissões
- A spreadsheet DEVE estar configurada como "Anyone with the link can view"
- A API key tem acesso apenas de leitura (readonly)

### Limitações
- As alterações feitas no Kanban (drag & drop, delete) **NÃO** são guardadas na spreadsheet
- Para persistir alterações, use a funcionalidade "Sync from Sheets" para recarregar
- Leads adicionadas manualmente via "Add Lead" são apenas temporárias

### Performance
- A API do Google Sheets tem rate limits (quotas)
- Evite sincronizar demasiadas vezes num curto período de tempo
- Por defeito, a quota é de 100 pedidos por 100 segundos por utilizador

## 🔒 Segurança

- **NUNCA** exponha a API key no código frontend
- A API key está apenas no `.env.local` (server-side)
- Use API key restrictions para limitar o acesso
- Configure Application restrictions para aceitar apenas o seu domínio

## 🐛 Troubleshooting

### Erro: "Failed to fetch leads from Google Sheets"

**Possíveis causas:**
1. A spreadsheet não está pública
2. A API key não está configurada no `.env.local`
3. A Google Sheets API não está ativada no projeto
4. A API key está restrita e bloqueando o acesso

**Solução:**
1. Verifique as permissões da spreadsheet
2. Confirme que `GOOGLE_SHEETS_API_KEY` está definido no `.env.local`
3. Verifique os logs no terminal para ver o erro específico
4. Teste a API key usando a [Google Sheets API Explorer](https://developers.google.com/sheets/api/reference/rest)

### Erro: "The caller does not have permission"

A spreadsheet não está pública. Siga o passo 1 da configuração.

### Dados não aparecem

1. Verifique se a aba se chama exactamente **"Leads Sem Página"**
2. Confirme que existe uma coluna com "Estado" ou "Status"
3. Verifique os logs do terminal para ver se há erros de parsing

## 📚 Recursos

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
