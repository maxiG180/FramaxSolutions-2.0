-- Create payments table for recurring payments
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_type TEXT CHECK (service_type IN ('Monthly', 'One Time')) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR' NOT NULL,
    status TEXT CHECK (status IN ('active', 'pending', 'overdue', 'cancelled', 'completed')) DEFAULT 'active',
    payment_method TEXT,
    billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly', 'yearly', 'one-time')) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    next_payment_date DATE,
    last_payment_date DATE,
    end_date DATE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payment transactions table for payment history
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR' NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_method TEXT,
    transaction_date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
    ON public.payments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments"
    ON public.payments FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions"
    ON public.payment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment transactions"
    ON public.payment_transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment transactions"
    ON public.payment_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_next_payment_date ON public.payments(next_payment_date);
CREATE INDEX idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
