<template>
    <div>
        <div v-if="leavesData.message" class="text-center text-gray-500 font-semibold">
            <div class="flex items-center justify-center h-64">
                <div class="text-center text-gray-500 font-semibold">
                    {{ $t('leaves.noLeaves') }}
                </div>
            </div>
        </div>
        <div v-else>
            <!-- Skeleton Loader: Show when loading is true -->
            <div v-if="loading" class="space-y-4">
                <div v-for="index in skeletonCount" :key="index" class="flex items-center bg-gray-200 border border-gray-300 hover:shadow-md transition-shadow duration-300 rounded-md p-4 space-x-4 mb-4 animate-pulse dark:bg-neutral-800 dark:text-gray-100">
                    <!-- Simulating the layout for the skeleton loader -->
                    <div class="flex-shrink-0 bg-gray-300 h-6 w-6 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-300 rounded mb-2"></div>
                        <div class="h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div class="flex-1 text-center">
                        <div class="h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div class="flex-1 text-right">
                        <div class="h-4 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>

            <!-- Actual Content: Show when loading is false -->
            <div v-if="!loading">
                <div v-for="(leave, index) in leavesData" :key="index" class="flex items-center bg-white border hover:shadow-md transition-shadow duration-300 rounded-md p-4 space-x-4 mb-4 dark:bg-neutral-800 dark:text-gray-100">
                    <!-- Icon Column -->
                    <div class="flex-shrink-0">
                        <img src="https://placehold.co/150x150" alt="Icon" class="h-6 w-6">
                    </div>
                    <!-- First Text Column -->
                    <div class="flex-1">
                        <div class="text-sm text-[#808080]">
                            {{ leave.start_date }} - {{ leave.end_date }}
                        </div>
                        <div class="font-semibold">
                            {{ getLeaveTypeName(leave.leave_type_id) }} <!-- Filtered leave type name -->
                        </div>
                    </div>
                    <!-- Second Text Column (Centered) -->
                    <div class="flex-1 text-center">
                        <div :class="{
                            'text-yellow-500': leave.status === 'pending',
                            'text-green-500': leave.status === 'approved',
                            'text-red-500': leave.status === 'cancelled',
                            'text-red-700': leave.status === 'rejected'
                        }">
                            {{ leave.status === 'approved' ? $t('leaves.approved') : leave.status === 'pending' ? $t('leaves.pending') :
                                leave.status === 'cancelled' ? $t('leaves.cancelled') :
                                    $t('leaves.rejected') }}
                        </div>
                    </div>
                    <!-- Third Text Column (Right Aligned) -->
                    <div class="flex-1 text-right">
                        <button @click="cancelLeave(leave.id)" v-if="leave.status === 'approved' || leave.status === 'pending' " class="font-semibold underline text-black dark:text-gray-100">{{ $t('leaves.cancelLeaveAction') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

// Use computed to get leavesData and leaveTypes
const leavesData = computed(() => leavesStore.leavesData?.currentUser || []);
const leaveTypes = computed(() => leavesStore.leavesData?.leavesTypes || []);


// Function to get leave type name based on leave_type_id
const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.value.find(type => type.id === leaveTypeId);
    return leaveType ? leaveType.name : t('common.unknown'); // Default to 'Unknown' if not found
};

const cancelLeave = async (leaveId) => {
  loading.value = true;
  try {
    await leavesStore.cancelLeave(userStore.userId, leaveId, 'cancelled', 'cancelled by requester');
    useNuxtApp().$toast.success(t('leaves.cancelSuccess'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error(t('leaves.cancelError'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } finally {
    loading.value = false;
  }
}

// Loading state and skeleton count
const loading = computed(() => leavesStore.loading);
const skeletonCount = ref(leavesData.value.length || 3); // Dynamically show skeletons for available leaves or default to 3
</script>

<style scoped>
/* Add any additional styles here */
</style>
