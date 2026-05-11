import retryFetch from '@/utils/retryFetch';
import { useApiData } from './useApiData';

export const fetchDocumentSourcesComposable = async () => {
  return await retryFetch('/api/company-settings/fetchDocumentSources', {
    method: 'POST',
  });
};

export const updateDocumentSourcesComposable = async (payload: any) => {
  return await retryFetch('/api/company-settings/updateDocumentSources', {
    method: 'POST',
    body: payload,
  });
};

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
