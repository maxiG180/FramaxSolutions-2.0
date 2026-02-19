import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { validateRequest } from '@/utils/validation';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Get a single invoice by ID
 * Rate limited: 30 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Authorization: User can only access their own invoices
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit(`/api/invoices/${id}`, ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                `/api/invoices/${id}`,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Fetch the invoice
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !invoice) {
            logger.logApiError(`/api/invoices/${id}`, error || new Error('Invoice not found'), { userId: user.id });
            const response = NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, request);
        }

        const response = NextResponse.json(invoice);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError(`/api/invoices/${params.id}`, error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

/**
 * Update invoice validation schema
 */
const updateInvoiceSchema = z.object({
    clientName: z.string().min(1, 'Client name is required').optional(),
    clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    clientPhone: z.string().optional(),
    clientContact: z.string().optional(),
    clientAddress: z.string().optional(),
    clientNif: z.string().optional(),
    clientLanguage: z.enum(['pt', 'en']).optional(),
    invoiceDate: z.string().optional(),
    dueDate: z.string().nullable().optional(),
    items: z.array(z.object({
        id: z.string().optional(),
        description: z.string(),
        quantity: z.number().positive(),
        price: z.number().nonnegative(),
        serviceId: z.string().nullable().optional(),
    })).optional(),
    notes: z.string().optional(),
    taxRate: z.number().nonnegative().optional(),
    status: z.enum(['pending', 'paid', 'overdue']).optional(),
    paymentMethod: z.string().nullable().optional(),
    paymentDate: z.string().nullable().optional(),
    paymentReference: z.string().nullable().optional(),
    paymentNotes: z.string().nullable().optional(),
    bankName: z.string().optional(),
    iban: z.string().optional(),
    swiftBic: z.string().optional(),
});

/**
 * Update an invoice
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Authorization: User can only update their own invoices
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit(`/api/invoices/${id}`, ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                `/api/invoices/${id}`,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(updateInvoiceSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                `/api/invoices/${id}`,
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const data = validation.data;

        // 4. Check if invoice exists and belongs to user
        const { data: existingInvoice, error: fetchError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingInvoice) {
            logger.logApiError(`/api/invoices/${id}`, fetchError || new Error('Invoice not found'), { userId: user.id });
            const response = NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, request);
        }

        // 5. Prepare update data
        const updateData: any = {};

        if (data.clientName !== undefined) updateData.client_name = data.clientName;
        if (data.clientEmail !== undefined) updateData.client_email = data.clientEmail || null;
        if (data.clientPhone !== undefined) updateData.client_phone = data.clientPhone || null;
        if (data.clientContact !== undefined) updateData.client_contact = data.clientContact || null;
        if (data.clientAddress !== undefined) updateData.client_address = data.clientAddress || null;
        if (data.clientNif !== undefined) updateData.client_nif = data.clientNif || null;
        if (data.clientLanguage !== undefined) updateData.client_language = data.clientLanguage;
        if (data.invoiceDate !== undefined) updateData.invoice_date = data.invoiceDate;
        if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
        if (data.notes !== undefined) updateData.notes = data.notes || null;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
        if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
        if (data.paymentReference !== undefined) updateData.payment_reference = data.paymentReference;
        if (data.paymentNotes !== undefined) updateData.payment_notes = data.paymentNotes;
        if (data.bankName !== undefined) updateData.bank_name = data.bankName;
        if (data.iban !== undefined) updateData.iban = data.iban;
        if (data.swiftBic !== undefined) updateData.swift_bic = data.swiftBic;

        // Recalculate totals if items changed
        if (data.items) {
            updateData.items = data.items;
            const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const taxRate = data.taxRate !== undefined ? data.taxRate : existingInvoice.tax_rate || 0.23;
            const taxAmount = subtotal * taxRate;
            const total = subtotal + taxAmount;

            updateData.subtotal = subtotal;
            updateData.tax_rate = taxRate;
            updateData.tax_amount = taxAmount;
            updateData.total = total;
        } else if (data.taxRate !== undefined) {
            // If only tax rate changed, recalculate
            const subtotal = existingInvoice.subtotal;
            const taxAmount = subtotal * data.taxRate;
            const total = subtotal + taxAmount;

            updateData.tax_rate = data.taxRate;
            updateData.tax_amount = taxAmount;
            updateData.total = total;
        }

        // 6. Update the invoice
        const { data: updatedInvoice, error: updateError } = await supabase
            .from('invoices')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) {
            logger.logApiError(`/api/invoices/${id}`, updateError, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to update invoice', details: updateError.message },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('Invoice updated', {
            endpoint: `/api/invoices/${id}`,
            userId: user.id,
            invoiceId: id
        });

        const response = NextResponse.json(updatedInvoice);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError(`/api/invoices/${params.id}`, error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
