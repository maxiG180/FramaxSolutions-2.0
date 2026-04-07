import { google } from 'googleapis';

export interface LeadFromSheet {
  id: string;
  name: string;
  contact: string;
  value: string;
  status: string;
  tag: string;
  qualification?: string;
  // Campos adicionais que podem existir na spreadsheet
  email?: string;
  phone?: string;
  notes?: string;
}

/**
 * Lê leads da Google Spreadsheet
 * @param spreadsheetId - ID da spreadsheet (da URL)
 * @param range - Range a ler (ex: "'Leads Sem Website'!A:G")
 * @returns Array de leads
 */
export async function getLeadsFromSheet(
  spreadsheetId: string,
  range: string = "'Leads Sem Website'!A:Z"
): Promise<LeadFromSheet[]> {
  try {
    // Autenticação usando Service Account ou API Key
    // Para spreadsheets públicas, podemos usar só API Key
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // Assumir que a primeira linha contém os headers
    const headers = rows[0].map(h => String(h).trim());

    // Encontrar índices das colunas importantes
    // Nome da empresa está na primeira coluna (índice 0, header pode estar vazio)
    const nameIndex = 0; // Sempre usar a primeira coluna como nome
    const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('e-mail'));
    const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('telefone') || h.toLowerCase().includes('phone') || h.toLowerCase().includes('telemóvel') || h.toLowerCase().includes('mobile'));
    const statusIndex = headers.findIndex(h => h.toLowerCase().includes('estado'));
    const qualificationIndex = headers.findIndex(h => h.toLowerCase().includes('qualificação') || h.toLowerCase().includes('qualificacao') || h.toLowerCase().includes('qualification'));
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes('valor') || h.toLowerCase().includes('value') || h.toLowerCase().includes('orçamento') || h.toLowerCase().includes('budget'));
    const tagIndex = headers.findIndex(h => h.toLowerCase().includes('tag') || h.toLowerCase().includes('tipo') || h.toLowerCase().includes('type') || h.toLowerCase().includes('categoria') || h.toLowerCase().includes('serviço') || h.toLowerCase().includes('service'));

    // Contacto = email (usaremos o email como contacto principal)
    const contactIndex = emailIndex;

    // Mapear as linhas para objetos Lead
    const leads: LeadFromSheet[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Ignorar linhas vazias ou incompletas
      if (!row || row.length === 0) continue;

      // Ignorar linhas sem nome (primeira coluna vazia)
      const name = String(row[nameIndex] || '').trim();
      if (!name) continue;

      const status = statusIndex >= 0 && row[statusIndex] ? String(row[statusIndex]).trim() : '';

      // Normalizar o estado
      const normalizedStatus = normalizeStatus(status);

      const lead: LeadFromSheet = {
        id: `sheet-${i}`,
        name: name,
        contact: contactIndex >= 0 && row[contactIndex] ? String(row[contactIndex]).trim() : '',
        value: valueIndex >= 0 && row[valueIndex] ? String(row[valueIndex]).trim() : '€0',
        status: normalizedStatus,
        tag: tagIndex >= 0 && row[tagIndex] ? String(row[tagIndex]).trim() : 'General',
        qualification: qualificationIndex >= 0 && row[qualificationIndex] ? String(row[qualificationIndex]).trim() : undefined,
        email: emailIndex >= 0 && row[emailIndex] ? String(row[emailIndex]).trim() : undefined,
        phone: phoneIndex >= 0 && row[phoneIndex] ? String(row[phoneIndex]).trim() : undefined,
      };

      leads.push(lead);
    }

    return leads;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
}

/**
 * Normaliza o estado da lead para corresponder às colunas do Kanban
 * @param status - Estado vindo da spreadsheet
 * @returns Estado normalizado
 */
function normalizeStatus(status: string): string {
  if (!status) return 'New';

  const normalized = status.toLowerCase().trim();

  // Mapear estados da spreadsheet para os estados do Kanban
  const statusMap: Record<string, string> = {
    'new': 'New',
    'novo': 'New',
    'nova': 'New',
    'contacted': 'Contacted',
    'contactado': 'Contacted',
    'contactada': 'Contacted',
    'em contacto': 'Contacted',
    'proposal': 'Proposal',
    'proposta': 'Proposal',
    'orçamento': 'Proposal',
    'won': 'Won',
    'ganho': 'Won',
    'ganha': 'Won',
    'fechado': 'Won',
    'convertido': 'Won',
  };

  return statusMap[normalized] || 'New';
}

/**
 * Atualiza o estado de uma lead na Google Sheet
 * @param spreadsheetId - ID da spreadsheet
 * @param range - Range da aba
 * @param leadId - ID da lead (formato: sheet-N onde N é o índice da linha)
 * @param newStatus - Novo estado
 */
