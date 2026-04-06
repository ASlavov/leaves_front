export default async function retryFetch<T = unknown>(
  url: string,
  options: Record<string, unknown> = {},
  retries: number = 3,
  delay: number = 1000,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      // $fetch automatically throws on 4xx and 5xx errors
      const response = (await $fetch(url, options)) as T;

      // If the API explicitly returns 200 OK but packages errors inside the body:
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
      // Retrieve the HTTP Status Code from the thrown FetchError
      const status = (error as any).response?.status || (error as any).statusCode;

      // Do NOT retry client errors (400s)
      if (status === 401) {
        console.error('Authentication Error: 401');
        await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        
        if (import.meta.client) {
          const currentPath = window.location.pathname;
          // Do NOT redirect if we are already on the auth pages or if this is an explicit login attempt
          if (!currentPath.includes('/auth/login') && !url.includes('/api/auth/login')) {
            window.location.href = '/auth/login';
          }
        }
        throw error; // Immediately break and throw the error back to the caller
      }

      if (status === 403) {
        console.error('Authorization Error: 403 Forbidden');
        throw error; // Break and throw, but do NOT logout
      }

      if (status === 400 || status === 422) {
        throw error; // Don't retry client errors
      }

      // Only retry on network errors or 500s. Rethrow if it's the last attempt.
      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Fetch failed after maximum retries');
}
