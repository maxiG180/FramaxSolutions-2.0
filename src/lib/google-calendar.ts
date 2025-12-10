import { google } from 'googleapis';

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    allDay?: boolean;
    meetLink?: string;
}

export async function getCalendarEvents(accessToken: string, timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin?.toISOString() || new Date().toISOString(),
            timeMax: timeMax?.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];

        return events.map((event) => ({
            id: event.id || '',
            title: event.summary || 'Untitled Event',
            start: event.start?.dateTime || event.start?.date || '',
            end: event.end?.dateTime || event.end?.date || '',
            description: event.description || undefined,
            location: event.location || undefined,
            allDay: !event.start?.dateTime,
            meetLink: event.hangoutLink || undefined,
        }));
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        throw error;
    }
}

export async function createCalendarEvent(
    accessToken: string,
    event: {
        title: string;
        start: string;
        end: string;
        description?: string;
        location?: string;
    }
): Promise<CalendarEvent> {
    try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: event.title,
                description: event.description,
                location: event.location,
                start: {
                    dateTime: event.start,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: event.end,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            },
        });

        const createdEvent = response.data;

        return {
            id: createdEvent.id || '',
            title: createdEvent.summary || 'Untitled Event',
            start: createdEvent.start?.dateTime || createdEvent.start?.date || '',
            end: createdEvent.end?.dateTime || createdEvent.end?.date || '',
            description: createdEvent.description || undefined,
            location: createdEvent.location || undefined,
            allDay: !createdEvent.start?.dateTime,
        };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}