export async function updateLeadStatus(
  spreadsheetId: string,
  range: string,
  leadId: string,
  newStatus: string
): Promise<boolean> {
  try {
    // Para escrita, precisamos de usar Service Account, não API Key
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!serviceAccountEmail || !serviceAccountKey) {
      throw new Error('Google Service Account credentials not configured. Need GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY for write operations.');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: serviceAccountKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissão de escrita
    });

    // Extrair o índice da linha do leadId (formato: sheet-N)
    const rowIndex = parseInt(leadId.split('-')[1]);

    if (isNaN(rowIndex)) {
      throw new Error('Invalid lead ID format');
    }

    const sheets = google.sheets({ version: 'v4', auth });

    // Primeiro, ler os headers para encontrar a coluna de Status
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }

    const headers = rows[0].map(h => String(h).toLowerCase().trim());
    const statusIndex = headers.findIndex(h => h.includes('estado') || h.includes('status'));

    if (statusIndex < 0) {
      throw new Error('Status column not found in spreadsheet');
    }

    // Converter índice de coluna para letra (A, B, C, etc.)
    const columnLetter = String.fromCharCode(65 + statusIndex);

    // A linha no Sheets é rowIndex (que começa em 1 para os dados, já que 0 é header)
    const sheetRow = rowIndex + 1; // +1 porque headers estão na linha 1

    // Extrair o nome da aba do range original
    const sheetName = range.split('!')[0];

    // Range específico para atualizar
    const updateRange = `${sheetName}!${columnLetter}${sheetRow}`;

    // Atualizar o valor
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newStatus]]
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating lead status in Google Sheet:', error);
    throw error;
  }
}

/**
 * Lê leads com autenticação via API Key (para spreadsheets públicas)
 */
export async function getLeadsFromPublicSheet(
  spreadsheetId: string,
  range: string = "'Leads Sem Website'!A:Z"
): Promise<LeadFromSheet[]> {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_SHEETS_API_KEY not configured');
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: apiKey
    });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0].map(h => String(h).trim());

    // Nome da empresa está na primeira coluna (índice 0, header pode estar vazio)
    const nameIndex = 0; // Sempre usar a primeira coluna como nome
    const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('e-mail'));
    const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('telefone') || h.toLowerCase().includes('phone') || h.toLowerCase().includes('telemóvel') || h.toLowerCase().includes('mobile'));
    const statusIndex = headers.findIndex(h => h.toLowerCase().includes('estado'));
    const qualificationIndex = headers.findIndex(h => h.toLowerCase().includes('qualificação') || h.toLowerCase().includes('qualificacao') || h.toLowerCase().includes('qualification'));
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes('valor') || h.toLowerCase().includes('value') || h.toLowerCase().includes('orçamento') || h.toLowerCase().includes('budget'));
    const tagIndex = headers.findIndex(h => h.toLowerCase().includes('tag') || h.toLowerCase().includes('tipo') || h.toLowerCase().includes('type') || h.toLowerCase().includes('categoria') || h.toLowerCase().includes('serviço') || h.toLowerCase().includes('service'));

    // Contacto = email (usaremos o email como contacto principal)
    const contactIndex = emailIndex;

    const leads: LeadFromSheet[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      // Ignorar linhas vazias ou incompletas
      if (!row || row.length === 0) continue;

      // Ignorar linhas sem nome (primeira coluna vazia)
      const name = String(row[nameIndex] || '').trim();
      if (!name) continue;

      const status = statusIndex >= 0 && row[statusIndex] ? String(row[statusIndex]).trim() : '';

      // Normalizar o estado
      const normalizedStatus = normalizeStatus(status);

      const lead: LeadFromSheet = {
        id: `sheet-${i}`,
        name: name,
        contact: contactIndex >= 0 && row[contactIndex] ? String(row[contactIndex]).trim() : '',
        value: valueIndex >= 0 && row[valueIndex] ? String(row[valueIndex]).trim() : '€0',
        status: normalizedStatus,
        tag: tagIndex >= 0 && row[tagIndex] ? String(row[tagIndex]).trim() : 'General',
        qualification: qualificationIndex >= 0 && row[qualificationIndex] ? String(row[qualificationIndex]).trim() : undefined,
        email: emailIndex >= 0 && row[emailIndex] ? String(row[emailIndex]).trim() : undefined,
        phone: phoneIndex >= 0 && row[phoneIndex] ? String(row[phoneIndex]).trim() : undefined,
      };

      leads.push(lead);
    }

    return leads;
  } catch (error) {
    console.error('Error reading from public Google Sheet:', error);
    throw error;
  }
}
