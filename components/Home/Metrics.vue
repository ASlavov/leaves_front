<template>
  <div class="border border-gray-100 rounded-lg p-4 flex flex-col justify-between dark:bg-neutral-800 dark:border-neutral-700">
    <div class="flex flex-row justify-between mb-2">
      <div v-if="loading" class="animate-pulse bg-gray-200 h-6 w-3/4 mb-1 rounded"></div>
      <h4 v-else class="text-xs uppercase font-bold text-gray-500 mb-1 dark:text-neutral-400">
        {{ leave.leave_type_name }}
      </h4>
      <div class="h-6 w-6">
        <img src="https://placehold.co/150x150" alt="Icon" class="h-6 w-6">
      </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col justify-end">
        <div v-if="loading" class="animate-pulse bg-gray-200 h-4 w-1/2 mb-1 rounded"></div>
        <div v-else class="text-sm dark:text-gray-100">
          <span class="font-bold">{{ $t('common.total') }} </span>{{ leave.entitled_days }}
        </div>
        <div v-if="loading" class="animate-pulse bg-gray-200 h-4 w-1/2 mb-1 rounded"></div>
        <div v-else class="text-sm dark:text-gray-100">
          <span class="font-bold">{{ $t('leaves.used') }} </span>{{ leave.entitled_days - leave.remaining_days }}
        </div>
        <div v-if="loading" class="animate-pulse bg-gray-200 h-4 w-1/2 rounded"></div>
        <div v-else class="text-sm dark:text-gray-100">
          <span class="font-bold">{{ $t('leaves.remaining') }} </span>{{ leave.remaining_days }}
        </div>
      </div>
      <div class="chart-container flex justify-end">
        <!-- Static progress bar instead of chart -->
        <div class="w-24 h-24 relative">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <path
                class="stroke-current text-gray-200 dark:text-neutral-700"
                stroke-width="3"
                fill="none"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
                class="stroke-current text-blue-500"
                stroke-width="3"
                stroke-dasharray="100, 100"
                :stroke-dasharray="`${(leave.remaining_days / leave.entitled_days) * 100}, 100`"
                stroke-linecap="round"
                fill="none"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" class="text-[8px] font-bold text-center fill-current dark:fill-gray-100" text-anchor="middle">
              {{ Math.round((leave.remaining_days / leave.entitled_days) * 100) }}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  leave: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.chart-container {
  height: 100px;
}
</style>