// In-flight deduplication: concurrent calls with the same key share one Promise.
// This eliminates the duplicate simultaneous requests observed across all stores
// (getAllUsers 14x, getAllForAllUsers 11x, departments/getAll 8x, etc.)
const inFlight = new Map<string, Promise<unknown>>();

async function doFetch<T>(
  url: string,
  options: Record<string, unknown>,
  retries: number,
  delay: number,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = (await $fetch(url, options)) as T;

      if (response && typeof response === 'object' && 'statusCode' in response) {
        const resp = response as { statusCode: number };
        if (resp.statusCode === 401) {
          await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
          throw new Error('Unauthorized');
        }
        if (resp.statusCode === 403) {
          throw new Error('Forbidden');
        }
      }

      return response;
    } catch (error: any) {
      const status = (error as any).response?.status || (error as any).statusCode;

      if (status === 401) {
        console.error('Authentication Error: 401');
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        if (import.meta.client) {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/auth/login') && !url.includes('/api/auth/login')) {
            window.location.href = '/auth/login';
          }
        }
        throw error;
      }

      if (status === 403) {
        console.error('Authorization Error: 403 Forbidden');
        throw error;
      }

      if (status === 400 || status === 422) {
        throw error;
      }

      const method = ((options.method as string) || 'GET').toUpperCase();
      if (['POST', 'PATCH'].includes(method) && status) {
        throw error;
      }

      if (i === retries - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Fetch failed after maximum retries');
}

export default function retryFetch<T = unknown>(
  url: string,
  options: Record<string, unknown> = {},
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  // Build a stable dedup key. Body is included so POST /entitlement/get?userId=1
  // and POST /entitlement/get?userId=2 are correctly treated as distinct.
  const key = `${((options.method as string) || 'GET').toUpperCase()}:${url}:${JSON.stringify(options.body ?? null)}`;

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = doFetch<T>(url, options, retries, delay).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
