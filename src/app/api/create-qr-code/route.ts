import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, createQrCodeSchema, sanitizeString } from '@/utils/validation';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Create a new QR code
 * Rate limited: 5 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Validation: Strict Zod schema with URL security checks
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.QR_CODE_CREATE);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/create-qr-code', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check (CSRF protection via Supabase session)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/create-qr-code',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Parse and validate request body with strict Zod schema
        const body = await request.json();
        const validation = validateRequest(createQrCodeSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/create-qr-code',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { name, targetUrl } = validation.data;

        // 4. Sanitize name for XSS protection (URLs already validated by schema)
        const sanitizedName = sanitizeString(name);

        // 5. Generate cryptographically secure slug (not Math.random!)
        const slug = crypto.randomBytes(4).toString('hex'); // 8 character hex string

        // 6. Insert QR code into database
        const { data, error } = await supabase
            .from("qr_codes")
            .insert({
                user_id: user.id,
                name: sanitizedName,
                target_url: targetUrl, // Already validated as safe HTTPS URL
                slug,
            })
            .select()
            .single();

        if (error) {
            logger.logApiError('/api/create-qr-code', error, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to create QR code' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('QR code created successfully', {
            endpoint: '/api/create-qr-code',
            userId: user.id,
            qrCodeId: data.id,
        });

        const response = NextResponse.json(data);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/create-qr-code', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
