import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1Di85QHcKc4uSBd1-ZaVpeOmhcaif1iOucz16y8Wpo0Q';
const SHEET_RANGE = "'Leads Sem Website'!A:Z";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SHEETS_API_KEY not configured',
      }, { status: 500 });
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: apiKey
    });

    // Get raw data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data found in spreadsheet',
      });
    }

    // Return headers and first 5 rows for debugging
    const headers = rows[0];
    const sampleData = rows.slice(1, 6);

    return NextResponse.json({
      success: true,
      headers: headers,
      sampleData: sampleData,
      totalRows: rows.length - 1, // -1 for header row
    });
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch spreadsheet data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
