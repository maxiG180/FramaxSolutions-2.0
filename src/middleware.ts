import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    let response: NextResponse;

    // Only run auth middleware on dashboard routes and login
    if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/login')) {
        const sessionResponse = await updateSession(request);
        response = sessionResponse || NextResponse.next();
    } else {
        response = NextResponse.next();
    }

    // Add security headers to all responses
    const headers = response.headers;

    // Content Security Policy - adjust as needed for your application
    headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.google.com https://maps.googleapis.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: https://maps.gstatic.com https://maps.googleapis.com; " +
        "frame-src https://accounts.google.com https://www.google.com https://maps.googleapis.com; " +
        // Allow connections to Supabase, Discord, Open-Meteo weather API, and Make.com webhooks
        "connect-src 'self' https://*.supabase.co https://discord.com https://*.open-meteo.com https://hook.eu1.make.com https://maps.googleapis.com;"
    );

    // Prevent clickjacking
    headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // XSS Protection (older browsers)
    headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    // Strict Transport Security (HTTPS only in production)
    if (process.env.NODE_ENV === 'production') {
        headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

