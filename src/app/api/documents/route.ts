import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // Fetch quotes
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
    }

    // Fetch invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
    }

    // Transform quotes to document format
    const quoteDocs = (quotes || []).map(quote => ({
      id: quote.id,
      displayId: quote.quote_number,
      client: quote.client_name,
      amount: new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(quote.total || 0),
      date: new Date(quote.quote_date).toLocaleDateString('pt-PT', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: quote.status,
      type: 'quote' as const,
      rawData: quote
    }));

    // Transform invoices to document format
    const invoiceDocs = (invoices || []).map(invoice => ({
      id: invoice.id,
      displayId: invoice.invoice_number,
      client: invoice.client_name,
      amount: new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
      }).format(invoice.total || 0),
      date: new Date(invoice.invoice_date).toLocaleDateString('pt-PT', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: invoice.status,
      type: 'invoice' as const,
      rawData: invoice
    }));

    // Combine and sort by date
    const allDocuments = [...quoteDocs, ...invoiceDocs].sort((a, b) => {
      const dateA = new Date(a.rawData.quote_date || a.rawData.invoice_date);
      const dateB = new Date(b.rawData.quote_date || b.rawData.invoice_date);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json(allDocuments);
  } catch (error: any) {
    console.error('Error in documents API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
