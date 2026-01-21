import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { validateRequest } from '@/utils/validation';
import { generateQuotePDFBufferFromHTML } from '@/utils/generateQuotePDFFromHTML.server';
import { generateEmailTemplateHTML } from '@/utils/emailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Send quote email validation schema
 */
const sendQuoteEmailSchema = z.object({
    id: z.string().uuid('Invalid quote ID format'),
    type: z.enum(['quote', 'invoice']).optional().default('quote'),
}).strict();

// Email template is now imported from shared utility

/**
 * Send quote or invoice via email
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/send-quote-email', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/send-quote-email',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Validate request
        const body = await request.json();
        const validation = validateRequest(sendQuoteEmailSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/send-quote-email',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { id, type } = validation.data;
        const tableName = type === 'quote' ? 'quotes' : 'invoices';
        const numberField = type === 'quote' ? 'quote_number' : 'invoice_number';

        // 4. Fetch document
        const { data: document, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !document) {
            logger.logApiError('/api/send-quote-email', fetchError || new Error('Document not found'));
            const response = NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, request);
        }

        // 5. Validate client email
        if (!document.client_email) {
            const response = NextResponse.json(
                { error: 'Client email not found in document' },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        // 6. Generate email HTML using shared template
        const emailHtml = generateEmailTemplateHTML({
            clientName: document.client_name,
            documentNumber: document[numberField],
            documentType: type,
            validUntil: type === 'quote' ? document.expiry_date : undefined,
        });

        // 6.5. Generate PDF using HTML template (ensures consistency with preview)
        try {
            // Prepare data for PDF generation
            const pdfData = {
                quote_number: type === 'quote' ? document.quote_number : undefined,
                invoice_number: type === 'invoice' ? document.invoice_number : undefined,
                client_name: document.client_name,
                client_contact: document.client_contact,
                client_email: document.client_email,
                client_phone: document.client_phone,
                client_address: document.client_address,
                client_nif: document.client_nif,
                quote_date: type === 'quote' ? document.quote_date : undefined,
                invoice_date: type === 'invoice' ? document.invoice_date : undefined,
                expiry_date: document.expiry_date,
                items: document.items || [],
                subtotal: document.subtotal || 0,
                tax_rate: document.tax_rate || 0.23,
                tax_amount: document.tax_amount || 0,
                total: document.total || 0,
                notes: document.notes,
                currency: document.currency || 'EUR'
            };

            // Generate PDF from HTML template (same as preview)
            const pdfBuffer = await generateQuotePDFBufferFromHTML(pdfData, {
                type,
                translations: {
                    quote: 'ORÇAMENTO',
                    invoice: 'FATURA',
                    quoteNumber: 'Número de Orçamento',
                    invoiceNumber: 'Número de Fatura',
                    billTo: 'Faturar a',
                    issueDate: 'Data de Emissão',
                    validity: 'Validade',
                    description: 'Descrição',
                    qty: 'Qtd',
                    price: 'Preço',
                    total: 'Total',
                    subtotal: 'Subtotal',
                    tax: 'IVA',
                    notesTerms: 'Notas / Termos',
                    legalNote: 'Este orçamento não constitui fatura. Após aceitação, será emitida fatura oficial através do Portal das Finanças.',
                    nif: 'NIF',
                }
            });

            // 7. Send email with PDF attachment
            const { data: emailData, error: emailError } = await resend.emails.send({
                from: 'Framax Solutions <contact@framaxsolutions.com>',
                to: document.client_email,
                subject: `${type === 'quote' ? 'Orçamento' : 'Fatura'} ${document[numberField]} - Framax Solutions`,
                html: emailHtml,
                attachments: [{
                    filename: `${document[numberField]}.pdf`,
                    content: pdfBuffer,
                }]
            });

            if (emailError) {
                logger.logApiError('/api/send-quote-email', emailError);
                const response = NextResponse.json(
                    { error: 'Failed to send email', details: emailError.message },
                    { status: 500 }
                );
                return addCorsHeaders(response, request);
            }

            // 8. Update document status to 'sent' if it's draft
            if (document.status === 'draft') {
                await supabase
                    .from(tableName)
                    .update({ status: 'sent' })
                    .eq('id', id)
                    .eq('user_id', user.id);
            }

            logger.logInfo(`${type} email sent successfully`, {
                endpoint: '/api/send-quote-email',
                userId: user.id,
                documentId: id,
                documentType: type,
                emailTo: document.client_email,
            });

            const response = NextResponse.json({
                success: true,
                message: `${type === 'quote' ? 'Quote' : 'Invoice'} sent successfully`,
                emailId: emailData?.id,
            });
            return addCorsHeaders(response, request);

        } catch (pdfError: any) {
            logger.logApiError('/api/send-quote-email - PDF generation', pdfError);
            const response = NextResponse.json(
                { error: 'Failed to generate PDF', details: pdfError.message },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

    } catch (error: any) {
        logger.logApiError('/api/send-quote-email', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
