<template>
  <div
    :class="{ 'bg-gray-50': loading, 'bg-white': !loading }"
    class="border border-[#dfeaf2] rounded-[8px] hover:shadow-md transition-shadow duration-300 p-[20px] dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100 flex flex-col justify-between h-[120px] min-w-[280px]"
  >
    <div class="grid grid-cols-2 gap-2 h-full">
      <div class="flex flex-col justify-between">
        <template v-if="loading">
          <div class="animate-pulse space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </template>
        <template v-else>
          <h5
            class="text-[16px] font-bold leading-tight line-clamp-2"
            :style="{ color: leaveColor }"
          >
            {{ leave.leave_type_name }}
          </h5>
          <div class="space-y-1">
            <div class="text-[13px] flex gap-1">
              <span class="font-bold text-black dark:text-gray-300">{{ $t('common.total') }}</span>
              <span class="font-semibold text-[#808080] dark:text-gray-400">{{
                leave.entitled_days
              }}</span>
            </div>
            <div class="text-[13px] flex gap-1">
              <span class="font-bold text-black dark:text-gray-300">{{ $t('leaves.used') }}</span>
              <span class="font-semibold text-[#808080] dark:text-gray-400">{{ usedDays }}</span>
            </div>
          </div>
        </template>
      </div>
      <div class="chart-container flex items-center justify-end relative h-full overflow-visible">
        <template v-if="loading">
          <div
            class="w-[90px] h-[90px] rounded-full bg-gray-100 animate-pulse dark:bg-neutral-700"
          ></div>
        </template>
        <template v-else>
          <RadialBarChart
            :percentage="percentageUsed"
            :value="leave.remaining_days || 0"
            :color="leaveColor"
            :label="chartLabel"
            :size="90"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RadialBarChart from '~/components/Home/RadialBarChart.vue';
import { getTypeColor } from '@/utils/leaveColors';

const { t } = useI18n();

const props = defineProps({
  leave: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

const leaveColor = computed(() => getTypeColor(props.leave.leave_type_id));

const usedDays = computed(() => {
  const entitledDays = props.leave.entitled_days || 0;
  const remainingDays = props.leave.remaining_days || 0;
  return Math.max(0, entitledDays - remainingDays);
});

const percentageUsed = computed(() => {
  const entitledDays = props.leave.entitled_days || 0;
  if (entitledDays === 0) return 0;
  return Math.min(100, (usedDays.value / entitledDays) * 100);
});

const chartLabel = computed(() => t('leaves.remaining'));
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
