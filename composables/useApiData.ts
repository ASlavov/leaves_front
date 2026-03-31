import { useAsyncData, type AsyncDataOptions } from '#app';
import retryFetch from '@/utils/retryFetch';
import type { User, LeaveType } from '~/types';

/**
 * A reactive, SSR-friendly composable that wraps `retryFetch` with `useAsyncData`.
 *
 * @param key Unique key for the request (used by Nuxt for caching and hydration)
 * @param url API endpoint URL
 * @param options Fetch options (method, body, headers, etc.)
 * @param asyncDataOptions Nuxt-specific useAsyncData options
 */
export function useApiData<T>(
  key: string,
  url: string,
  options: Record<string, unknown> = {},
  asyncDataOptions: AsyncDataOptions<T> = {},
) {
  return useAsyncData<T>(key, () => retryFetch<T>(url, options), asyncDataOptions);
}

/**
 * Specific variant for fetching all users with leaves.
 */
export function useAllUserLeaves() {
  return useApiData<User[]>(
    'all-user-leaves',
    '/api/leaves/getAllForAllUsers',
    { method: 'POST' },
    { lazy: true, server: true },
  );
}

/**
 * Specific variant for fetching leave types.
 */
export function useLeaveTypes(includeArchived = false) {
  return useApiData<LeaveType[]>(
    `leave-types-${includeArchived}`,
    '/api/leaves/getLeavesTypes',
    {
      method: 'POST',
      body: includeArchived ? { includeArchived: true } : {},
    },
    { lazy: true, server: true },
  );
}
