import { google } from 'googleapis';
import { createClient } from '@/utils/supabase/server';

export async function refreshGoogleToken(userId: string): Promise<{ accessToken: string; refreshToken?: string } | null> {
    const supabase = await createClient();

    // Get the user's refresh token from database
    const { data: profile } = await supabase
        .from('profiles')
        .select('google_calendar_refresh_token')
        .eq('id', userId)
        .single();

    if (!profile?.google_calendar_refresh_token) {
        return null;
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: profile.google_calendar_refresh_token
        });

        // Refresh the access token
        const { credentials } = await oauth2Client.refreshAccessToken();

        if (!credentials.access_token) {
            return null;
        }

        // Update the database with new tokens
        const updateData: any = {
            google_calendar_token: credentials.access_token,
            updated_at: new Date().toISOString(),
        };

        // Some providers rotate refresh tokens
        if (credentials.refresh_token) {
            updateData.google_calendar_refresh_token = credentials.refresh_token;
        }

        await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        return {
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token || profile.google_calendar_refresh_token
        };
    } catch (error) {
        console.error('Failed to refresh Google token:', error);
        return null;
    }
}
