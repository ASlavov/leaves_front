<template>
    <div
        v-if="permissionsStore.can('profile_leave_balance','request_leave')
        || permissionsStore.can('profile_leave_balance','cancel_leave')"
        class="container">
        <h3 class="py-4 font-semibold text-lg dark:text-gray-100">Υπόλοιπα άδειας</h3>
        <div v-if="leavesData.length === 0" class="text-center py-4 text-gray-600 dark:text-gray-100">
            Δεν υπάρχουν διαθέσιμες άδειες
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Render Metrics component for each item in leavesData -->
            <Metrics v-for="(leave, index) in leavesData" :key="index" :leave="leave" :loading="leavesStore.loading" />
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
import { computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;
// Use computed to get leavesData
const leavesData = computed(() => leavesStore.leavesData.leavesAvailableDays);
</script>
