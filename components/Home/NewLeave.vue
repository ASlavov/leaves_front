<template>
  <button class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none"
          @click="openModal">
    {{ $t('leaves.newLeaveRequest') }}
  </button>

  <div
      id="new-leave-modal"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50"
      role="dialog" tabindex="-1" aria-labelledby="hs-scale-animation-modal-label"
      v-if="isModalOpen"
      @click.self="closeModal"
  >
    <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-lg relative">
      <button type="button"
              class="absolute top-2 right-2 size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
              aria-label="Close" @click="closeModal">
        <span class="sr-only">Close</span>
        <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
      <div class="flex justify-between items-center py-3 px-4">
        <h3 id="hs-scale-animation-modal-label"
            class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg">
          {{ $t('leaves.newLeaveRequest') }}
        </h3>
      </div>
      <div class="p-4 overflow-y-auto">
        <!-- Conditionally render the leave counter if leaveType is selected -->
        <div v-if="leaveType"
             class="leave-counter bg-gray-100 py-2 max-w-[200px] text-center mx-auto text-sm rounded-lg dark:bg-neutral-800">
          <span class="leave-counter-text dark:text-gray-300">{{ $t('leaves.availableDays') }} </span>
          <div class="leave-counter-count text-red-600 font-bold text-md text-lg">
            {{ selectedLeave?.remaining_days ?? '0' }}
          </div>
        </div>
        <div class="new-leave-form py-10">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- First row: Single input -->
            <div>
              <label for="input1"
                     class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">{{ $t('leaves.leaveType') }} <span class="text-[#EA021A]">*</span></label>
              <div class="space-y-3">
                <select v-model="leaveType"
                        class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100">
                  <option class="dark:bg-neutral-800 dark:text-gray-100" value="">{{ $t('leaves.selectLeave') }}</option>
                  <!-- Loop through leavesData to populate the options -->
                  <option class="dark:bg-neutral-800 dark:text-gray-100"
                          v-for="(leave, index) in filteredLeavesTypes" :key="index"
                          :value="leave.leave_type_id">
                    {{ leave.leave_type_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Second row: Two inputs in two columns -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label for="input2"
                       class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">{{ $t('leaves.fromDate') }} <span class="text-[#EA021A]">*</span></label>
                <input type="text" v-model="startDate" ref="datePickerStart"
                       class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                       :placeholder="$t('common.selectDate')">
              </div>
              <div>
                <label for="input3"
                       class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">{{ $t('leaves.toHuman') }} <span class="text-[#EA021A]">*</span></label>
                <input type="text" v-model="endDate" ref="datePickerEnd"
                       class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                       :placeholder="$t('common.selectDate')">
              </div>
            </div>

            <!-- Third row: Textarea -->
            <div>
              <label for="textarea"
                     class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">{{ $t('leaves.comments') }}</label>
              <div class="space-y-3">
                <textarea v-model="comments"
                          class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg dark:bg-neutral-800 dark:text-gray-100"
                          rows="3" :placeholder="$t('leaves.yourComments')"></textarea>
              </div>
            </div>

            <!-- Fourth row: Button and success message -->
            <div>
              <button type="submit"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent dark:bg-red-600 bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                {{ $t('leaves.sendRequest') }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { extractApiError } from '@/utils/extractApiError';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore.js';

const { t } = useI18n();
const datePickerStart = ref(null);
const datePickerEnd = ref(null);

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const leavesData = computed(() => leavesStore.leavesData?.leavesAvailableDays || []);
const leavesTypes = computed(() => leavesStore.leavesData?.leavesTypes);
const userStore = centralStore.userStore;
const user_id = computed(() => userStore.userId);
const workWeekStore = centralStore.workWeekStore;
const holidaysStore = centralStore.holidaysStore;

// Working days as a Set for fast lookup (0=Sun, 1=Mon, ..., 6=Sat)
const workingDaySet = computed(() => new Set(workWeekStore.days));
// Moving (year-specific) holidays: exact YYYY-MM-DD Set
const movingHolidaySet = computed(() =>
  new Set(holidaysStore.holidays.filter(h => !h.is_recurring).map(h => h.date))
);
// Recurring holidays: MM-DD Set (applies every year)
const recurringMonthDaySet = computed(() =>
  new Set(holidaysStore.holidays.filter(h => h.is_recurring).map(h => h.date.slice(5)))
);

const leaveType = ref('');
const startDate = ref('');
const endDate = ref('');
const comments = ref('');
const successMessage = ref('');

const isModalOpen = ref(false);

// Format a JS Date as YYYY-MM-DD using local time (avoids UTC offset issues)
const toLocalDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper: is a given JS Date a non-working day (off-day or public holiday)?
const isExcludedDay = (date) => {
  const dow = date.getDay();
  const dateStr = toLocalDateStr(date);
  const monthDay = dateStr.slice(5); // "MM-DD"
  const isHoliday = movingHolidaySet.value.has(dateStr) || recurringMonthDaySet.value.has(monthDay);
  return !workingDaySet.value.has(dow) || isHoliday;
};

const datePickrSettings = computed(() => ({
  dateFormat: "Y-m-d",
  disable: [isExcludedDay],
}));

// --- A helper function to manage the date pickers ---
const initializeDatePickers = () => {
  const today = new Date();

  // Get the remaining days from the selected leave type
  const maxDays = (selectedLeave.value?.remaining_days ?? 1) - 1;

  // Logic for the start date picker
  const startDateInstance = flatpickr(datePickerStart.value, {
    ...datePickrSettings.value,
    minDate: today,
    onChange: (selectedDates) => {
      if (selectedDates.length) {
        const startDateInside = selectedDates[0];
        startDate.value = toLocalDateStr(startDateInside);
        updateEndDateDatePicker(startDateInside, maxDays);
      }
    }
  });

  // Logic for the end date picker
  const endDateInstance = flatpickr(datePickerEnd.value, {
    ...datePickrSettings.value,
    minDate: today,
    maxDate: maxDays > 0 ? addWorkingDays(today, maxDays) : null,
    onChange: (selectedDates) => {
      if (selectedDates.length) {
        endDate.value = toLocalDateStr(selectedDates[0]);
      }
    }
  });

  // Function to update end date picker options
  const updateEndDateDatePicker = (minDate, daysToAdd) => {
    const newMinDate = new Date(minDate);
    const newMaxDate = addWorkingDays(minDate, daysToAdd);

    if (endDateInstance) {
      endDateInstance.destroy();
    }
    const newInstance = flatpickr(datePickerEnd.value, {
      ...datePickrSettings.value,
      defaultDate: newMinDate,
      minDate: newMinDate,
      maxDate: newMaxDate,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          endDate.value = toLocalDateStr(selectedDates[0]);
        }
      }
    });
    // Pre-fill endDate with the default (start date)
    endDate.value = toLocalDateStr(newMinDate);
  };

  const addWorkingDays = (startDate, days) => {
    const date = new Date(startDate);
    let daysAdded = 0;
    while (daysAdded < days) {
      date.setDate(date.getDate() + 1);
      if (!isExcludedDay(date)) {
        daysAdded++;
      }
    }
    return date;
  };
};

// --- Watchers for reactivity ---
// Watch for changes in leaveType to update the date pickers
watch(leaveType, (newLeaveType, oldLeaveType) => {
  // Re-initialize date pickers only if the type has changed
  if (newLeaveType !== oldLeaveType) {
    initializeDatePickers();
  }
});

const openModal = () => {
  isModalOpen.value = true;
  nextTick(() => {
    // Initialize the date pickers only when the modal is first opened
    initializeDatePickers();
  });
};

const closeModal = () => {
  isModalOpen.value = false;
  // Optional: Reset form fields here if needed
  leaveType.value = '';
  startDate.value = '';
  endDate.value = '';
  comments.value = '';
};

const filteredLeavesTypes = computed(
    () => leavesData.value.filter(
        leave => leavesTypes.value.some(
            leaveType => leave.leave_type_id === leaveType.id
        )
    )
);

const selectedLeave = computed(() => {
  if (leavesData.value && leaveType.value) {
    return leavesData.value.find(leave => leave.leave_type_id === leaveType.value) || null;
  }
  return null;
});

const submitForm = async () => {
  const leaveRequest = {
    id: user_id.value,
    leave_type_id: leaveType.value,
    start_date: startDate.value,
    end_date: endDate.value,
    reason: comments.value,
  };

  try {
    await leavesStore.newLeave(user_id.value, leaveRequest.leave_type_id, leaveRequest.start_date, leaveRequest.end_date, leaveRequest.reason);

    useNuxtApp().$toast.success(t('leaves.submitSuccess'), {
      position: "bottom-right",
      autoClose: 5000,
    });

    closeModal(); // Close modal on success

  } catch (error) {
    console.error('Error submitting leave request:', error);
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.submitError'), {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};
</script>

<style scoped>
</style>
