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

    // Fetch all payments for the current user
    const { data: payments, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('next_payment_date', { ascending: true });

    if (fetchError) {
      console.error('Error fetching payments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch payments', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(payments || [], { status: 200 });
  } catch (error: any) {
    console.error('Error in payments GET API:', error);
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
      clientId,
      clientName,
      serviceName,
      serviceType,
      amount,
      currency = 'EUR',
      status = 'active',
      paymentMethod,
      billingFrequency = 'monthly',
      startDate,
      nextPaymentDate,
      notes,
    } = body;

    // Validate required fields
    if (!clientName || !serviceName || !serviceType || !amount || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, serviceName, serviceType, amount, and startDate are required' },
        { status: 400 }
      );
    }

    // Calculate next payment date if not provided
    let calculatedNextPaymentDate = nextPaymentDate;
    if (!calculatedNextPaymentDate && serviceType === 'Monthly') {
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + 1);
      calculatedNextPaymentDate = start.toISOString().split('T')[0];
    }

    // Insert payment
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        client_id: clientId || null,
        client_name: clientName,
        service_name: serviceName,
        service_type: serviceType,
        amount: amount,
        currency: currency,
        status: status,
        payment_method: paymentMethod || null,
        billing_frequency: billingFrequency,
        start_date: startDate,
        next_payment_date: calculatedNextPaymentDate || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating payment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create payment', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error in payments API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
