import type { PublicHoliday } from '~/types';

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

export const updateHolidayComposable = (id: number | string, date: string, name: string, isRecurring: boolean) => {
    return retryFetch<PublicHoliday>(`/api/holidays/${id}`, {
        method: 'PUT',
        body: { date, name, is_recurring: isRecurring },
    });
};

export const deleteHolidayComposable = (id: number | string) => {
    return retryFetch(`/api/holidays/${id}`, { method: 'DELETE' });
};

export const createHolidayBatchComposable = (dates: string[], name: string, isRecurring: boolean) => {
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
