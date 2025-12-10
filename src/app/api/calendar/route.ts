import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = authHeader.substring(7);

        // Get query parameters for date range
        const searchParams = request.nextUrl.searchParams;
        const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : undefined;
        const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : undefined;

        const events = await getCalendarEvents(accessToken, timeMin, timeMax);

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error('Calendar API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch calendar events' },
            { status: 500 }
        );
    }
}
