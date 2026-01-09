import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { validateRequest } from '@/utils/validation';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Delete service validation schema
 */
const deleteServiceSchema = z.object({
    id: z.string().uuid('Invalid service ID format'),
}).strict();

/**
 * Delete a service
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Authorization: User can only delete their own services
 */
export async function DELETE(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/delete-service', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/delete-service',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Parse and validate request body
        const body = await request.json();
        const validation = validateRequest(deleteServiceSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/delete-service',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { id } = validation.data;

        // 4. Delete service from database (RLS policies ensure user can only delete their own services)
        const { error } = await supabase
            .from("services")
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Extra security: ensure user owns this service

        if (error) {
            logger.logApiError('/api/delete-service', error, { userId: user.id, serviceId: id });
            const response = NextResponse.json(
                { error: 'Failed to delete service' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        logger.logInfo('Service deleted successfully', {
            endpoint: '/api/delete-service',
            userId: user.id,
            serviceId: id,
        });

        const response = NextResponse.json({ success: true });
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/delete-service', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
