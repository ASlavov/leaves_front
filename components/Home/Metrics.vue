<template>
    <div class="bg-white border rounded-lg shadow-md p-4">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <h5 class="text-lg font-semibold mb-4">Πληρωμένη άδεια</h5>
                <div>
                    <span class="font-bold">Σύνολο: </span> <span class="font-light">22</span>
                </div>
                <div>
                    <span class="font-bold">Σύνολο: </span> <span class="font-light">22</span>
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
import { ref } from "vue";

const chartOptions = ref({
    chart: {
        height: 350,
        type: 'radialBar',
    },
    plotOptions: {
        radialBar: {
            hollow: {
                size: '50%',
            },
            dataLabels: {
                name: {
                    show: true, // Hide the name label
                    formatter: (val) => 'sadas', // Leave formatter blank
                },
                value: {
                    show: true, // Show the value label
                    formatter: (val) => '1', // Leave formatter blank
                },
            },
        },
    },
    colors: ['#FF4560'], // Customize colors
    labels: ['Cricket'], // Optional
});

const chartSeries = ref([40]); // Series data
</script>

<script>
export default {
    name: "Metrics",
};
</script>
