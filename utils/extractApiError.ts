export interface ApiError {
  type: 'user' | 'app' | 'auth';
  /** Backend-provided human-readable message. Only present for type === 'user'. */
  message: string | null;
}

/**
 * Extract a typed error envelope from a FetchError thrown by retryFetch.
 *
 * Usage in components:
 *   } catch (error) {
 *     const { type, message } = extractApiError(error);
 *     if (type === 'user' && message) {
 *       $toast.error(message);
 *     } else {
 *       $toast.error(t('errors.something.genericKey'));
 *     }
 *   }
 */
export function extractApiError(error: unknown): ApiError {
  if (!error || typeof error !== 'object') {
    return { type: 'app', message: null };
  }

  const err = error as Record<string, unknown>;
  const response = err.response as Record<string, unknown> | undefined;
  const status: number = (response?.status as number) ?? (err.statusCode as number) ?? 0;

  if (status === 401 || status === 403) {
    return { type: 'auth', message: null };
  }

  // H3 wraps our { type, message } envelope inside error.data.data
  // (because createError({ data: X }) makes X accessible as response_body.data)
  const data = err.data as Record<string, unknown> | undefined;
  const envelope =
    (data?.data as Record<string, unknown>) ?? (data as Record<string, unknown>) ?? {};

  if (envelope.type === 'user') {
    return { type: 'user', message: (envelope.message as string) ?? null };
  }

  return { type: 'app', message: null };
}
