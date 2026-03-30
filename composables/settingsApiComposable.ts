export const getWorkWeekComposable = () => {
    return retryFetch<{ days: number[] }>('/api/settings/workWeek', { method: 'GET' });
};

export const updateWorkWeekComposable = (days: number[]) => {
    return retryFetch<{ days: number[] }>('/api/settings/workWeek', {
        method: 'PUT',
        body: { days },
    });
};
