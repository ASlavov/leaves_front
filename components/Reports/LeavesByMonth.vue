<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full min-h-[300px] flex flex-col"
  >
    <h4 class="text-[14px] font-bold text-black dark:text-white mb-[12px]">
      {{ $t('reports.widgets.leavesByMonth') }}
    </h4>
    <div v-if="loading" class="flex-1 animate-pulse bg-gray-100 dark:bg-neutral-700 rounded" />
    <div v-else-if="chartData" class="flex-1 relative w-full h-[300px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-[13px] text-gray-500 py-[20px] text-center mt-auto mb-auto">
      {{ $t('common.noData') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { ReportSummary } from '@/composables/reportsApiComposable';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const { t } = useI18n();
const props = defineProps({
  summary: { type: Object as PropType<ReportSummary | null>, default: null },
  loading: { type: Boolean, default: false },
});

const monthLabel = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });

const chartData = computed(() => {
  if (!props.summary?.by_month?.length) return null;
  return {
    labels: props.summary.by_month.map((r) => monthLabel(r.m)),
    datasets: [
      {
        label: t('reports.widgets.leaveDays'),
        data: props.summary.by_month.map((r) => Number(r.days)),
        backgroundColor: '#EA021A',
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
</script>
