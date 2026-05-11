<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full min-h-[300px] flex flex-col"
  >
    <h4 class="text-[14px] font-bold text-black dark:text-white mb-[12px]">
      {{ $t('reports.widgets.leaveTypeShare') }}
    </h4>
    <div v-if="loading" class="flex-1 animate-pulse bg-gray-100 dark:bg-neutral-700 rounded" />
    <div v-else-if="chartData" class="flex-1 relative w-full h-[250px] flex justify-center">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="text-[13px] text-gray-500 py-[20px] text-center mt-auto mb-auto">
      {{ $t('common.noData') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useCentralStore } from '@/stores/centralStore';
import type { ReportSummary } from '@/composables/reportsApiComposable';

Chart.register(ArcElement, Tooltip, Legend);

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;

const props = defineProps({
  summary: { type: Object as PropType<ReportSummary | null>, default: null },
  loading: { type: Boolean, default: false },
});

const chartData = computed(() => {
  if (!props.summary?.by_type?.length) return null;
  return {
    labels: props.summary.by_type.map((r: any) => {
      const type = leavesStore.leavesData?.leavesTypes?.find(
        (lt: any) => lt.id === r.leave_type_id,
      );
      return type ? type.name : `Type #${r.leave_type_id}`;
    }),
    datasets: [
      {
        data: props.summary.by_type.map((r: any) => Number(r.days)),
        backgroundColor: [
          '#EA021A',
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
          '#EC4899',
          '#6366F1',
        ],
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
  },
};
</script>
