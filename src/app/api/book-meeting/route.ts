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
        // Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.BOOKING);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/book-meeting', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // Parse request body
        const body = await request.json();

        // Pass the action clearly
        const payload = {
            ...body,
            action: 'bookMeeting'
        };

        const BOOKING_WEBHOOK = process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL;

        if (!BOOKING_WEBHOOK) {
            logger.logError('Webhook URL not configured', new Error('Webhook URL not configured'), { endpoint: '/api/book-meeting' });
            return NextResponse.json(
                { error: 'Configuration error' },
                { status: 500 }
            );
        }

        const webhookResponse = await fetch(BOOKING_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!webhookResponse.ok) {
            logger.logWarning('n8n webhook returned error for booking', {
                endpoint: '/api/book-meeting',
                status: webhookResponse.status,
            });
            const response = NextResponse.json(
                { error: 'Failed to process booking' },
                { status: webhookResponse.status }
            );
            return addCorsHeaders(response, request);
        }

        const data = await webhookResponse.json();

        const response = NextResponse.json(data);
        return addCorsHeaders(response, request);

    } catch (error) {
        logger.logApiError('/api/book-meeting', error);

        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
