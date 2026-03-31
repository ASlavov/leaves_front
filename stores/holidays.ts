import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PublicHoliday } from '~/types';
import {
  getHolidaysComposable,
  createHolidayComposable,
  updateHolidayComposable,
  deleteHolidayComposable,
  createHolidayBatchComposable,
  deleteHolidayBatchComposable,
} from '@/composables/holidaysApiComposable';

const sortHolidays = (arr: PublicHoliday[]) => {
  if (!Array.isArray(arr)) return [];
  return arr.sort((a, b) => a.date.localeCompare(b.date));
};

export const useHolidaysStore = defineStore('holidaysStore', () => {
  const holidays = ref<PublicHoliday[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { t } = useI18n();

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  function reset() {
    holidays.value = [];
  }

  async function fetchHolidays(year?: number) {
    loading.value = true;
    try {
      const data = await getHolidaysComposable(year);
      holidays.value = sortHolidays(data);
    } catch (err: any) {
      setError(t('errors.holidays.fetchFailed'));
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createHoliday(date: string, name: string, isRecurring: boolean) {
    try {
      const data = await createHolidayComposable(date, name, isRecurring);
      holidays.value.push(data);
      sortHolidays(holidays.value);
      return data;
    } catch (err: any) {
      setError(t('errors.holidays.createFailed'));
      throw err;
    }
  }

  async function updateHoliday(
    id: number | string,
    date: string,
    name: string,
    isRecurring: boolean,
  ) {
    try {
      const data = await updateHolidayComposable(id, date, name, isRecurring);
      const idx = holidays.value.findIndex((h: PublicHoliday) => String(h.id) === String(id));
      if (idx !== -1) holidays.value[idx] = data;
      sortHolidays(holidays.value);
      return data;
    } catch (err: any) {
      setError(t('errors.holidays.updateFailed'));
      throw err;
    }
  }

  async function deleteHoliday(id: number | string) {
    try {
      await deleteHolidayComposable(id);
      holidays.value = holidays.value.filter((h: PublicHoliday) => String(h.id) !== String(id));
    } catch (err: any) {
      setError(t('errors.holidays.deleteFailed'));
      throw err;
    }
  }

  async function createHolidayBatch(dates: string[], name: string, isRecurring: boolean) {
    try {
      const res = await createHolidayBatchComposable(dates, name, isRecurring);
      const existingIds = new Set(holidays.value.map((h: PublicHoliday) => String(h.id)));
      for (const h of res.holidays) {
        if (!existingIds.has(String(h.id))) holidays.value.push(h);
        else {
          const idx = holidays.value.findIndex((x: PublicHoliday) => String(x.id) === String(h.id));
          if (idx !== -1) holidays.value[idx] = h;
        }
      }
      sortHolidays(holidays.value);
      return res;
    } catch (err: any) {
      setError(t('errors.holidays.batchCreateFailed'));
      throw err;
    }
  }

  async function deleteHolidayBatch(ids: (number | string)[]) {
    try {
      const res = await deleteHolidayBatchComposable(ids);
      const idSet = new Set(ids.map(String));
      holidays.value = holidays.value.filter((h: PublicHoliday) => !idSet.has(String(h.id)));
      return res;
    } catch (err: any) {
      setError(t('errors.holidays.batchDeleteFailed'));
      throw err;
    }
  }

  return {
    holidays,
    loading,
    error,
    reset,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    createHolidayBatch,
    deleteHolidayBatch,
  };
});
