import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWorkWeekStore = defineStore('workWeekStore', () => {
    // 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS Date.getDay())
    const days = ref<number[]>([1, 2, 3, 4, 5]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    function reset() {
        days.value = [1, 2, 3, 4, 5];
    }

    async function fetchWorkWeek() {
        loading.value = true;
        try {
            const data = await $fetch<{ days: number[] }>('/api/settings/workWeek');
            days.value = data.days;
        } catch (err: any) {
            error.value = 'Failed to fetch work week settings';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateWorkWeek(newDays: number[]) {
        try {
            const data = await $fetch<{ days: number[] }>('/api/settings/workWeek', {
                method: 'PUT',
                body: { days: newDays },
            });
            days.value = data.days;
        } catch (err: any) {
            throw err;
        }
    }

    return { days, loading, error, reset, fetchWorkWeek, updateWorkWeek };
});
