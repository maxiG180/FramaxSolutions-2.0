import { NextRequest, NextResponse } from 'next/server';
import { getLeadsFromPublicSheet } from '@/lib/google-sheets';

const SPREADSHEET_ID = '1Di85QHcKc4uSBd1-ZaVpeOmhcaif1iOucz16y8Wpo0Q';
const SHEET_RANGE = "'Leads Sem Website'!A:Z";

export async function GET(request: NextRequest) {
  try {
    const leads = await getLeadsFromPublicSheet(SPREADSHEET_ID, SHEET_RANGE);

    // Return first 3 leads for testing
    return NextResponse.json({
      success: true,
      count: leads.length,
      sample: leads.slice(0, 3),
    });
  } catch (error) {
    console.error('Error testing leads:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test leads',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
