import { createError } from 'h3';

/**
 * Normalize a $fetch error from a Laravel backend call into a typed H3 error.
 *
 * - 4xx (excluding 401/403): user-facing business/validation errors
 *   → forward the original status + a normalized { type: 'user', message } envelope
 * - 401 / 403: auth errors
 *   → rethrow as-is so retryFetch handles the logout flow
 * - 5xx / network errors: infrastructure failures
 *   → generic 500, nothing leaked to the client
 */
export function proxyError(error: any): never {
    const status: number = error.response?.status ?? error.statusCode ?? 500;
    const laravelBody: any = error.data ?? {};

    // Auth errors — retryFetch already handles logout; just preserve status
    if (status === 401) {
        throw createError({ statusCode: status, statusMessage: 'Unauthorized' });
    }

    // Client / business errors (400, 403, 409, 422, etc.)
    if (status >= 400 && status < 500) {
        let message: string | null = null;

        if (typeof laravelBody.message === 'string') {
            message = laravelBody.message;
        } else if (typeof laravelBody.error === 'string') {
            // { "error": "You must exhaust your Paid Leave balance..." }
            message = laravelBody.error;
        } else if (laravelBody.errors && typeof laravelBody.errors === 'object') {
            // { "errors": { "field": ["msg", ...] } }
            const first = Object.values(laravelBody.errors)[0];
            message = Array.isArray(first) ? (first[0] as string) : String(first);
        }

        throw createError({
            statusCode: status,
            statusMessage: 'User Error',
            data: { type: 'user', message },
        });
    }

    // Server / infrastructure errors — hide internals from client
    throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { type: 'app', message: null },
    });
}
