import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Generate next sequential quote number
async function generateNextQuoteNumber(supabase: any): Promise<string> {
  const year = new Date().getFullYear();

  // Get the last quote number for the current year
  const { data: lastQuote } = await supabase
    .from('quotes')
    .select('quote_number')
    .like('quote_number', `ORC-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;

  if (lastQuote?.quote_number) {
    // Extract the number from the last quote (e.g., "ORC-2026-005" -> 5)
    const lastNumber = parseInt(lastQuote.quote_number.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  // Format with leading zeros (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `ORC-${year}-${formattedNumber}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const nextQuoteNumber = await generateNextQuoteNumber(supabase);

    return NextResponse.json({ quoteNumber: nextQuoteNumber }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating next quote number:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
