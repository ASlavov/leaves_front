<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full min-h-[150px] flex flex-col items-center justify-center text-center"
  >
    <h4
      class="text-[13px] font-bold text-gray-500 dark:text-neutral-400 mb-2 uppercase tracking-wide"
    >
      {{ $t('reports.widgets.pendingQueue') }}
    </h4>
    <div
      v-if="loading"
      class="h-10 w-16 animate-pulse bg-gray-200 dark:bg-neutral-700 rounded mx-auto mt-2"
    />
    <div
      v-else
      class="text-[48px] font-black text-amber-500 leading-tight flex items-center justify-center"
    >
      {{ props.summary?.pending_count || 0 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { ReportSummary } from '@/composables/reportsApiComposable';

const props = defineProps({
  summary: { type: Object as PropType<ReportSummary | null>, default: null },
  loading: { type: Boolean, default: false },
});
</script>
