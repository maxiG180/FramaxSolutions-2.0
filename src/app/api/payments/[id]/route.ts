import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching payment:', fetchError);
      return NextResponse.json(
        { error: 'Payment not found', details: fetchError.message },
        { status: 404 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error: any) {
    console.error('Error in payment GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      currency,
      status,
      paymentMethod,
      billingFrequency,
      startDate,
      nextPaymentDate,
      lastPaymentDate,
      endDate,
      notes,
    } = body;

    // Update payment
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        client_id: clientId,
        client_name: clientName,
        service_name: serviceName,
        service_type: serviceType,
        amount: amount,
        currency: currency,
        status: status,
        payment_method: paymentMethod,
        billing_frequency: billingFrequency,
        start_date: startDate,
        next_payment_date: nextPaymentDate,
        last_payment_date: lastPaymentDate,
        end_date: endDate,
        notes: notes,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update payment', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error: any) {
    console.error('Error in payment PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { error: deleteError } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting payment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete payment', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error in payment DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
