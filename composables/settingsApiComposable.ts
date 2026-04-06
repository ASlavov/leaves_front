import { useApiData } from './useApiData';

export const getWorkWeekComposable = () => {
  return retryFetch<{ days: number[] }>('/api/settings/workWeek', { method: 'GET' });
};

export const updateWorkWeekComposable = (days: number[]) => {
  return retryFetch<{ days: number[] }>('/api/settings/workWeek', {
    method: 'PUT',
    body: { days },
  });
};

// ─── Reactive Variants ────────────────────────────────────────────────────────

export const useWorkWeek = () => {
  return useApiData<{ days: number[] }>(
    'work-week-settings',
    '/api/settings/workWeek',
    { method: 'GET' },
    { lazy: true, server: true },
  );
};
