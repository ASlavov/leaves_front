<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full min-h-[300px] flex flex-col"
  >
    <h4 class="text-[14px] font-bold text-black dark:text-white mb-[12px]">
      {{ $t('reports.widgets.leavesByDepartment') }}
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
import { useCentralStore } from '@/stores/centralStore';
import type { ReportSummary } from '@/composables/reportsApiComposable';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const { t } = useI18n();
const centralStore = useCentralStore();
const departmentsStore = centralStore.departmentsStore;

const props = defineProps({
  summary: { type: Object as PropType<ReportSummary | null>, default: null },
  loading: { type: Boolean, default: false },
});

const chartData = computed(() => {
  if (!props.summary?.by_department?.length) return null;
  return {
    labels: props.summary.by_department.map((r: any) => {
      const dep = departmentsStore.departmentsData?.find((d: any) => d.id === r.department_id);
      return dep ? dep.name : `Dep #${r.department_id}`;
    }),
    datasets: [
      {
        label: t('reports.widgets.leaveDays'),
        data: props.summary.by_department.map((r: any) => Number(r.days)),
        backgroundColor: '#3B82F6',
      },
    ],
  };
});

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
</script>
