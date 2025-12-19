import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';

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

        // Parse request body
        const body = await request.json();
        const { date } = body;

        if (!date) {
            const response = NextResponse.json(
                { error: 'Date is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        // Call Make.com webhook server-side (no CORS issues)
        const AVAILABILITY_WEBHOOK = process.env.MAKE_AVAILABILITY_WEBHOOK ||
            'http://localhost:5678/webhook-test/3024bbce-3535-44e9-a5b2-5e1a32b54711';

        const webhookResponse = await fetch(AVAILABILITY_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date }),
        });

        if (!webhookResponse.ok) {
            logger.logWarning('Make.com webhook returned error', {
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
