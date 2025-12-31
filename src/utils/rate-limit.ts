import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limit store (upgrade to Redis for production scaling)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number; // Time window in milliseconds
}

/**
 * Rate limiting middleware
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns NextResponse or null if rate limit not exceeded
 */
export function rateLimit(request: NextRequest, config: RateLimitConfig): NextResponse | null {
    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Create unique key for this IP and endpoint
    const endpoint = request.nextUrl.pathname;
    const key = `${ip}:${endpoint}`;

    const now = Date.now();
    const limitData = rateLimitStore.get(key);

    if (!limitData || now > limitData.resetTime) {
        // First request or window has reset
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return null; // Allow request
    }

    if (limitData.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);

        return NextResponse.json(
            {
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
                },
            }
        );
    }

    // Increment count
    limitData.count += 1;
    rateLimitStore.set(key, limitData);

    return null; // Allow request
}

/**
 * Global rate limiter - applies to all endpoints
 */
export function globalRateLimit(request: NextRequest): NextResponse | null {
    return rateLimit(request, {
        maxRequests: 60, // 60 requests per minute globally
        windowMs: 60 * 1000,
    });
}

/**
 * Rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
    VALIDATE_DISCOUNT: {
        maxRequests: 5,
        windowMs: 60 * 1000, // 5 per minute
    },
    SEND_DISCOUNT: {
        maxRequests: 2,
        windowMs: 60 * 1000, // 2 per minute (strict)
    },
    REDEEM_DISCOUNT: {
        maxRequests: 3,
        windowMs: 60 * 1000, // 3 per minute
    },
    CALENDAR: {
        maxRequests: 10,
        windowMs: 60 * 1000, // 10 per minute
    },
    BOOKING: {
        maxRequests: 5,
        windowMs: 60 * 1000, // 5 per minute
    },
} as const;
