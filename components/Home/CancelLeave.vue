<template>
    <a href="#" class="py-3 px-5 inline-flex items-center gap-x-2 text-md dark:text-gray-100" aria-haspopup="dialog" aria-expanded="false"
        aria-controls="hs-scale-animation-modal" data-hs-overlay="#cancel-leaves">
        {{ $t('leaves.cancelLeave') }}
    </a>

    <div id="cancel-leaves"
        class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
        role="dialog" tabindex="-1" aria-labelledby="hs-scale-animation-modal-label">
        <div
            class="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
            <div class="w-full flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:text-gray-100">
                <button type="button"
                    class="size-8 ml-auto inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                    aria-label="Close" data-hs-overlay="#cancel-leaves">
                    <span class="sr-only">Close</span>
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
                <div class="flex items-center py-3 px-4">
                    <h3 id="hs-scale-animation-modal-label"
                        class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg">
                        {{ $t('leaves.cancelLeave') }}
                    </h3>
                </div>
                <div class="mx-auto font-extralight text-gray-500 dark:text-gray-100">{{ $t('leaves.selectLeaveToCancel') }}</div>
                <div class="p-4 overflow-y-auto">
                    <div class="new-leave-form py-10">

                        <form class="cancel-leave" @submit.prevent="handleSubmit">

                            <div class="max-h-60 overflow-y-auto">
                                <!-- Loop through filteredLeavesData and create a radio button for each leave -->
                                <div v-for="leave in filteredLeavesData" :key="leave.id">
                                    <label :for="'leave-' + leave.id"
                                        class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                        <input type="radio" name="leave" :id="'leave-' + leave.id"
                                            class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                            :value="leave" v-model="selectedLeave">
                                        <span class="text-xs text-gray-400 mx-auto">{{ leave.start_date }} - {{ leave.end_date }}<br>
                                            <span class="text-sm text-black font-semibold dark:text-gray-100">{{ calculateDays(leave.start_date, leave.end_date) }} {{ $t('leaves.days') }}</span>
                                        </span>
                                        <span class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold ">{{ getLeaveTypeName(leave.leave_type_id) }}</span>
                                        <span class="text-sm ms-auto text-green-700 font-semibold dark:text-gray-100">{{ leave.status === 'pending' ? $t('leaves.pending') : $t('leaves.approved') }}</span>
                                    </label>
                                </div>
                            </div>

                            <div class="space-y-3 pt-5">
                                <label for="textarea" class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">{{ $t('leaves.comments') }}</label>
                                <textarea class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg dark:bg-neutral-800 dark:text-gray-100"
                                    rows="3" :placeholder="$t('leaves.yourComments')" v-model="comment"></textarea>
                            </div>

                            <div class="py-5">
                                <button type="submit"
                                    class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                                    {{ $t('leaves.sendRequest') }}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';

const { t } = useI18n();
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;

// Ensure leavesData is always an array
const leavesData = computed(() => Array.isArray(leavesStore.leavesData?.currentUser) ? leavesStore.leavesData.currentUser : []);

const leaveTypes = computed(() => leavesStore.leavesData?.leavesTypes || []);

// Filter leaves based on status
const filteredLeavesData = computed(() =>
    leavesData.value.filter(leave =>
        leave.status === 'pending' || leave.status === 'approved'
    )
);

// Selected leave and comment
const selectedLeave = ref(null);
const comment = ref('');

// Function to get leave type name based on leave_type_id
const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.value.find(type => type.id === leaveTypeId);
    return leaveType ? leaveType.name : 'Unknown'; // Default to 'Unknown' if not found
};

// Function to calculate the number of days between start_date and end_date
const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the end date
    return diffDays;
};

// Handle form submission
const handleSubmit = async () => {
    if (selectedLeave.value) {
        try {
            await leavesStore.cancelLeave(
                centralStore.userStore.userId, // Pass userId
                selectedLeave.value.id,   
                'cancelled',      // Pass leaveId
                comment.value
            );

            useNuxtApp().$toast.success(t('leaves.cancelSuccess'), {
                position: "bottom-right",
                autoClose: 5000, // Close automatically after 5 seconds
            });

        } catch (error) {
            console.error('Error submitting leave request:', error);
            // Handle the error as needed
        }
    } else {
        console.log('No leave selected');
    }
};
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>
