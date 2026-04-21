<template>
  <div
    v-if="
      permissionsStore.can('profile_leave_balance', 'request_leave') ||
      permissionsStore.can('profile_leave_balance', 'cancel_leave')
    "
    class="container"
  >
    <h3 class="py-4 font-semibold text-lg dark:text-gray-100">{{ $t('leaves.balance') }}</h3>
    <template v-if="loading && !leavesDataLoaded">
      <!-- Loading Skeleton -->
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
      <div
        v-if="leavesData.length !== 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <!-- Render Metrics component for each item in leavesData -->
        <Metrics
          v-for="(leave, index) in leavesData"
          :key="index"
          :leave="leave"
          :loading="leavesStore.loading"
        />
        <div class="flex flex-row justify-center items-center leave-actions space-x-4">
          <NewLeave />
          <CancelLeave />
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-600 dark:text-gray-100">
        {{ $t('leaves.noAvailableLeaves') }}
      </div>
    </template>
  </div>
</template>

<script setup>
import Metrics from '~/components/Home/Metrics.vue';
import NewLeave from '~/components/Home/NewLeave.vue';
import CancelLeave from '~/components/Home/CancelLeave.vue';
import { computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

const loading = computed(() => centralStore.loading && !centralStore.initialized);

const leavesDataLoaded = computed(() => leavesStore.isDataLoaded);

// Group leaves by leave type and sum up the days
const groupedLeavesData = computed(() => {
  if (!leavesStore.leavesData?.leavesAvailableDays) {
    return [];
  }

  const groupedData = leavesStore.leavesData.leavesAvailableDays.reduce((acc, leave) => {
    const typeId = leave.leave_type_id;

    if (!acc[typeId]) {
      acc[typeId] = {
        leave_type_id: typeId,
        leave_type_name: leave.leave_type_name,
        entitled_days: 0,
        remaining_days: 0,
      };
    }

    acc[typeId].entitled_days = Number(
      (acc[typeId].entitled_days + leave.entitled_days).toFixed(2),
    );
    acc[typeId].remaining_days = Number(
      (acc[typeId].remaining_days + leave.remaining_days).toFixed(2),
    );

    return acc;
  }, {});

  // Convert the object back to an array
  const allTypes = Object.values(groupedData);
  return centralStore.dashboardPreferencesStore.visibleLeaveTypes(allTypes);
});

// Pass the grouped data to the template
const leavesData = groupedLeavesData;
</script>
