import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Update quote
    const { data: quote, error: updateError } = await supabase
      .from('quotes')
      .update({
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
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quote:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('Error in quote update API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
