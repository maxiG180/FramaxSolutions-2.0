import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { saveGoogleCalendarToken } from '@/app/dashboard/settings/actions';
import { getURL } from '@/utils/getURL';
import { logger, SecurityEventType } from '@/utils/logger';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        // TODO: Add state parameter verification for CSRF protection
        // const state = searchParams.get('state');

        if (error) {
            // User denied access
            logger.logSecurityEvent(SecurityEventType.OAUTH_CALLBACK_FAILED, {
                endpoint: '/api/auth/google/callback',
                reason: 'user_denied_access',
            });
            return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&error=access_denied', request.url));
        }

        if (!code) {
            logger.logSecurityEvent(SecurityEventType.OAUTH_CALLBACK_FAILED, {
                endpoint: '/api/auth/google/callback',
                reason: 'missing_code',
            });
            return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&error=missing_code', request.url));
        }

        // Exchange the authorization code for tokens
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token) {
            logger.logSecurityEvent(SecurityEventType.OAUTH_CALLBACK_FAILED, {
                endpoint: '/api/auth/google/callback',
                reason: 'no_access_token',
            });
            return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&error=no_access_token', request.url));
        }

        // Save both access token and refresh token to the database
        await saveGoogleCalendarToken(
            tokens.access_token,
            tokens.refresh_token || undefined
        );

        logger.logSecurityEvent(SecurityEventType.OAUTH_CALLBACK_SUCCESS, {
            endpoint: '/api/auth/google/callback',
        });

        // Redirect back to settings with success
        return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&success=calendar_connected', request.url));
    } catch (error) {
        logger.logApiError('/api/auth/google/callback', error);
        logger.logSecurityEvent(SecurityEventType.OAUTH_CALLBACK_FAILED, {
            endpoint: '/api/auth/google/callback',
            reason: 'exception',
        });
        return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&error=callback_failed', request.url));
    }
}

