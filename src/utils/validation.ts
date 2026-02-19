import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email is too long');

/**
 * Discount code validation schema
 * Format: FRAMAX-XXXXXXXX (where X is alphanumeric)
 */
export const discountCodeSchema = z
    .string()
    .min(1, 'Discount code is required')
    .regex(/^FRAMAX-[A-Z0-9]{8}$/, 'Invalid discount code format')
    .max(50, 'Discount code is too long');

/**
 * Send discount request validation
 */
export const sendDiscountSchema = z.object({
    email: emailSchema,
    company: z.string().min(1, 'Company name is required').max(200, 'Company name is too long'),
    role: z.string().min(1, 'Role is required').max(100, 'Role is too long'),
    teamSize: z.string().min(1, 'Team size is required').max(50, 'Team size is too long'),
    challenge: z.string().min(1, 'Challenge is required').max(1000, 'Challenge description is too long'),
});

/**
 * Validate discount code request
 */
export const validateDiscountRequestSchema = z.object({
    code: discountCodeSchema,
});

/**
 * Redeem discount code request
 */
export const redeemDiscountRequestSchema = z.object({
    code: discountCodeSchema,
});

/**
 * Booking form validation (for future use)
 */
export const bookingSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    email: emailSchema,
    company: z.string().min(1, 'Company is required').max(200, 'Company is too long'),
    phone: z.string().min(1, 'Phone is required').max(50, 'Phone is too long'),
    message: z.string().max(2000, 'Message is too long').optional(),
    promoCode: discountCodeSchema.optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
});

/**
 * Generic validation helper
 */
export function validateRequest<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: string } {
    try {
        const validated = schema.parse(data);
        return { success: true, data: validated };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return first error message for user-friendly response
            const firstError = error.issues[0];
            return {
                success: false,
                error: firstError.message,
            };
        }
        return {
            success: false,
            error: 'Invalid request data',
        };
    }
}

/**
 * Sanitize string input to prevent XSS
 * Basic sanitization - escapes HTML entities
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate Discord webhook URL format
 */
export const discordWebhookSchema = z
    .string()
    .url('Invalid webhook URL')
    .regex(
        /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/,
        'Invalid Discord webhook URL format'
    );

/**
 * QR Code URL validation - strict HTTPS-only with security checks
 * Prevents XSS, phishing, and open redirect attacks
 */
export const qrCodeUrlSchema = z
    .string()
    .min(1, 'URL is required')
    .max(2048, 'URL exceeds maximum length')
    .url('Invalid URL format')
    .refine((url) => {
        try {
            const parsed = new URL(url);

            // Only allow HTTPS (or HTTP for localhost development)
            if (parsed.protocol !== 'https:' &&
                !(parsed.protocol === 'http:' && parsed.hostname === 'localhost')) {
                return false;
            }

            // Block dangerous protocols that might bypass URL validation
            const blockedPatterns = [
                'javascript:',
                'data:',
                'vbscript:',
                'file:',
                'about:',
            ];

            const urlLower = url.toLowerCase();
            if (blockedPatterns.some(pattern => urlLower.includes(pattern))) {
                return false;
            }

            // Block control characters (potential for filter bypass)
            if (/[\x00-\x1f\x7f-\x9f]/.test(url)) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }, 'URL must be a valid HTTPS URL');

/**
 * QR Code name validation
 * Allows alphanumeric, spaces, hyphens, underscores only
 */
export const qrCodeNameSchema = z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name exceeds maximum length')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores');

/**
 * Create QR Code request validation
 */
export const createQrCodeSchema = z.object({
    name: qrCodeNameSchema,
    targetUrl: qrCodeUrlSchema,
}).strict(); // Reject any additional fields

/**
 * Update QR Code request validation
 */
export const updateQrCodeSchema = z.object({
    id: z.string().uuid('Invalid QR code ID format'),
    name: qrCodeNameSchema,
    targetUrl: qrCodeUrlSchema,
}).strict();

/**
 * Enhanced booking validation with action verification
 */
export const bookMeetingSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Name is too long')
        // Allow letters (including unicode), spaces, hyphens, and apostrophes
        .regex(/^[a-zA-Z\u00C0-\u00FF\s\-']+$/, 'Name contains invalid characters'),
    email: emailSchema,
    notes: z.string()
        .max(2000, 'Notes are too long')
        .optional()
        .default(''),
    date: z.string()
        .min(1, 'Date is required')
        .datetime('Invalid date format'),
    time: z.string()
        .min(1, 'Time is required')
        // Allow 12-hour (09:00 AM) or 24-hour (14:00) format
        .regex(/^(\d{2}:\d{2}\s(AM|PM)|\d{2}:\d{2})$/, 'Invalid time format'),
    action: z.literal('bookMeeting'), // Prevent action injection
    language: z.enum(['pt', 'en'])
        .optional()
        .default('pt'), // Default to Portuguese if not provided
}).strict();

/**
 * Check availability validation
 */
export const checkAvailabilitySchema = z.object({
    date: z.string()
        .min(1, 'Date is required')
        .datetime('Invalid date format'),
    action: z.literal('checkAvailability'),
}).strict();

/**
 * Service validation schemas
 */
export const billingTypeSchema = z.enum(['One-Time', 'Recurring']);
export const priceTypeSchema = z.enum(['Fixed', 'Starting From', 'Custom Quote']);
export const recurringIntervalSchema = z.enum(['Monthly', 'Quarterly', 'Yearly']);

export const serviceTitleSchema = z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .regex(/^[a-zA-Z0-9\s\-&,.()]+$/, 'Title contains invalid characters');

export const basePriceSchema = z
    .number()
    .min(0, 'Price must be a positive number')
    .max(1000000, 'Price is too high')
    .nullable();

export const createServiceSchema = z.object({
    title: serviceTitleSchema,
    description: z.string()
        .max(1000, 'Description is too long')
        .optional(),
    billing_type: billingTypeSchema,
    price_type: priceTypeSchema,
    base_price: basePriceSchema.optional(),
    recurring_interval: recurringIntervalSchema.nullable().optional(),
    currency: z.string()
        .length(3, 'Currency must be a 3-letter code')
        .optional()
        .default('EUR'),
    category: z.string()
        .max(100, 'Category is too long')
        .optional(),
    icon: z.string()
        .max(50, 'Icon name is too long')
        .optional()
        .default('Layers'),
    included_service_ids: z.array(z.string().uuid('Invalid service ID format'))
        .max(20, 'Too many included services')
        .optional(),
}).strict();

export const updateServiceSchema = z.object({
    id: z.string().uuid('Invalid service ID format'),
    title: serviceTitleSchema.optional(),
    description: z.string()
        .max(1000, 'Description is too long')
        .optional()
        .nullable(),
    billing_type: billingTypeSchema.optional(),
    price_type: priceTypeSchema.optional(),
    base_price: basePriceSchema.optional(),
    recurring_interval: recurringIntervalSchema.nullable().optional(),
    currency: z.string()
        .length(3, 'Currency must be a 3-letter code')
        .optional(),
    category: z.string()
        .max(100, 'Category is too long')
        .optional()
        .nullable(),
    icon: z.string()
        .max(50, 'Icon name is too long')
        .optional()
        .nullable(),
    included_service_ids: z.array(z.string().uuid('Invalid service ID format'))
        .max(20, 'Too many included services')
        .optional(),
}).strict();
