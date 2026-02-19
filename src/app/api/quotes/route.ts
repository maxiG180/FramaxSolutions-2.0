import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Generate sequential quote number
async function generateQuoteNumber(supabase: any): Promise<string> {
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

    // Fetch all quotes for the current user
    const { data: quotes, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching quotes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch quotes', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(quotes || [], { status: 200 });
  } catch (error: any) {
    console.error('Error in quotes GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientContact,
      clientAddress,
      clientNif,
      clientLanguage = 'pt',
      quoteDate,
      expiryDate,
      items,
      notes,
      taxRate = 0.23
    } = body;

    // Validate required fields
    if (!clientName || !quoteDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, quoteDate, and items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.price);
    }, 0);

    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate unique sequential quote number with retry logic
    let quoteNumber: string | undefined;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      quoteNumber = await generateQuoteNumber(supabase);

      // Check if this number already exists (race condition protection)
      const { data: existing } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('quote_number', quoteNumber)
        .single();

      if (!existing) break;

      attempts++;
      // Small delay to avoid tight loop in case of conflicts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (attempts === maxAttempts || !quoteNumber) {
      return NextResponse.json(
        { error: 'Failed to generate unique quote number' },
        { status: 500 }
      );
    }

    // Insert quote
    const { data: quote, error: insertError } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        quote_number: quoteNumber,
        client_name: clientName,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        client_contact: clientContact || null,
        client_address: clientAddress || null,
        client_nif: clientNif || null,
        client_language: clientLanguage || 'pt',
        quote_date: quoteDate,
        expiry_date: expiryDate || null,
        items: items,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        currency: 'EUR',
        notes: notes || null,
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating quote:', insertError);
      return NextResponse.json(
        { error: 'Failed to create quote', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error: any) {
    console.error('Error in quotes API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
