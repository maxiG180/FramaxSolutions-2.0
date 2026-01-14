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
 * Accept quote validation schema
 */
const acceptQuoteSchema = z.object({
    id: z.string().uuid('Invalid quote ID format'),
}).strict();

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FAT-${year}-${random}`;
}

/**
 * Accept a quote and automatically create an invoice
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Authorization: User can only accept their own quotes
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/accept-quote', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/accept-quote',
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
        const validation = validateRequest(acceptQuoteSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/accept-quote',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { id } = validation.data;

        // 4. Fetch the quote
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !quote) {
            logger.logApiError('/api/accept-quote', fetchError || new Error('Quote not found'), { userId: user.id, quoteId: id });
            const response = NextResponse.json(
                { error: 'Quote not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, request);
        }

        // 5. Check if quote is already accepted or converted
        if (quote.status === 'accepted' || quote.status === 'converted') {
            const response = NextResponse.json(
                { error: 'Quote has already been accepted' },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        // 6. Generate unique invoice number
        let invoiceNumber = generateInvoiceNumber();
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const { data: existing } = await supabase
                .from('invoices')
                .select('invoice_number')
                .eq('invoice_number', invoiceNumber)
                .single();

            if (!existing) break;

            invoiceNumber = generateInvoiceNumber();
            attempts++;
        }

        if (attempts === maxAttempts) {
            const response = NextResponse.json(
                { error: 'Failed to generate unique invoice number' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 7. Create the invoice from the quote
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                invoice_number: invoiceNumber,
                quote_id: id, // Reference to the original quote
                client_name: quote.client_name,
                client_email: quote.client_email,
                client_phone: quote.client_phone,
                client_contact: quote.client_contact,
                client_address: quote.client_address,
                client_nif: quote.client_nif,
                invoice_date: new Date().toISOString().split('T')[0], // Today's date
                due_date: null, // Can be set later
                items: quote.items,
                subtotal: quote.subtotal,
                tax_rate: quote.tax_rate,
                tax_amount: quote.tax_amount,
                total: quote.total,
                currency: quote.currency || 'EUR', // Use quote currency or default to EUR
                notes: quote.notes,
                status: 'pending' // Invoice starts as pending payment
            })
            .select()
            .single();

        if (invoiceError) {
            logger.logApiError('/api/accept-quote', invoiceError, { userId: user.id, quoteId: id });
            const response = NextResponse.json(
                { error: 'Failed to create invoice', details: invoiceError.message },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 8. Update quote status to 'accepted'
        const { error: updateError } = await supabase
            .from('quotes')
            .update({ status: 'accepted' })
            .eq('id', id)
            .eq('user_id', user.id);

        if (updateError) {
            logger.logApiError('/api/accept-quote', updateError, { userId: user.id, quoteId: id });
            // Note: Invoice was created but quote status update failed
            // You might want to handle this case differently
        }

        logger.logInfo('Quote accepted and invoice created', {
            endpoint: '/api/accept-quote',
            userId: user.id,
            quoteId: id,
            invoiceId: invoice.id,
            invoiceNumber: invoiceNumber
        });

        const response = NextResponse.json({
            success: true,
            invoice: invoice,
            message: 'Quote accepted successfully. Invoice created.'
        });
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/accept-quote', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
