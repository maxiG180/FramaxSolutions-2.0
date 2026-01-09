import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Generate quote number
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QTE-${year}-${random}`;
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

    // Generate unique quote number
    let quoteNumber = generateQuoteNumber();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('quote_number', quoteNumber)
        .single();

      if (!existing) break;

      quoteNumber = generateQuoteNumber();
      attempts++;
    }

    if (attempts === maxAttempts) {
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
        quote_date: quoteDate,
        expiry_date: expiryDate || null,
        items: items,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
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
