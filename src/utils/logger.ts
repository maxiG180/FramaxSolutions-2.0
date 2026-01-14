/**
 * Security event logger
 * Simple console-based logger that can be easily upgraded to Sentry/LogRocket
 */

export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    SECURITY = 'security',
}

export enum SecurityEventType {
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    INVALID_INPUT = 'invalid_input',
    UNAUTHORIZED_ACCESS = 'unauthorized_access',
    DISCOUNT_CODE_VALIDATED = 'discount_code_validated',
    DISCOUNT_CODE_INVALID = 'discount_code_invalid',
    DISCOUNT_CODE_REDEEMED = 'discount_code_redeemed',
    AUTHENTICATION_FAILED = 'authentication_failed',
    OAUTH_CALLBACK_SUCCESS = 'oauth_callback_success',
    OAUTH_CALLBACK_FAILED = 'oauth_callback_failed',
    CRON_EXECUTION = 'cron_execution',
    API_ERROR = 'api_error',
}

interface LogContext {
    endpoint?: string;
    ip?: string;
    userId?: string;
    errorMessage?: string;
    [key: string]: any;
}

const isDev = process.env.NODE_ENV === 'development';

class SecurityLogger {
    /**
     * Log security event
     */
    logSecurityEvent(eventType: SecurityEventType, context: LogContext = {}): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: LogLevel.SECURITY,
            eventType,
            ...context,
        };

        // Console logging (only in development)
        if (isDev) {
            console.log(`[SECURITY] ${eventType}`, logEntry);
        }

        // TODO: Integration point for Sentry/LogRocket
        // if (process.env.SENTRY_DSN) {
        //   Sentry.captureMessage(`Security Event: ${eventType}`, {
        //     level: 'info',
        //     extra: logEntry,
        //   });
        // }
    }

    /**
     * Log error
     */
    logError(message: string, error: Error | unknown, context: LogContext = {}): void {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        const logEntry = {
            timestamp,
            level: LogLevel.ERROR,
            message,
            errorMessage,
            errorStack,
            ...context,
        };

        if (isDev) {
            console.error(`[ERROR] ${message}`, logEntry);
        }

        // TODO: Integration point for Sentry
        // if (process.env.SENTRY_DSN) {
        //   Sentry.captureException(error, { extra: context });
        // }
    }

    /**
     * Log warning
     */
    logWarning(message: string, context: LogContext = {}): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: LogLevel.WARN,
            message,
            ...context,
        };

        if (isDev) {
            console.warn(`[WARNING] ${message}`, logEntry);
        }
    }

    /**
     * Log info (general application events)
     */
    logInfo(message: string, context: LogContext = {}): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: LogLevel.INFO,
            message,
            ...context,
        };

        if (isDev) {
            console.log(`[INFO] ${message}`, logEntry);
        }
    }

    /**
     * Log rate limit event
     */
    logRateLimit(endpoint: string, ip: string): void {
        this.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
            endpoint,
            ip,
        });
    }

    /**
     * Log failed validation
     */
    logInvalidInput(endpoint: string, error: string, ip?: string): void {
        this.logSecurityEvent(SecurityEventType.INVALID_INPUT, {
            endpoint,
            errorMessage: error,
            ip,
        });
    }

    /**
     * Log unauthorized access attempt
     */
    logUnauthorizedAccess(endpoint: string, ip?: string): void {
        this.logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
            endpoint,
            ip,
        });
    }

    /**
     * Log API errors (sanitized for production)
     */
    logApiError(endpoint: string, error: Error | unknown, context: LogContext = {}): void {
        this.logError(`API Error at ${endpoint}`, error, {
            endpoint,
            ...context,
        });

        this.logSecurityEvent(SecurityEventType.API_ERROR, {
            endpoint,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            ...context,
        });
    }
}

// Export singleton instance
export const logger = new SecurityLogger();

