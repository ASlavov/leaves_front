import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getWorkWeekComposable, updateWorkWeekComposable } from '@/composables/settingsApiComposable';

export const useWorkWeekStore = defineStore('workWeekStore', () => {
    // 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS Date.getDay())
    const days = ref<number[]>([1, 2, 3, 4, 5]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const { t } = useI18n();

    const setError = (msg: string | null) => { error.value = msg; };

    function reset() {
        days.value = [1, 2, 3, 4, 5];
    }

    async function fetchWorkWeek() {
        loading.value = true;
        try {
            const data = await getWorkWeekComposable();
            days.value = data.days;
        } catch (err: any) {
            setError(t('errors.workWeek.fetchFailed'));
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateWorkWeek(newDays: number[]) {
        try {
            const data = await updateWorkWeekComposable(newDays);
            days.value = data.days;
        } catch (err: any) {
            setError(t('errors.workWeek.updateFailed'));
            throw err;
        }
    }

    return { days, loading, error, reset, fetchWorkWeek, updateWorkWeek };
});
