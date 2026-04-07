import { NextRequest, NextResponse } from 'next/server';
import { getLeadsFromPublicSheet, updateLeadStatus } from '@/lib/google-sheets';

// ID da spreadsheet extraído da URL
const SPREADSHEET_ID = '1Di85QHcKc4uSBd1-ZaVpeOmhcaif1iOucz16y8Wpo0Q';
// Usar aspas simples para nomes de aba com espaços
const SHEET_RANGE = "'Leads Sem Website'!A:Z";

export async function GET(request: NextRequest) {
  try {
    // Verificar se a spreadsheet está configurada como pública
    // ou se tem as credenciais necessárias
    const leads = await getLeadsFromPublicSheet(SPREADSHEET_ID, SHEET_RANGE);

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching leads from Google Sheets:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leads from Google Sheets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Endpoint para refrescar/sincronizar leads
export async function POST(request: NextRequest) {
  try {
    const leads = await getLeadsFromPublicSheet(SPREADSHEET_ID, SHEET_RANGE);

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing leads from Google Sheets:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync leads from Google Sheets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Endpoint para atualizar o estado de uma lead
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, newStatus } = body;

    if (!leadId || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: leadId and newStatus',
        },
        { status: 400 }
      );
    }

    await updateLeadStatus(SPREADSHEET_ID, SHEET_RANGE, leadId, newStatus);

    return NextResponse.json({
      success: true,
      message: 'Lead status updated successfully',
    });
  } catch (error) {
    console.error('Error updating lead status:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update lead status',
        message: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
