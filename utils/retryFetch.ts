export default async function retryFetch<T = any>(
    url: string,
    options: Record<string, any> = {},
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            // $fetch automatically throws on 4xx and 5xx errors
            const response = await $fetch<T>(url, options);

            // If the API explicitly returns 200 OK but packages errors inside the body:
            if ((response as any)?.statusCode === 403) {
                await $fetch('/api/auth/logout', { method: 'POST' });
                throw new Error("Forbidden");
            }

            return response;

        } catch (error: any) {
            // Retrieve the HTTP Status Code from the thrown FetchError
            const status = error.response?.status || error.statusCode;

            // Do NOT retry client errors (400s)
            if (status === 403 || status === 401) {
                console.error('Authentication Error: 401/403');
                await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
                throw error; // Immediately break and throw the error back to the caller
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