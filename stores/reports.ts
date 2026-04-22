import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getReportSummaryComposable, type ReportSummary } from '~/composables/reportsApiComposable';

export const useReportsStore = defineStore('reportsStore', () => {
  const summary = ref<ReportSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { t } = useI18n();

  const fetchSummary = async (year: number, deptIds: number[] = [], typeIds: number[] = []) => {
    loading.value = true;
    error.value = null;
    try {
      summary.value = await getReportSummaryComposable(year, deptIds, typeIds);
    } catch (err) {
      error.value = t('errors.reports.fetchFailed');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    summary.value = null;
    error.value = null;
    loading.value = false;
  };

  return { summary, loading, error, fetchSummary, reset };
});
