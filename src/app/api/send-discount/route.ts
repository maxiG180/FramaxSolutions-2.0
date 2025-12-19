import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, sendDiscountSchema, sanitizeString } from '@/utils/validation';
import { logger, SecurityEventType } from '@/utils/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        // Strict rate limiting (2 requests per minute to prevent email spam)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.SEND_DISCOUNT);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/send-discount', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(sendDiscountSchema, body);

        if (!validation.success) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : undefined;
            logger.logInvalidInput('/api/send-discount', validation.error, ip);

            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { email, company, role, teamSize, challenge } = validation.data;

        // Sanitize user inputs for database storage
        const sanitizedCompany = sanitizeString(company);
        const sanitizedRole = sanitizeString(role);
        const sanitizedChallenge = sanitizeString(challenge);

        const supabase = await createClient();

        // Check if lead already exists
        const { data: existingLead } = await supabase
            .from('leads')
            .select('discount_code, status')
            .eq('email', email)
            .single();

        let discountCode = existingLead?.discount_code;

        // If no code exists (new user), generate and store it
        if (!discountCode) {
            const uniqueId = crypto.randomUUID().split('-')[0].toUpperCase();
            discountCode = `FRAMAX-${uniqueId}`;

            const { error: insertError } = await supabase
                .from('leads')
                .insert([{
                    email,
                    name: sanitizedCompany,
                    company_name: sanitizedCompany,
                    role: sanitizedRole,
                    team_size: teamSize,
                    challenge: sanitizedChallenge,
                    discount_code: discountCode,
                    status: 'emailed'
                }]);

            if (insertError) {
                logger.logApiError('/api/send-discount', insertError, { email });
                // Continue to send email even if DB insert fails
                logger.logWarning('Database insert failed but continuing with email', {
                    endpoint: '/api/send-discount',
                    email,
                });
            }

            logger.logInfo('New discount code generated', {
                endpoint: '/api/send-discount',
                email,
                code: discountCode.substring(0, 10) + '...',
            });
        } else {
            logger.logInfo('Resending existing discount code', {
                endpoint: '/api/send-discount',
                email,
                code: discountCode.substring(0, 10) + '...',
            });
        }

        // Send Email (whether new or existing, we resend the code)
        const { error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Framax Solutions <contact@framaxsolutions.com>',
            to: [email],
            subject: existingLead ? 'Your 100€ Discount Code (Resent)' : 'Your 100€ Discount Code for Framax Solutions',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Here is your exclusive code!</h1>
          <p>Hi there,</p>
          <p>Thank you for your interest in Framax Solutions. We're excited to help you solve your challenge: <strong>${sanitizeString(challenge)}</strong>.</p>
          <p>As promised, here is your 100€ discount code to be used on your first project:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <code style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">${discountCode}</code>
          </div>

          <p><strong>How to use it:</strong></p>
          <ol>
            <li>Book your free discovery call.</li>
            <li>In the booking form, paste this code into the "Promo Code" field.</li>
            <li>We'll apply the discount to your final proposal.</li>
          </ol>
          
          <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The Framax Solutions Team
          </p>
        </div>
      `,
        });

        if (emailError) {
            logger.logApiError('/api/send-discount', emailError, { email });

            const response = NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('Discount email sent successfully', {
            endpoint: '/api/send-discount',
            email,
        });

        // Return the code so frontend can auto-fill it
        const response = NextResponse.json({ success: true, code: discountCode });
        return addCorsHeaders(response, request);

    } catch (error) {
        logger.logApiError('/api/send-discount', error);

        const response = NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

