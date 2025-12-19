import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';
import { refreshGoogleToken } from '@/lib/refresh-google-token';
import { createClient } from '@/utils/supabase/server';
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger, SecurityEventType } from '@/utils/logger';

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.CALENDAR);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/calendar', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.logUnauthorizedAccess('/api/calendar');
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            return addCorsHeaders(response, request);
        }

        let accessToken = authHeader.substring(7);

        // Get query parameters for date range
        const searchParams = request.nextUrl.searchParams;
        const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : undefined;
        const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : undefined;

        try {
            const events = await getCalendarEvents(accessToken, timeMin, timeMax);
            const response = NextResponse.json({ events });
            return addCorsHeaders(response, request);
        } catch (calendarError: any) {
            // If 401, attempt to refresh the token
            if (calendarError.code === 401 || calendarError.code === 403 || calendarError.message?.includes('invalid authentication credentials')) {
                // Get user ID to refresh token
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    logger.logSecurityEvent(SecurityEventType.AUTHENTICATION_FAILED, {
                        endpoint: '/api/calendar',
                        reason: 'no_user_session',
                    });

                    const response = NextResponse.json(
                        { error: 'Invalid or expired authentication credentials' },
                        { status: 401 }
                    );
                    return addCorsHeaders(response, request);
                }

                // Attempt to refresh the token
                const refreshed = await refreshGoogleToken(user.id);

                if (!refreshed) {
                    logger.logSecurityEvent(SecurityEventType.AUTHENTICATION_FAILED, {
                        endpoint: '/api/calendar',
                        userId: user.id,
                        reason: 'token_refresh_failed',
                    });

                    const response = NextResponse.json(
                        { error: 'Invalid or expired authentication credentials. Please reconnect your Google Calendar.' },
                        { status: 401 }
                    );
                    return addCorsHeaders(response, request);
                }

                // Retry with the new access token
                try {
                    const events = await getCalendarEvents(refreshed.accessToken, timeMin, timeMax);
                    const response = NextResponse.json({ events });
                    return addCorsHeaders(response, request);
                } catch (retryError) {
                    logger.logApiError('/api/calendar', retryError, { userId: user.id });
                    const response = NextResponse.json(
                        { error: 'Failed to fetch calendar events after token refresh' },
                        { status: 500 }
                    );
                    return addCorsHeaders(response, request);
                }
            }

            // Re-throw if not a 401 error
            throw calendarError;
        }
    } catch (error: any) {
        logger.logApiError('/api/calendar', error);
        const response = NextResponse.json(
            { error: error.message || 'Failed to fetch calendar events' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}

