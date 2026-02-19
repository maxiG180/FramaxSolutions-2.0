import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, createServiceSchema } from '@/utils/validation';
import { logger } from '@/utils/logger';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Create a new service
 * Rate limited: 5 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Validation: Strict Zod schema with input sanitization
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.QR_CODE_CREATE);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/create-service', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check (CSRF protection via Supabase session)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/create-service',
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
        const validation = validateRequest(createServiceSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/create-service',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { title, description, billing_type, price_type, base_price, recurring_interval, currency, category, icon, included_service_ids } = validation.data;

        // 4. Insert service into database (React handles XSS protection when rendering text)
        const { data, error } = await supabase
            .from("services")
            .insert({
                user_id: user.id,
                title,
                description: description || null,
                billing_type,
                price_type,
                base_price: base_price ?? null,
                recurring_interval: recurring_interval ?? null,
                currency: currency || 'EUR',
                category: category || null,
                icon: icon || 'Layers',
            })
            .select()
            .single();

        if (error) {
            logger.logApiError('/api/create-service', error, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to create service' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 5. Insert service inclusions if any
        if (included_service_ids && included_service_ids.length > 0) {
            const inclusions = included_service_ids.map(includedId => ({
                parent_service_id: data.id,
                included_service_id: includedId,
            }));

            const { error: inclusionError } = await supabase
                .from('service_inclusions')
                .insert(inclusions);

            if (inclusionError) {
                logger.logApiError('/api/create-service', inclusionError, {
                    userId: user.id,
                    serviceId: data.id,
                    message: 'Failed to create service inclusions'
                });
                // Don't fail the entire request, just log the error
            }
        }

        logger.logInfo('Service created successfully', {
            endpoint: '/api/create-service',
            userId: user.id,
            serviceId: data.id,
            includedServicesCount: included_service_ids?.length || 0,
        });

        const response = NextResponse.json(data);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/create-service', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
