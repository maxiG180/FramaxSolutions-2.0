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
 * Decline quote validation schema
 */
const declineQuoteSchema = z.object({
    id: z.string().uuid('Invalid quote ID format'),
}).strict();

/**
 * Decline a quote
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Authorization: User can only decline their own quotes
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/decline-quote', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/decline-quote',
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
        const validation = validateRequest(declineQuoteSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/decline-quote',
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

        // 4. Update quote status to 'declined'
        const { error: updateError } = await supabase
            .from('quotes')
            .update({ status: 'declined' })
            .eq('id', id)
            .eq('user_id', user.id);

        if (updateError) {
            logger.logApiError('/api/decline-quote', updateError, { userId: user.id, quoteId: id });
            const response = NextResponse.json(
                { error: 'Failed to decline quote' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('Quote declined successfully', {
            endpoint: '/api/decline-quote',
            userId: user.id,
            quoteId: id,
        });

        const response = NextResponse.json({
            success: true,
            message: 'Quote declined successfully.'
        });
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/decline-quote', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
