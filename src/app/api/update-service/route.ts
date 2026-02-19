import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { validateRequest, updateServiceSchema } from '@/utils/validation';
import { logger } from '@/utils/logger';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Update an existing service
 * Rate limited: 10 requests per minute per IP
 * Authentication: Required (Supabase session)
 * Validation: Strict Zod schema with input sanitization
 * Authorization: User can only update their own services
 */
export async function PUT(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/update-service', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/update-service',
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
        const validation = validateRequest(updateServiceSchema, body);

        if (!validation.success) {
            logger.logInvalidInput(
                '/api/update-service',
                validation.error,
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
            return addCorsHeaders(response, request);
        }

        const { id, title, description, billing_type, price_type, base_price, recurring_interval, currency, category, icon, included_service_ids } = validation.data;

        // 4. Build update object with only provided fields (React handles XSS protection when rendering)
        const updateData: any = {};

        if (title !== undefined) {
            updateData.title = title;
        }
        if (description !== undefined) {
            updateData.description = description || null;
        }
        if (billing_type !== undefined) {
            updateData.billing_type = billing_type;
        }
        if (price_type !== undefined) {
            updateData.price_type = price_type;
        }
        if (base_price !== undefined) {
            updateData.base_price = base_price;
        }
        if (recurring_interval !== undefined) {
            updateData.recurring_interval = recurring_interval;
        }
        if (currency !== undefined) {
            updateData.currency = currency;
        }
        if (category !== undefined) {
            updateData.category = category || null;
        }
        if (icon !== undefined) {
            updateData.icon = icon || null;
        }

        // 5. Update service in database (RLS policies ensure user can only update their own services)
        const { data, error } = await supabase
            .from("services")
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id) // Extra security: ensure user owns this service
            .select()
            .single();

        if (error) {
            // Check if service doesn't exist or user doesn't own it
            if (error.code === 'PGRST116') {
                logger.logUnauthorizedAccess('/api/update-service', undefined);
                logger.logInfo('Service access denied - ownership check failed', {
                    userId: user.id,
                    serviceId: id,
                });
                const response = NextResponse.json(
                    { error: 'Service not found or access denied' },
                    { status: 404 }
                );
                return addCorsHeaders(response, request);
            }

            logger.logApiError('/api/update-service', error, { userId: user.id, serviceId: id });
            const response = NextResponse.json(
                { error: 'Failed to update service' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 6. Update service inclusions if provided
        if (included_service_ids !== undefined) {
            // Delete existing inclusions
            await supabase
                .from('service_inclusions')
                .delete()
                .eq('parent_service_id', id);

            // Insert new inclusions if any
            if (included_service_ids.length > 0) {
                const inclusions = included_service_ids.map(includedId => ({
                    parent_service_id: id,
                    included_service_id: includedId,
                }));

                const { error: inclusionError } = await supabase
                    .from('service_inclusions')
                    .insert(inclusions);

                if (inclusionError) {
                    logger.logApiError('/api/update-service', inclusionError, {
                        userId: user.id,
                        serviceId: id,
                        message: 'Failed to update service inclusions'
                    });
                    // Don't fail the entire request, just log the error
                }
            }
        }

        logger.logInfo('Service updated successfully', {
            endpoint: '/api/update-service',
            userId: user.id,
            serviceId: id,
            includedServicesCount: included_service_ids?.length || 0,
        });

        const response = NextResponse.json(data);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/update-service', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
