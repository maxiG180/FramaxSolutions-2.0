import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';
import { validateRequest, checkAvailabilitySchema } from '@/utils/validation';

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting (use calendar limit since it's similar usage)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.CALENDAR);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/check-availability', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(checkAvailabilitySchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/check-availability',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { date } = validation.data;

        // Call n8n unified webhook (server-side only)
        const BOOKING_WEBHOOK = process.env.BOOKING_WEBHOOK_URL;

        if (!BOOKING_WEBHOOK) {
            // Fail gracefully if not configured
            return NextResponse.json({ busySlots: [] });
        }



        const webhookResponse = await fetch(BOOKING_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date,
                action: 'checkAvailability'
            }),
        });

        if (!webhookResponse.ok) {
            await webhookResponse.text();

            logger.logWarning('n8n webhook returned error', {
                endpoint: '/api/check-availability',
                status: webhookResponse.status,
            });

            // Return empty busy slots on error
            const response = NextResponse.json({ busySlots: [] });
            return addCorsHeaders(response, request);
        }

        const data = await webhookResponse.json();

        // Return the busy slots data
        const response = NextResponse.json({
            busySlots: data.busySlots || []
        });
        return addCorsHeaders(response, request);

    } catch (error) {
        logger.logApiError('/api/check-availability', error);

        // Fail gracefully - return empty busy slots
        const response = NextResponse.json({ busySlots: [] });
        return addCorsHeaders(response, request);
    }
}
