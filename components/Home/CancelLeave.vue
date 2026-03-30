<template>
  <a href="#" class="py-3 px-5 inline-flex items-center gap-x-2 text-md dark:text-gray-100" @click.prevent="isOpen = true">
    {{ $t('leaves.cancelLeave') }}
  </a>

  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto bg-black/50 flex items-center justify-center"
        @click.self="isOpen = false"
      >
        <div class="sm:max-w-lg sm:w-full m-3 sm:mx-auto">
          <div class="w-full flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:text-gray-100">
            <button
              type="button"
              class="size-8 ml-auto mt-3 mr-3 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400"
              :aria-label="$t('common.close')"
              @click="isOpen = false"
            >
              <span class="sr-only">{{ $t('common.close') }}</span>
              <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            <div class="flex items-center py-3 px-4">
              <h3 class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg">
                {{ $t('leaves.cancelLeave') }}
              </h3>
            </div>
            <div class="mx-auto font-extralight text-gray-500 dark:text-gray-100">{{ $t('leaves.selectLeaveToCancel') }}</div>
            <div class="p-4 overflow-y-auto">
              <div class="new-leave-form py-10">
                <form class="cancel-leave" @submit.prevent="handleSubmit">
                  <div class="max-h-60 overflow-y-auto">
                    <div v-for="leave in filteredLeavesData" :key="leave.id">
                      <label :for="'leave-' + leave.id"
                        class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                        <input type="radio" name="leave" :id="'leave-' + leave.id"
                          class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                          :value="leave" v-model="selectedLeave">
                        <span class="text-xs text-gray-400 mx-auto">{{ leave.start_date }} - {{ leave.end_date }}<br>
                          <span class="text-sm text-black font-semibold dark:text-gray-100">{{ calculateDays(leave.start_date, leave.end_date) }} {{ $t('leaves.days') }}</span>
                        </span>
                        <span class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold">{{ getLeaveTypeName(leave.leave_type_id) }}</span>
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
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { extractApiError } from '@/utils/extractApiError';

const { t } = useI18n();
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;

const isOpen = ref(false);

const leavesData = computed(() => Array.isArray(leavesStore.leavesData?.currentUser) ? leavesStore.leavesData.currentUser : []);
const leaveTypes = computed(() => leavesStore.leavesData?.leavesTypes || []);

const filteredLeavesData = computed(() =>
  leavesData.value.filter(leave => leave.status === 'pending' || leave.status === 'approved')
);

const selectedLeave = ref(null);
const comment = ref('');

const getLeaveTypeName = (leaveTypeId) => {
  const leaveType = leaveTypes.value.find(type => type.id === leaveTypeId);
  return leaveType ? leaveType.name : 'Unknown';
};

const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const handleSubmit = async () => {
  if (selectedLeave.value) {
    try {
      await leavesStore.cancelLeave(
        centralStore.userStore.userId,
        selectedLeave.value.id,
        'cancelled',
        comment.value
      );
      useNuxtApp().$toast.success(t('leaves.cancelSuccess'), { position: 'bottom-right', autoClose: 5000 });
      isOpen.value = false;
    } catch (error) {
      const { type, message } = extractApiError(error);
      useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.cancelError'), { position: 'bottom-right', autoClose: 5000 });
    }
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
