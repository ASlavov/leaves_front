<template>
    <div :class="{ 'bg-gray-200': loading, 'bg-white': !loading }" class="border rounded-lg hover:shadow-md transition-shadow duration-300 p-[25px] dark:bg-neutral-800 dark:text-gray-100">
<!--        <div class="flex justify-between gap-4 whitespace-nowrap">-->
        <div class="grid grid-cols-2 gap-4">
            <div>
                <template v-if="loading">
                  <div class="border rounded-lg animate-pulse p-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div>
                          <span class="h-4 bg-gray-200 rounded w-1/4 block mb-1"></span>
                        </div>
                        <div>
                          <span class="h-4 bg-gray-200 rounded w-1/4 block"></span>
                        </div>
                      </div>
                      <div class="chart-container">
                        <div class="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                    <h5 class="text-lg font-semibold mb-[15px]"
                    :style="`color:${leaveColor}`"
                    >{{ leave.leave_type_name }}</h5>
                    <div>
                        <span class="font-bold">Σύνολο: </span>
                        <span class="font-light">{{ leave.entitled_days }}</span>
                    </div>
                    <div>
                        <span class="font-bold">Κατοχυρωμένες: </span>
                        <span class="font-light">{{ usedDays }}</span>
                    </div>
                </template>
            </div>
            <div class="chart-container max-h-[100px] overflow-visible mt-[-10px]">
                <template v-if="loading">
                    <div class="skeleton-chart h-[70px]"></div>
                </template>
                <template v-else>
                    <ClientOnly>
                        <ApexCharts
                            ref="mychart"
                            :options="chartOptions"
                            :series="chartSeries"
                            type="radialBar" />
                    </ClientOnly>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import ApexCharts from 'vue3-apexcharts';

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
const colorList = [
  '#F44336',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#FFC107',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#4CAF50',
];
// Computed property for used days
const usedDays = computed(() => {
  const entitledDays = props.leave.entitled_days || 0;
  const remainingDays = props.leave.remaining_days || 0;
  return entitledDays > 0 ? entitledDays - remainingDays : 0;
});

const leaveColor = computed(() => colorList[props?.leave?.leave_type_id]);

// Computed property for percentage used
const percentageUsed = computed(() => {
  const entitledDays = props.leave.entitled_days || 0;
  return entitledDays > 0 ? (usedDays.value / entitledDays) * 100 : 0;
});
const theme = computed(() => {
  const {$colorMode} = useNuxtApp();
  return $colorMode?.value || 'light';
});
const mychart = ref(null);
const modeColor = computed(() => (theme.value === 'dark') ? 'white' : 'black');
// Computed property for chart options
const chartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
  },

  grid: {
    padding: {
      top: -4, // Reduce top padding
      bottom: -4, // Reduce bottom padding
      left: -4,
      right: -4,
    },
  },
  plotOptions: {
    radialBar: {
      offsetY: -10,
      hollow: {
        size: '55%',
      },
      dataLabels: {
        enabled: true,
        name: {
          show: true,
          offsetY: -2,
          fontSize: "12px",
          fontWeight: '500',
          color: modeColor.value,
          formatter: () => 'Υπόλοιπο',
        },
        value: {
          show: true,
          offsetY: 3,
          fontSize: "20px",
          fontWeight: 'bold',
          color: modeColor.value,
          formatter: () => props.leave.remaining_days || 0,
        },
      },
    },
  },
  colors: [leaveColor.value],
}));
/*watch(theme, async() => {
  console.log('something');
  if (mychart) {
    mychart.refresh()
  }
}, {immediate: true});*/


// Computed property for chart series
const chartSeries = computed(() => [percentageUsed.value]);



</script>


<style scoped>
.chart-container * {
  font-family: 'Roboto', sans-serif !important;
}
</style>