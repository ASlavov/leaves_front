<template>
    <div class="bg-white border rounded-lg shadow-md p-4">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <h5 class="text-lg font-semibold mb-4">{{ leave.leave_type_name }}</h5>
                <div>
                    <span class="font-bold">Σύνολο: </span>
                    <span class="font-light">{{ leave.entitled_days }}</span>
                </div>
                <div>
                    <span class="font-bold">Υπόλοιπο: </span>
                    <span class="font-light">{{ leave.remaining_days }}</span>
                </div>
            </div>
            <div class="chart-container">
                <ClientOnly>
                    <ApexCharts :options="chartOptions" :series="chartSeries" type="radialBar" />
                </ClientOnly>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { defineProps } from 'vue';

const props = defineProps({
    leave: {
        type: Object,
        required: true
    }
});

// Calculate percentage of remaining days based on entitled days
const percentageRemaining = computed(() => {
    const { entitled_days, remaining_days } = props.leave;
    return entitled_days > 0 ? (remaining_days / entitled_days) * 100 : 0;
});

const chartOptions = ref({
    chart: {
        type: 'radialBar',
    },
    plotOptions: {
        radialBar: {
            hollow: {
                size: '40%',
            },
            dataLabels: {
                enabled: true,
                name: {
                    show: true,
                    formatter: () => 'Υπόλοιπο',
                },
                value: {
                    show: true,
                    formatter: (val) => `${val}%`, // Show percentage in formatter
                },
            },
        },
    },
    colors: ['#3342ff'], // Customize colors
});

const chartSeries = ref([0]); // Initialize with 0

// Watch for changes in props to update chart data
watch(() => props.leave.remaining_days, (newValue) => {
    chartSeries.value = [percentageRemaining.value]; // Update the chart series data based on the calculated percentage
}, { immediate: true }); // Run the watch function immediately on component mount
</script>

<script>
export default {
    name: "Metrics",
};
</script>