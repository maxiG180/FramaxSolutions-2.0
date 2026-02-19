import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { addCorsHeaders, handleCorsPreFlight } from '@/utils/cors';
import { logger } from '@/utils/logger';

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const preflightResponse = handleCorsPreFlight(request);
    return preflightResponse || new NextResponse(null, { status: 200 });
}

/**
 * Get all services
 * Rate limited: 20 requests per minute per IP
 * Authentication: Required (Supabase session)
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Rate limiting (IP-based)
        const rateLimitResponse = rateLimit(request, RATE_LIMITS.API_CALL);
        if (rateLimitResponse) {
            const forwarded = request.headers.get('x-forwarded-for');
            const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
            logger.logRateLimit('/api/services', ip);
            return addCorsHeaders(rateLimitResponse, request);
        }

        // 2. Authentication check
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            logger.logUnauthorizedAccess(
                '/api/services',
                request.headers.get('x-forwarded-for') || undefined
            );
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            return addCorsHeaders(response, request);
        }

        // 3. Fetch services from database with included services
        const { data: services, error } = await supabase
            .from("services")
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.logApiError('/api/services', error, { userId: user.id });
            const response = NextResponse.json(
                { error: 'Failed to fetch services' },
                { status: 500 }
            );
            return addCorsHeaders(response, request);
        }

        // 4. Fetch included services for each service
        const servicesWithInclusions = await Promise.all(
            (services || []).map(async (service) => {
                const { data: inclusions } = await supabase
                    .from('service_inclusions')
                    .select('included_service_id')
                    .eq('parent_service_id', service.id);

                if (!inclusions || inclusions.length === 0) {
                    return { ...service, included_services: [] };
                }

                const includedServiceIds = inclusions.map(inc => inc.included_service_id);
                const { data: includedServices } = await supabase
                    .from('services')
                    .select('*')
                    .in('id', includedServiceIds);

                return {
                    ...service,
                    included_services: includedServices || []
                };
            })
        );

        logger.logInfo('Services fetched successfully', {
            endpoint: '/api/services',
            userId: user.id,
            count: servicesWithInclusions?.length || 0,
        });

        const response = NextResponse.json(servicesWithInclusions || []);
        return addCorsHeaders(response, request);

    } catch (error: any) {
        logger.logApiError('/api/services', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, request);
    }
}
