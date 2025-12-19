import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS configuration based on environment
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
    const allowedOrigins = getAllowedOrigins();

    // Check if origin is allowed
    const isAllowed = origin && allowedOrigins.some((allowed) => {
        if (allowed.includes('*')) {
            // Handle wildcard patterns like *.vercel.app
            const pattern = allowed.replace('*.', '');
            return origin.endsWith(pattern);
        }
        return origin === allowed;
    });

    if (!isAllowed) {
        return {}; // No CORS headers for disallowed origins
    }

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
    };
}

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(): string[] {
    const env = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL_ENV;

    const origins: string[] = [];

    // Production domains
    if (env === 'production' || vercelEnv === 'production') {
        origins.push('https://framaxsolutions.com'); // Added based on user's mention
        origins.push('https://www.framaxsolutions.com');
    }

    // Development domains
    if (env === 'development') {
        origins.push('http://localhost:3000');
        origins.push('http://localhost:3001');
    }

    // Vercel preview domains
    if (vercelEnv === 'preview') {
        origins.push('*.vercel.app');
    }

    return origins;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse | null {
    if (request.method === 'OPTIONS') {
        const origin = request.headers.get('origin');
        const corsHeaders = getCorsHeaders(origin);

        return NextResponse.json({}, { status: 200, headers: corsHeaders });
    }

    return null; // Not a preflight request
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}
