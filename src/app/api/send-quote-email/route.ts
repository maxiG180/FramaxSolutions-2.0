import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { validateRequest } from '@/utils/validation';
import { generateQuotePDF } from '@/utils/generateQuotePDF';
import fs from 'fs';
import path from 'path';

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

/**
 * Generate email HTML template (based on booking email design)
 */
function generateEmailTemplate(data: {
    clientName: string;
    documentNumber: string;
    documentType: 'quote' | 'invoice';
    validUntil?: string;
}) {
    const { clientName, documentNumber, documentType, validUntil } = data;
    const isQuote = documentType === 'quote';
    const docTypeLabel = isQuote ? 'Orçamento' : 'Fatura';
    const brandBlue = '#2563eb';

    return `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa;">
        <tr>
            <td style="padding: 50px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff;">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 56px 40px 32px 40px;">
                        <img src="https://www.framaxsolutions.com/logos/framax-logo-black.png" 
                             alt="Framax Solutions" 
                             width="260" 
                             style="max-width: 260px; height: auto; margin-bottom: 32px; display: block;" />
                            <h1 style="margin: 0 0 40px 0; font-size: 28px; font-weight: 400; color: ${brandBlue}; line-height: 1.3; letter-spacing: -0.3px;">${docTypeLabel} ${documentNumber}</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a; line-height: 1.5;">
                                Olá ${clientName},
                            </p>

                            <p style="margin: 0 0 32px 0; font-size: 16px; color: #404040; line-height: 1.6;">
                                ${isQuote
            ? 'Segue em anexo o orçamento solicitado. Ficamos à disposição para qualquer esclarecimento.'
            : 'Segue em anexo a fatura referente aos serviços prestados.'}
                            </p>

                            <!-- Document Info Block -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0; border-left: 3px solid ${brandBlue}; background-color: #fafafa;">
                                <tr>
                                    <td style="padding: 28px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom: 14px;">
                                                    <p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">DOCUMENTO</p>
                                                    <p style="margin: 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">${documentNumber}</p>
                                                </td>
                                            </tr>
                                            ${validUntil ? `
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 2px 0; font-size: 12px; color: #737373; letter-spacing: 0.8px;">VÁLIDO ATÉ</p>
                                                    <p style="margin: 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">${new Date(validUntil).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; font-size: 15px; color: #595959; line-height: 1.6;">
                                O documento encontra-se em anexo neste email.
                            </p>

                            ${isQuote ? `
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #737373; line-height: 1.6; font-style: italic;">
                                P.S. Para aceitar o orçamento ou esclarecer qualquer dúvida, é só responder a este email.
                            </p>
                            ` : `
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #737373; line-height: 1.6; font-style: italic;">
                                P.S. Se tiver alguma questão, não hesite em contactar-nos.
                            </p>
                            `}

                            <!-- Separator -->
                            <div style="height: 1px; background-color: #e5e5e5; margin: 40px 0;"></div>

                            <!-- Signature -->
                            <p style="margin: 0 0 4px 0; font-size: 15px; color: ${brandBlue}; font-weight: 500;">
                                Framax Solutions
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #737373;">
                                <a href="https://framaxsolutions.com" style="color: ${brandBlue}; text-decoration: none;">framaxsolutions.com</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 12px; color: #a3a3a3;">© 2026 Framax Solutions</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

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

        // 6. Generate email HTML
        const emailHtml = generateEmailTemplate({
            clientName: document.client_name,
            documentNumber: document[numberField],
            documentType: type,
            validUntil: type === 'quote' ? document.expiry_date : undefined,
        });

        // 6.5. Generate PDF using the same function as QuoteModal
        try {
            // Load logo from file system (server-side)
            const logoPath = path.join(process.cwd(), 'public', 'logos', 'framax-logo-black.png');
            let logoUrl: string | undefined;

            if (fs.existsSync(logoPath)) {
                logoUrl = `file://${logoPath}`;
            }

            // Load font from file system (server-side)
            const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Outfit-Regular.ttf');
            let fontBase64: string | undefined;

            if (fs.existsSync(fontPath)) {
                const fontBuffer = fs.readFileSync(fontPath);
                fontBase64 = fontBuffer.toString('base64');
            }

            // Generate PDF with logo and custom font
            const pdfDoc = await generateQuotePDF(document, {
                type,
                logoUrl,
                fontBase64,
            });

            const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

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
