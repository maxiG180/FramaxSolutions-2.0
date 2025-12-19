import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, redeemDiscountRequestSchema } from '@/utils/validation';
import { logger, SecurityEventType } from '@/utils/logger';

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.REDEEM_DISCOUNT);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/redeem-discount', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // Optional: Check if user is authenticated (uncomment if you want to require auth)
        // const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) {
        //     logger.logUnauthorizedAccess('/api/redeem-discount');
        //     const response = NextResponse.json(
        //         { success: false, message: 'Unauthorized' },
        //         { status: 401 }
        //     );
        //     return addCorsHeaders(response, request);
        // }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(redeemDiscountRequestSchema, body);

        if (!validation.success) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : undefined;
            logger.logInvalidInput('/api/redeem-discount', validation.error, ip);

            const response = NextResponse.json(
                { success: false, message: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { code } = validation.data;
        const supabaseAdmin = createAdminClient();

        // Check if code exists and is not already redeemed (race condition protection)
        const { data: existingLead, error: fetchError } = await supabaseAdmin
            .from('leads')
            .select('discount_code, redeemed_at')
            .eq('discount_code', code)
            .single();

        if (fetchError || !existingLead) {
            logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_INVALID, {
                endpoint: '/api/redeem-discount',
                code: code.substring(0, 10) + '...',
                reason: 'not_found',
            });

            const response = NextResponse.json(
                { success: false, message: 'Invalid discount code' },
                { status: 404 }
            );
            return addCorsHeaders(response, request);
        }

        // Check if already redeemed
        if (existingLead.redeemed_at) {
            logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_INVALID, {
                endpoint: '/api/redeem-discount',
                code: code.substring(0, 10) + '...',
                reason: 'already_redeemed',
            });

            const response = NextResponse.json(
                { success: false, message: 'Discount code has already been used' },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        // Update redeemed_at timestamp
        const { error: updateError } = await supabaseAdmin
            .from('leads')
            .update({ redeemed_at: new Date().toISOString() })
            .eq('discount_code', code)
            .is('redeemed_at', null); // Extra safety: only update if still null

        if (updateError) {
            logger.logApiError('/api/redeem-discount', updateError, {
                code: code.substring(0, 10) + '...',
            });

            const response = NextResponse.json(
                { success: false, message: 'Failed to redeem code' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // Success
        logger.logSecurityEvent(SecurityEventType.DISCOUNT_CODE_REDEEMED, {
            endpoint: '/api/redeem-discount',
            code: code.substring(0, 10) + '...',
        });

        const response = NextResponse.json({
            success: true,
            message: 'Code redeemed successfully'
        });
        return addCorsHeaders(response, request);

    } catch (error) {
        logger.logApiError('/api/redeem-discount', error);

        const response = NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

