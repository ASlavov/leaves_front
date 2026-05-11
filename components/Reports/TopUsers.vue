<template>
  <div
    class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full min-h-[300px] flex flex-col"
  >
    <h4 class="text-[14px] font-bold text-black dark:text-white mb-[12px]">
      {{ $t('reports.widgets.topUsers') }}
    </h4>
    <div v-if="loading" class="flex-1 animate-pulse bg-gray-100 dark:bg-neutral-700 rounded" />
    <div v-else-if="props.summary?.top_users?.length" class="flex-1 overflow-x-auto">
      <div class="space-y-3 mt-2">
        <div
          v-for="(row, idx) in props.summary.top_users"
          :key="row.user_id"
          class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-neutral-700/50 rounded-lg transition-colors"
        >
          <div class="font-bold text-gray-400 w-5">{{ idx + 1 }}.</div>
          <SharedUserAvatar :user="row.user" :size="32" class="shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate text-gray-800 dark:text-gray-200">
              {{ row.user.name }}
            </p>
          </div>
          <div
            class="shrink-0 rounded-full font-bold bg-[#EA021A]/10 text-[#EA021A] dark:bg-[#EA021A]/20 py-1 px-3 text-xs"
          >
            {{ row.days }} {{ $t('reports.widgets.leaveDays') }}
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-[13px] text-gray-500 py-[20px] text-center mt-auto mb-auto">
      {{ $t('common.noData') }}
    </p>
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
