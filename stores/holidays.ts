import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PublicHoliday } from '~/types';

const sortHolidays = (arr: PublicHoliday[]) =>
    arr.sort((a, b) => a.date.localeCompare(b.date));

export const useHolidaysStore = defineStore('holidaysStore', () => {
    const holidays = ref<PublicHoliday[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    function reset() {
        holidays.value = [];
    }

    async function fetchHolidays(year?: number) {
        loading.value = true;
        try {
            const query = year ? `?year=${year}` : '';
            const data = await $fetch<PublicHoliday[]>(`/api/holidays${query}`);
            holidays.value = sortHolidays(data);
        } catch (err: any) {
            error.value = 'Failed to fetch holidays';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function createHoliday(date: string, name: string, isRecurring: boolean) {
        try {
            const data = await $fetch<PublicHoliday>('/api/holidays', {
                method: 'POST',
                body: { date, name, is_recurring: isRecurring },
            });
            holidays.value.push(data);
            sortHolidays(holidays.value);
            return data;
        } catch (err: any) {
            throw err;
        }
    }

    async function updateHoliday(id: number | string, date: string, name: string, isRecurring: boolean) {
        try {
            const data = await $fetch<PublicHoliday>(`/api/holidays/${id}`, {
                method: 'PUT',
                body: { date, name, is_recurring: isRecurring },
            });
            const idx = holidays.value.findIndex(h => String(h.id) === String(id));
            if (idx !== -1) holidays.value[idx] = data;
            sortHolidays(holidays.value);
            return data;
        } catch (err: any) {
            throw err;
        }
    }

    async function deleteHoliday(id: number | string) {
        try {
            await $fetch(`/api/holidays/${id}`, { method: 'DELETE' });
            holidays.value = holidays.value.filter(h => String(h.id) !== String(id));
        } catch (err: any) {
            throw err;
        }
    }

    async function createHolidayBatch(dates: string[], name: string, isRecurring: boolean) {
        try {
            const res = await $fetch<{ created: number; holidays: PublicHoliday[] }>('/api/holidays/batch', {
                method: 'POST',
                body: { dates, name, is_recurring: isRecurring },
            });
            // Merge new holidays, de-duplicate by id, then sort
            const existingIds = new Set(holidays.value.map(h => String(h.id)));
            for (const h of res.holidays) {
                if (!existingIds.has(String(h.id))) holidays.value.push(h);
                else {
                    const idx = holidays.value.findIndex(x => String(x.id) === String(h.id));
                    if (idx !== -1) holidays.value[idx] = h;
                }
            }
            sortHolidays(holidays.value);
            return res;
        } catch (err: any) {
            throw err;
        }
    }

    async function deleteHolidayBatch(ids: (number | string)[]) {
        try {
            const res = await $fetch<{ deleted: number }>('/api/holidays/batchDelete', {
                method: 'DELETE',
                body: { ids },
            });
            const idSet = new Set(ids.map(String));
            holidays.value = holidays.value.filter(h => !idSet.has(String(h.id)));
            return res;
        } catch (err: any) {
            throw err;
        }
    }

    return {
        holidays, loading, error, reset,
        fetchHolidays, createHoliday, updateHoliday, deleteHoliday,
        createHolidayBatch, deleteHolidayBatch,
    };
});
