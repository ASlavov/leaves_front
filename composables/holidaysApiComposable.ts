import type { PublicHoliday } from '~/types';
import { computed, isRef, ref, type Ref } from 'vue';

export const getHolidaysComposable = (year?: number) => {
  const query = year ? `?year=${year}` : '';
  return retryFetch<PublicHoliday[]>(`/api/holidays${query}`, { method: 'GET' });
};

export const createHolidayComposable = (date: string, name: string, isRecurring: boolean) => {
  return retryFetch<PublicHoliday>('/api/holidays', {
    method: 'POST',
    body: { date, name, is_recurring: isRecurring },
  });
};

export const updateHolidayComposable = (
  id: number | string,
  date: string,
  name: string,
  isRecurring: boolean,
) => {
  return retryFetch<PublicHoliday>(`/api/holidays/${id}`, {
    method: 'PUT',
    body: { date, name, is_recurring: isRecurring },
  });
};

export const deleteHolidayComposable = (id: number | string) => {
  return retryFetch(`/api/holidays/${id}`, { method: 'DELETE' });
};

export const createHolidayBatchComposable = (
  dates: string[],
  name: string,
  isRecurring: boolean,
) => {
  return retryFetch<{ created: number; holidays: PublicHoliday[] }>('/api/holidays/batch', {
    method: 'POST',
    body: { dates, name, is_recurring: isRecurring },
  });
};

export const deleteHolidayBatchComposable = (ids: (number | string)[]) => {
  return retryFetch<{ deleted: number }>('/api/holidays/batchDelete', {
    method: 'DELETE',
    body: { ids },
  });
};

// ─── Reactive Variants ────────────────────────────────────────────────────────

export const useHolidays = (yearInput?: Ref<number | undefined> | number) => {
  const yearRef = isRef(yearInput) ? yearInput : ref(yearInput);

  const key = computed(() => `holidays-${yearRef.value ?? 'all'}`);
  const url = computed(() =>
    yearRef.value ? `/api/holidays?year=${yearRef.value}` : '/api/holidays',
  );

  return useAsyncData<PublicHoliday[]>(key.value, () => $fetch<PublicHoliday[]>(url.value), {
    lazy: true,
    server: true,
    watch: [yearRef],
  });
};
