<template>
    <div class="container mx-auto">
        <h3 class="py-4 font-semibold text-lg">Υπόλοιπα άδειας</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metrics />
            <Metrics />
            <Metrics />
            <div class="flex flex-row justify-center items-center leave-actions space-x-4">
                <NewLeave />
                <CancelLeave />
            </div>
        </div>
    </div>
</template>

<script setup>
import Metrics from '~/components/Home/Metrics.vue'
import NewLeave from '~/components/Home/NewLeave.vue'
import CancelLeave from '~/components/Home/CancelLeave.vue'
</script>