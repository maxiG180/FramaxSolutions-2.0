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
 * Get all invoices for the authenticated user
 * Rate limited: 30 requests per minute per IP
 * Authentication: Required (Supabase session)
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/invoices', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/invoices',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Fetch invoices
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            logger.logApiError('/api/invoices', error, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to fetch invoices' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        const response = NextResponse.json(invoices || []);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/invoices', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

/**
 * Create invoice validation schema
 */
const createInvoiceSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    clientPhone: z.string().optional(),
    clientContact: z.string().optional(),
    clientAddress: z.string().optional(),
    clientNif: z.string().optional(),
    clientLanguage: z.enum(['pt', 'en']).optional(),
    invoiceDate: z.string().min(1, 'Invoice date is required'),
    dueDate: z.string().nullable().optional(),
    items: z.array(z.object({
        id: z.string().optional(),
        description: z.string(),
        quantity: z.number().positive(),
        price: z.number().nonnegative(),
        serviceId: z.string().nullable().optional(),
    })).min(1, 'At least one item is required'),
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
 * Generate sequential invoice number
 */
async function generateInvoiceNumber(supabase: any): Promise<string> {
    const year = new Date().getFullYear();

    // Get the last invoice number for the current year
    const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .like('invoice_number', `FAT-${year}-%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    let nextNumber = 1;

    if (lastInvoice?.invoice_number) {
        // Extract the number from the last invoice (e.g., "FAT-2026-005" -> 5)
        const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    // Format with leading zeros (001, 002, etc.)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `FAT-${year}-${formattedNumber}`;
}

/**
 * Create a new invoice
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/invoices', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/invoices',
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
        const validation = validateRequest(createInvoiceSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/invoices',
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

        // 4. Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const taxRate = data.taxRate || 0.23;
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        // 5. Generate unique sequential invoice number with retry logic
        let invoiceNumber: string | undefined;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            invoiceNumber = await generateInvoiceNumber(supabase);

            // Check if this number already exists (race condition protection)
            const { data: existing } = await supabase
                .from('invoices')
                .select('invoice_number')
                .eq('invoice_number', invoiceNumber)
                .single();

            if (!existing) break;

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (attempts === maxAttempts || !invoiceNumber) {
            const response = NextResponse.json(
                { error: 'Failed to generate unique invoice number' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 6. Create the invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                user_id: user.id,
                invoice_number: invoiceNumber,
                client_name: data.clientName,
                client_email: data.clientEmail || null,
                client_phone: data.clientPhone || null,
                client_contact: data.clientContact || null,
                client_address: data.clientAddress || null,
                client_nif: data.clientNif || null,
                client_language: data.clientLanguage || 'pt',
                invoice_date: data.invoiceDate,
                due_date: data.dueDate || null,
                items: data.items,
                subtotal: subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total: total,
                currency: 'EUR',
                notes: data.notes || null,
                status: data.status || 'pending',
                payment_method: data.paymentMethod || null,
                payment_date: data.paymentDate || null,
                payment_reference: data.paymentReference || null,
                payment_notes: data.paymentNotes || null,
                bank_name: data.bankName || 'Millennium BCP',
                iban: data.iban || 'PT50 0033 0000 0000 0000 0000 0',
                swift_bic: data.swiftBic || 'BCOMPTPL'
            })
            .select()
            .single();

        if (invoiceError) {
            logger.logApiError('/api/invoices', invoiceError, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to create invoice', details: invoiceError.message },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('Invoice created', {
            endpoint: '/api/invoices',
            userId: user.id,
            invoiceId: invoice.id,
            invoiceNumber: invoiceNumber
        });

        const response = NextResponse.json({
            ...invoice,
            invoice_number: invoiceNumber,
        });
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/invoices', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
