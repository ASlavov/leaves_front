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
      <!-- Header: View All link -->
      <div class="flex justify-end mb-3">
        <NuxtLink
          to="/yearly-leaves"
          class="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
        >
          {{ $t('leaves.allRequests') }}
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Skeleton Loader: Show when loading is true -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="index in skeletonCount"
          :key="index"
          class="flex items-center bg-gray-200 border border-gray-300 hover:shadow-md transition-shadow duration-300 rounded-md p-4 space-x-4 mb-4 animate-pulse dark:bg-neutral-800 dark:text-gray-100"
        >
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
        <!-- Actual Content: Show when loading is false -->
        <div v-if="!loading" class="space-y-3">
          <div
            v-for="(leave, index) in leavesData"
            :key="index"
            class="group relative flex flex-wrap sm:flex-row sm:items-center bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 hover:border-red-100 dark:hover:border-red-900/30 hover:shadow-sm transition-all duration-200 rounded-xl p-4 sm:p-5 gap-4"
          >
            <!-- Status Indicator Line (Vertical) -->
            <div
              class="absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-colors"
              :class="{
                'bg-yellow-400': leave.status === 'pending',
                'bg-emerald-500': leave.status === 'approved',
                'bg-red-400': leave.status === 'cancelled',
                'bg-red-600': leave.status === 'rejected',
              }"
            ></div>

            <!-- Left side: Date & Icon -->
            <div class="flex items-center gap-4 flex-1">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                :class="{
                  'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400':
                    leave.status === 'pending',
                  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400':
                    leave.status === 'approved',
                  'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400':
                    leave.status === 'cancelled' || leave.status === 'rejected',
                }"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                  {{ formatDate(leave.start_date) }} — {{ formatDate(leave.end_date) }}
                </span>
                <span class="text-base font-bold text-gray-800 dark:text-gray-100">
                  {{ getLeaveTypeName(leave.leave_type_id) }}
                </span>
              </div>
            </div>

            <!-- Middle side: Status Badge -->
            <div class="flex items-center sm:justify-center">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
                :class="{
                  'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400':
                    leave.status === 'pending',
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400':
                    leave.status === 'approved',
                  'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400':
                    leave.status === 'cancelled' || leave.status === 'rejected',
                }"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full mr-2"
                  :class="{
                    'bg-yellow-400': leave.status === 'pending',
                    'bg-emerald-500': leave.status === 'approved',
                    'bg-red-400': leave.status === 'cancelled' || leave.status === 'rejected',
                  }"
                ></span>
                {{ getStatusLabel(leave.status) }}
              </span>
            </div>

            <!-- Right side: Actions -->
            <div class="flex items-center justify-end sm:min-w-[100px]">
              <button
                v-if="leave.status === 'approved' || leave.status === 'pending'"
                class="text-sm font-semibold text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 group/btn"
                @click="cancelLeave(leave.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                {{ $t('leaves.cancelLeaveAction') }}
              </button>
            </div>

            <!-- Comments row (full width below) -->
            <div
              v-if="leave.reason || leave.processed_reason"
              class="w-full sm:col-span-full border-t border-gray-50 dark:border-neutral-700/50 pt-3 mt-1 flex flex-col gap-1"
            >
              <p
                v-if="leave.processed_reason"
                class="text-xs text-gray-400 dark:text-neutral-500 italic"
              >
                <span class="font-semibold not-italic text-gray-500 dark:text-neutral-400"
                  >{{ $t('leaves.processedReason') }}:</span
                >
                {{ leave.processed_reason }}
              </p>
              <p v-if="leave.reason" class="text-xs text-gray-400 dark:text-neutral-500 italic">
                <span class="font-semibold not-italic text-gray-500 dark:text-neutral-400"
                  >{{ $t('leaves.reason') }}:</span
                >
                {{ leave.reason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const getLeaveTypeName = (leaveTypeId: string | number) => {
  const leaveType = leaveTypes.value.find((type: any) => type.id === leaveTypeId);
  return leaveType ? leaveType.name : t('common.unknown'); // Default to 'Unknown' if not found
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: t('leaves.pending'),
    approved: t('leaves.approved'),
    cancelled: t('leaves.cancelled'),
    rejected: t('leaves.rejected'),
  };
  return labels[status] || status;
};

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
};

const cancelLeave = async (leaveId: string | number) => {
  try {
    await leavesStore.cancelLeave(userStore.userId, leaveId, 'cancelled', 'cancelled by requester');
    useNuxtApp().$toast.success(t('leaves.cancelSuccess'), {
      position: 'bottom-right',
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch {
    (useNuxtApp() as any).$toast.error(t('leaves.cancelError'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  }
};

// Loading state and skeleton count
const loading = computed(() => leavesStore.loading);
const skeletonCount = ref(leavesData.value.length || 3); // Dynamically show skeletons for available leaves or default to 3
</script>

<style scoped>
/* Add any additional styles here */
</style>
