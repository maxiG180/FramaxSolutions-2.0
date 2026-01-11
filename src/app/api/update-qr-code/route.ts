import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, updateQrCodeSchema, sanitizeString } from '@/utils/validation';
import { logger } from '@/utils/logger';

export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Update an existing QR code
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required + Ownership verification
 */
export async function PUT(request: NextRequest) {
    try {
        // 1. Rate limiting
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.QR_CODE_UPDATE);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/update-qr-code', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/update-qr-code',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Validate request body
        const body = await request.json();
        const validation = validateRequest(updateQrCodeSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/update-qr-code',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { id, name, targetUrl } = validation.data;

        // 4. Sanitize name
        const sanitizedName = sanitizeString(name);

        // 5. Update with ownership verification (RLS handles this, but explicit check is better)
        const { data, error } = await supabase
            .from("qr_codes")
            .update({
                name: sanitizedName,
                target_url: targetUrl,
            })
            .eq("id", id)
            .eq("user_id", user.id) // Ownership check
            .select()
            .single();

        if (error) {
            // Check if it's a not found error (user doesn't own this QR code)
            if (error.code === 'PGRST116') {
                logger.logUnauthorizedAccess('/api/update-qr-code',
                    request.headers.get('x-forwarded-for') || undefined
                );
                logger.logInfo('QR code access denied - ownership check failed', {
                    userId: user.id,
                    qrCodeId: id
                });
                const response = NextResponse.json(
                    { error: 'QR code not found or access denied' },
                    { status: 404 }
                );
                return addCorsHeaders(response, request);
            }

            logger.logApiError('/api/update-qr-code', error, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to update QR code' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('QR code updated successfully', {
            endpoint: '/api/update-qr-code',
            userId: user.id,
            qrCodeId: id,
        });

        const response = NextResponse.json(data);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/update-qr-code', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
