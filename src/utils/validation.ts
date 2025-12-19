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
