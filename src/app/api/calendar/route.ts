import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';
import { refreshGoogleToken } from '@/lib/refresh-google-token';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let accessToken = authHeader.substring(7);

        // Get query parameters for date range
        const searchParams = request.nextUrl.searchParams;
        const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : undefined;
        const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : undefined;

        try {
            const events = await getCalendarEvents(accessToken, timeMin, timeMax);
            return NextResponse.json({ events });
        } catch (calendarError: any) {
            // If 401, attempt to refresh the token
            if (calendarError.code === 401 || calendarError.code === 403 || calendarError.message?.includes('invalid authentication credentials')) {
                // Get user ID to refresh token
                const supabase = await createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    return NextResponse.json(
                        { error: 'Invalid or expired authentication credentials' },
                        { status: 401 }
                    );
                }

                // Attempt to refresh the token
                const refreshed = await refreshGoogleToken(user.id);

                if (!refreshed) {
                    return NextResponse.json(
                        { error: 'Invalid or expired authentication credentials. Please reconnect your Google Calendar.' },
                        { status: 401 }
                    );
                }

                // Retry with the new access token
                try {
                    const events = await getCalendarEvents(refreshed.accessToken, timeMin, timeMax);
                    return NextResponse.json({ events });
                } catch (retryError) {
                    console.error('Calendar API error after refresh:', retryError);
                    return NextResponse.json(
                        { error: 'Failed to fetch calendar events after token refresh' },
                        { status: 500 }
                    );
                }
            }

            // Re-throw if not a 401 error
            throw calendarError;
        }
    } catch (error: any) {
        console.error('Calendar API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
}
