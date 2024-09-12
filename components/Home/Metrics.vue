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
                    <ApexCharts :options="chartOptions" :series="chartSeries" type="radialBar"/>
                </ClientOnly>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref } from "vue";

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
                    formatter: (val) => 'Υπόλοιπο', 
                },
                value: {
                    show: true, 
                    formatter: (val) => '12',
                },
            },
        },
    },
    colors: ['#3342ff'], // Customize colors
});

const chartSeries = ref([80]); // Series data
</script>

<script>
export default {
    name: "Metrics",
};
</script>
