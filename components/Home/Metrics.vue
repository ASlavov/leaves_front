<template>
  <div
    class="relative overflow-hidden group border border-gray-100 dark:border-neutral-700 rounded-2xl transition-all duration-300 p-5 flex flex-col min-h-[140px] min-w-[280px]"
    :class="{
      'bg-gray-50/50 animate-pulse': loading,
      'bg-white dark:bg-neutral-800 hover:shadow-xl hover:-translate-y-1': !loading,
    }"
  >
    <!-- Background Accent Gradient -->
    <div
      class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500"
      :style="{ backgroundColor: leaveColor }"
    ></div>

    <div class="flex justify-between items-start flex-1">
      <div class="flex flex-col h-full justify-between py-1">
        <template v-if="loading">
          <div class="space-y-3">
            <div class="h-5 bg-gray-200 dark:bg-neutral-700 rounded-lg w-32"></div>
            <div class="h-4 bg-gray-100 dark:bg-neutral-700/50 rounded-lg w-24"></div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-1">
            <h5
              class="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider"
            >
              {{ leave.leave_type_name }}
            </h5>
            <div
              class="text-2xl font-black text-gray-900 dark:text-white flex items-baseline gap-1"
            >
              {{ leave.remaining_days }}
              <span
                class="text-xs font-medium text-gray-400 dark:text-neutral-500 tracking-normal"
                >{{ $t('leaves.daysRemaining') }}</span
              >
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase">{{
                $t('common.total')
              }}</span>
              <span class="text-xs font-bold text-gray-600 dark:text-neutral-300">{{
                leave.entitled_days
              }}</span>
            </div>
            <div class="w-px h-4 bg-gray-100 dark:bg-neutral-700"></div>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase">{{
                $t('leaves.used')
              }}</span>
              <span class="text-xs font-bold text-gray-600 dark:text-neutral-300">{{
                usedDays
              }}</span>
            </div>

            <!-- Projection Tooltip -->
            <div class="ml-auto relative group/info cursor-help">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5 text-gray-300 hover:text-red-400 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div
                class="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 w-48 p-3 bg-gray-900 text-white text-[11px] rounded-xl shadow-2xl z-50 pointer-events-none"
              >
                <p class="font-bold mb-1 text-red-400">{{ $t('leaves.projection') }}</p>
                {{ $t('leaves.accrualNote', { amount: (leave.entitled_days / 12).toFixed(2) }) }}
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="chart-container flex items-center justify-end relative h-full">
        <template v-if="loading">
          <div
            class="w-16 h-16 rounded-full border-4 border-gray-100 dark:border-neutral-700"
          ></div>
        </template>
        <template v-else>
          <RadialBarChart
            :percentage="percentageUsed"
            :value="leave.remaining_days || 0"
            :color="leaveColor"
            :label="''"
            :size="80"
          />
        </template>
      </div>
    </div>

    <!-- Month context badge — only rendered when enriched data is present -->
    <div
      v-if="!loading && leave.booked_in_month !== undefined"
      class="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-neutral-700/60 flex-wrap"
    >
      <span
        class="text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wide truncate max-w-[80px]"
      >
        {{ leave.month_label }}
      </span>

      <span class="text-[11px] font-bold" :style="{ color: leaveColor }">
        {{ leave.booked_in_month }}
        <span class="text-[10px] font-normal text-gray-400 dark:text-neutral-500">
          {{ $t('leaves.used') }}
        </span>
      </span>

      <!-- "available" only meaningful for monthly-accrual types -->
      <template v-if="leave.accrual_type === 'pro_rata_monthly'">
        <span class="text-gray-200 dark:text-neutral-700 select-none">·</span>
        <span class="text-[11px] font-bold text-gray-700 dark:text-neutral-200">
          {{ Math.max(0, leave.monthly_allowance - leave.booked_in_month).toFixed(1) }}
          <span class="text-[10px] font-normal text-gray-400 dark:text-neutral-500">
            {{ $t('leaves.available') }}
          </span>
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import RadialBarChart from '~/components/Home/RadialBarChart.vue';
import { getTypeColor } from '@/utils/leaveColors';

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
  return Number(Math.max(0, entitledDays - remainingDays).toFixed(2));
});

const percentageUsed = computed(() => {
  const entitledDays = props.leave.entitled_days || 0;
  if (entitledDays === 0) return 0;
  return Math.min(100, (usedDays.value / entitledDays) * 100);
});
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
