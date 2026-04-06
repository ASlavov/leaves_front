<template>
  <button
    class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none"
    @click="openModal"
  >
    {{ $t('leaves.newLeaveRequest') }}
  </button>

  <div
    v-if="isModalOpen"
    id="new-leave-modal"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50"
    role="dialog"
    tabindex="-1"
    aria-labelledby="hs-scale-animation-modal-label"
    @click.self="closeModal"
  >
    <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-lg mx-4 relative">
      <button
        type="button"
        class="absolute top-2 right-2 size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
        aria-label="Close"
        @click="closeModal"
      >
        <span class="sr-only">{{ $t('common.cancel') }}</span>
        <svg
          class="shrink-0 size-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
      <div class="flex justify-between items-center py-3 px-4">
        <h3
          id="hs-scale-animation-modal-label"
          class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg"
        >
          {{ $t('leaves.newLeaveRequest') }}
        </h3>
      </div>
      <div class="p-4 overflow-y-auto">
        <!-- Conditionally render the leave counter if leaveType is selected -->
        <div
          v-if="leaveType"
          class="leave-counter bg-gray-100 py-2 max-w-[200px] text-center mx-auto text-sm rounded-lg dark:bg-neutral-800"
        >
          <span class="leave-counter-text dark:text-gray-300"
            >{{ $t('leaves.availableDays') }}
          </span>
          <div class="leave-counter-count text-red-600 font-bold text-md text-lg">
            {{ selectedLeave?.remaining_days ?? '0' }}
          </div>
          <div
            v-if="selectedLeaveTypeTemplate?.accrual_type === 'pro_rata_monthly' && isFirstYear"
            class="text-[10px] text-blue-600 dark:text-blue-400 mt-1 leading-tight px-1"
          >
            {{ $t('leaves.proRataNote') }}
          </div>
        </div>
        <div
          v-if="
            selectedLeaveTypeTemplate?.allow_wallet_overflow &&
            computedRequestedDays > remainingDays
          "
          class="bg-amber-100 text-amber-800 p-2 rounded text-sm mt-3 text-center mx-auto max-w-[400px]"
        >
          {{
            $t('leaves.overflowWarning', {
              paid: remainingDays,
              overflow: (computedRequestedDays - remainingDays).toFixed(2),
            })
          }}
        </div>
        <div class="new-leave-form py-10">
          <form class="space-y-6" @submit.prevent="submitForm">
            <!-- First row: Single input -->
            <div>
              <label
                for="input1"
                class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                >{{ $t('leaves.leaveType') }} <span class="text-[#EA021A]">*</span></label
              >
              <div class="space-y-3">
                <select
                  v-model="leaveType"
                  class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                >
                  <option class="dark:bg-neutral-800 dark:text-gray-100" value="">
                    {{ $t('leaves.selectLeave') }}
                  </option>
                  <!-- Loop through leavesData to populate the options -->
                  <option
                    v-for="(leave, index) in filteredLeavesTypes"
                    :key="index"
                    class="dark:bg-neutral-800 dark:text-gray-100"
                    :value="leave.leave_type_id"
                  >
                    {{ leave.leave_type_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Second row: Two inputs in two columns -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  for="input2"
                  class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                  >{{
                    selectedLeaveTypeTemplate?.is_hourly ? $t('common.date') : $t('leaves.fromDate')
                  }}
                  <span class="text-[#EA021A]">*</span></label
                >
                <input
                  ref="datePickerStart"
                  v-model="startDate"
                  type="text"
                  class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                  :placeholder="$t('common.selectDate')"
                />
              </div>
              <div v-show="!selectedLeaveTypeTemplate?.is_hourly">
                <label
                  for="input3"
                  class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                  >{{ $t('leaves.toHuman') }} <span class="text-[#EA021A]">*</span></label
                >
                <input
                  ref="datePickerEnd"
                  v-model="endDate"
                  type="text"
                  class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                  :placeholder="$t('common.selectDate')"
                />
              </div>
            </div>

            <!-- Hourly Time Row -->
            <div
              v-if="selectedLeaveTypeTemplate?.is_hourly"
              class="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                  >{{ $t('leaves.startTime') }} <span class="text-[#EA021A]">*</span></label
                >
                <input
                  v-model="startTime"
                  type="time"
                  class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                  >{{ $t('leaves.endTime') }} <span class="text-[#EA021A]">*</span></label
                >
                <input
                  v-model="endTime"
                  type="time"
                  class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                />
              </div>
              <div class="col-span-2 text-sm text-gray-600 dark:text-gray-300 -mt-2">
                <span v-if="computedRequestedDays > 0">
                  =
                  {{
                    (
                      computedRequestedDays * (selectedLeaveTypeTemplate.hours_per_day || 8)
                    ).toFixed(2)
                  }}
                  {{ $t('settings.hoursPerDay').toLowerCase() }} ({{
                    computedRequestedDays.toFixed(2)
                  }}
                  {{ $t('leaves.days') }})
                </span>
              </div>
            </div>

            <!-- Third row: Textarea -->
            <div>
              <label
                for="textarea"
                class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                >{{ $t('leaves.comments') }}</label
              >
              <div class="space-y-3">
                <textarea
                  v-model="comments"
                  class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg dark:bg-neutral-800 dark:text-gray-100"
                  rows="3"
                  :placeholder="$t('leaves.yourComments')"
                ></textarea>
              </div>
            </div>

            <!-- Attachment -->
            <div v-if="isAttachmentRequired">
              <label class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">
                {{ $t('leaves.attachmentRequired') }}
                <span class="text-[12px] text-gray-500 font-normal">{{
                  $t('leaves.exceedsThreshold')
                }}</span>
                <span class="text-[#EA021A]">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.png,.pdf"
                class="py-2.5 px-4 block w-full border border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100"
                @change="handleAttachmentChange"
              />
            </div>

            <!-- Fourth row: Button and success message -->
            <div>
              <button
                type="submit"
                class="py-3 inline-flex justify-center rounded-3xl border border-transparent dark:bg-red-600 bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
              >
                {{ $t('leaves.sendRequest') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { extractApiError } from '@/utils/extractApiError';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { ref, computed, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import type { AvailableDaysEntry, LeaveType } from '@/types';

const { t } = useI18n();
const datePickerStart = ref<HTMLInputElement | null>(null);
const datePickerEnd = ref<HTMLInputElement | null>(null);

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const leavesData = computed<AvailableDaysEntry[]>(
  () => leavesStore.leavesData?.leavesAvailableDays || [],
);
const leavesTypes = computed<LeaveType[]>(() => leavesStore.leavesData?.leavesTypes || []);
const userStore = centralStore.userStore;
const user_id = computed(() => userStore.userId);
const workWeekStore = centralStore.workWeekStore;
const holidaysStore = centralStore.holidaysStore;

// Working days as a Set for fast lookup (0=Sun, 1=Mon, ..., 6=Sat)
const workingDaySet = computed(() => new Set(workWeekStore.days));
// Moving (year-specific) holidays: exact YYYY-MM-DD Set
const movingHolidaySet = computed(
  () =>
    new Set(
      holidaysStore.holidays
        .filter((h: { is_recurring: boolean }) => !h.is_recurring)
        .map((h: { date: string }) => h.date),
    ),
);
// Recurring holidays: MM-DD Set (applies every year)
const recurringMonthDaySet = computed(
  () =>
    new Set(
      holidaysStore.holidays
        .filter((h: { is_recurring: boolean }) => h.is_recurring)
        .map((h: { date: string }) => h.date.slice(5)),
    ),
);

const leaveType = ref<string | number>('');
const startDate = ref('');
const endDate = ref('');
const comments = ref('');

const startTime = ref('');
const endTime = ref('');
const attachmentBase64 = ref('');
const attachmentFilename = ref('');

const isModalOpen = ref(false);

const selectedLeaveTypeTemplate = computed(() => {
  return leavesTypes.value.find((lt) => String(lt.id) === String(leaveType.value)) || null;
});

const isFirstYear = computed(() => {
  const hireDateStr = userStore.userInfo?.hire_date;
  if (!hireDateStr) return false;
  const hireY = new Date(hireDateStr).getFullYear();
  return hireY === new Date().getFullYear();
});

const remainingDays = computed(() => {
  if (!selectedLeave.value) return 0;
  return typeof selectedLeave.value.remaining_days === 'number'
    ? selectedLeave.value.remaining_days
    : parseFloat(selectedLeave.value.remaining_days as unknown as string);
});

const computedRequestedDays = computed(() => {
  if (selectedLeaveTypeTemplate.value?.is_hourly) {
    if (!startTime.value || !endTime.value) return 0;
    const startParts = startTime.value.split(':');
    const endParts = endTime.value.split(':');
    const hours =
      parseInt(endParts[0]) +
      parseInt(endParts[1]) / 60 -
      (parseInt(startParts[0]) + parseInt(startParts[1]) / 60);
    const hrsPerDay = selectedLeaveTypeTemplate.value.hours_per_day || 8;
    return hours > 0 ? hours / hrsPerDay : 0;
  }

  if (!startDate.value || !endDate.value) return 0;

  const current = new Date(startDate.value);
  const end = new Date(endDate.value);
  let days = 0;
  while (current <= end) {
    if (!isExcludedDay(current)) days++;
    current.setDate(current.getDate() + 1);
  }
  return days;
});

const isAttachmentRequired = computed(() => {
  const threshold = selectedLeaveTypeTemplate.value?.attachment_required_after_days;
  if (!threshold) return false;
  return computedRequestedDays.value > threshold;
});

const handleAttachmentChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    attachmentFilename.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      attachmentBase64.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

// Format a JS Date as YYYY-MM-DD using local time (avoids UTC offset issues)
const toLocalDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper: is a given JS Date a non-working day (off-day or public holiday)?
const isExcludedDay = (date: Date) => {
  const dow = date.getDay();
  const dateStr = toLocalDateStr(date);
  const monthDay = dateStr.slice(5); // "MM-DD"
  const isHoliday = movingHolidaySet.value.has(dateStr) || recurringMonthDaySet.value.has(monthDay);
  return !workingDaySet.value.has(dow) || isHoliday;
};

const datePickrSettings = computed(() => ({
  dateFormat: 'Y-m-d',
  disable: [isExcludedDay],
}));

let endDateInstance: flatpickr.Instance | null = null;

// --- A helper function to manage the date pickers ---
const initializeDatePickers = () => {
  const addWorkingDays = (startDate: Date, days: number) => {
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

  const today = new Date();

  // Get the remaining days from the selected leave type
  const maxDays = selectedLeaveTypeTemplate.value?.allow_wallet_overflow
    ? 999
    : Math.max(0, remainingDays.value - 1);

  // Logic for the start date picker
  if (datePickerStart.value) {
    flatpickr(datePickerStart.value, {
      ...datePickrSettings.value,
      minDate: today,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const startDateInside = selectedDates[0];
          startDate.value = toLocalDateStr(startDateInside);
          updateEndDateDatePicker(startDateInside, maxDays);
        }
      },
    });
  }

  // Logic for the end date picker
  if (datePickerEnd.value) {
    endDateInstance = flatpickr(datePickerEnd.value, {
      ...datePickrSettings.value,
      minDate: today,
      maxDate: maxDays > 0 ? addWorkingDays(today, maxDays) : undefined,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          endDate.value = toLocalDateStr(selectedDates[0]);
        }
      },
    });
  }

  // Function to update end date picker options
  const updateEndDateDatePicker = (minDate: Date, daysToAdd: number) => {
    const newMinDate = new Date(minDate);
    const newMaxDate = addWorkingDays(minDate, daysToAdd);

    if (endDateInstance) {
      endDateInstance.destroy();
    }
    if (datePickerEnd.value) {
      endDateInstance = flatpickr(datePickerEnd.value, {
        ...datePickrSettings.value,
        defaultDate: newMinDate,
        minDate: newMinDate,
        maxDate: newMaxDate,
        onChange: (selectedDates) => {
          if (selectedDates.length) {
            endDate.value = toLocalDateStr(selectedDates[0]);
          }
        },
      });
    }
    // Pre-fill endDate with the default (start date)
    endDate.value = toLocalDateStr(newMinDate);
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

const filteredLeavesTypes = computed<AvailableDaysEntry[]>(() =>
  leavesData.value.filter((leave) => leavesTypes.value.some((lt) => leave.leave_type_id === lt.id)),
);

const selectedLeave = computed<AvailableDaysEntry | null>(() => {
  if (leavesData.value && leaveType.value) {
    return (
      leavesData.value.find((leave) => String(leave.leave_type_id) === String(leaveType.value)) ||
      null
    );
  }
  return null;
});

const submitForm = async () => {
  if (!user_id.value) return;

  if (isAttachmentRequired.value && !attachmentBase64.value) {
    useNuxtApp().$toast.error(t('errors.leaves.attachmentRequired'), { position: 'bottom-right' });
    return;
  }

  const leaveRequest = {
    id: user_id.value,
    leave_type_id: leaveType.value,
    start_date: startDate.value,
    end_date: selectedLeaveTypeTemplate.value?.is_hourly ? startDate.value : endDate.value,
    reason: comments.value,
  };

  try {
    await leavesStore.newLeave(
      user_id.value,
      leaveRequest.leave_type_id,
      leaveRequest.start_date,
      leaveRequest.end_date,
      leaveRequest.reason,
      selectedLeaveTypeTemplate.value?.is_hourly ? startTime.value : undefined,
      selectedLeaveTypeTemplate.value?.is_hourly ? endTime.value : undefined,
      isAttachmentRequired.value ? attachmentBase64.value : undefined,
      isAttachmentRequired.value ? attachmentFilename.value : undefined,
    );

    useNuxtApp().$toast.success(t('leaves.submitSuccess'), {
      position: 'bottom-right',
      autoClose: 5000,
    });

    closeModal(); // Close modal on success
  } catch (error) {
    console.error('Error submitting leave request:', error);
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.submitError'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  }
};
</script>

<style scoped></style>
