import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, validateDiscountRequestSchema } from '@/utils/validation';
import { logger, SecurityEventType } from '@/utils/logger';

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.VALIDATE_DISCOUNT);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/validate-discount', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(validateDiscountRequestSchema, body);

        if (!validation.success) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : undefined;
            logger.logInvalidInput('/api/validate-discount', validation.error, ip);

            const response = NextResponse.json(
                { valid: false, message: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { code } = validation.data;
        const supabase = await createClient();

        // Check if code exists and is not redeemed
        const { data: lead, error } = await supabase
            .from('leads')
            .select('redeemed_at')
            .eq('discount_code', code)
            .single();

        if (error || !lead) {
            logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_INVALID, {
                endpoint: '/api/validate-discount',
                code: code.substring(0, 10) + '...', // Partial code for security
            });

            const response = NextResponse.json({
                valid: false,
                message: 'Invalid discount code'
            });
            return addCorsHeaders(response, request);
        }

        if (lead.redeemed_at) {
            logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_INVALID, {
                endpoint: '/api/validate-discount',
                code: code.substring(0, 10) + '...',
                reason: 'already_redeemed',
            });

            const response = NextResponse.json({
                valid: false,
                message: 'Invalid discount code'
            });
            return addCorsHeaders(response, request);
        }

        // Code is valid
        logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_VALIDATED, {
            endpoint: '/api/validate-discount',
            code: code.substring(0, 10) + '...',
        });

        const response = NextResponse.json({
            valid: true,
            message: 'Code applied successfully!'
        });
        return addCorsHeaders(response, request);

    } catch (error) {
        logger.logApiError('/api/validate-discount', error);

        const response = NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

