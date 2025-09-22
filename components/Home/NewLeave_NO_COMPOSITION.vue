<template>
  <!-- Button to open the modal -->
  <button
      class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-700 focus:outline-none"
      @click="openModal"
  >
    Νέο αίτημα άδειας
  </button>

  <!-- Modal -->
  <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div
        class="bg-white dark:bg-neutral-800 dark:text-gray-100 rounded-lg shadow-lg overflow-hidden w-full max-w-lg"
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700">
        <h3 class="font-bold text-gray-800 dark:text-white text-lg">
          Νέο αίτημα άδειας
        </h3>
        <button
            type="button"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            @click="closeModal"
        >
          <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 overflow-y-auto">
        <!-- Conditionally render the leave counter if leaveType is selected -->
        <div
            v-if="leaveType"
            class="leave-counter bg-gray-100 py-2 max-w-[200px] text-center mx-auto text-sm rounded-lg"
        >
          <span class="leave-counter-text">Διαθέσιμες ημέρες </span>
          <div class="leave-counter-count text-red-600 font-bold text-md text-lg">
            {{ selectedLeave?.remaining_days ?? '0' }}
          </div>
        </div>
        <div class="new-leave-form py-10">
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- First row: Single input -->
            <div>
              <label
                  for="input1"
                  class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
              >Τύπος άδειας</label
              >
              <div class="space-y-3">
                <select
                    v-model="leaveType"
                    class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                >
                  <option
                      class="dark:bg-neutral-800 dark:text-gray-100"
                      value=""
                      selected
                  >Επιλέξτε άδεια</option
                  >
                  <!-- Loop through mappedLeavesData to populate the options -->
                  <option
                      class="dark:bg-neutral-800 dark:text-gray-100"
                      v-for="(leave, index) in mappedLeavesData"
                      :key="index"
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
                >Ημ/νια από</label
                >
                <input
                    type="text"
                    v-model="startDate"
                    ref="datePickerStart"
                    class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                    placeholder="Επιλέξτε ημ/νια"
                />
              </div>
              <div>
                <label
                    for="input3"
                    class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
                >Ημ/νια μέχρι</label
                >
                <input
                    type="text"
                    v-model="endDate"
                    ref="datePickerEnd"
                    class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                    placeholder="Επιλέξτε ημ/νια"
                />
              </div>
            </div>

            <!-- Third row: Textarea -->
            <div>
              <label
                  for="textarea"
                  class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100"
              >Σχόλια (προαιρετικό)</label
              >
              <div class="space-y-3">
                <textarea
                    v-model="comments"
                    class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg dark:bg-neutral-800 dark:text-gray-100"
                    rows="3"
                    placeholder="This is a textarea placeholder"
                ></textarea>
              </div>
            </div>

            <!-- Fourth row: Button and success message -->
            <div>
              <button
                  type="submit"
                  class="py-3 inline-flex justify-center rounded-3xl border border-transparent dark:bg-red-600 bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
              >
                Αποστολή αιτήματος
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import { useCentralStore } from '@/stores/centralStore.js';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

const leavesTypes = computed(() => leavesStore.leavesData?.leavesTypes || []);
const leavesData = computed(() => leavesStore.leavesData?.leavesAvailableDays || []);
const user_id = computed(() => userStore.userId);

const leaveType = ref(null);
const comments = ref('');
const successMessage = ref('');

const mappedLeavesData = ref([]);
const isModalOpen = ref(false);

// Functions to open and close the modal
const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};


watchEffect(() => {
  const leavesTypesList = leavesTypes.value || [];

  mappedLeavesData.value = leavesData.value?.map(leave => {
    const leaveTypeObj = leavesTypesList.find(type => type.name === leave.leave_type_name);
    return {
      ...leave,
      leave_type_id: leaveTypeObj ? leaveTypeObj.id : null,
    };
  });
});

const selectedLeave = computed(() => {
  if (mappedLeavesData.value && leaveType.value !== null) {
    return mappedLeavesData.value.find(
        leave => Number(leave.leave_type_id) === Number(leaveType.value)
    ) || null;
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

  console.log(leaveRequest);

  try {
    await leavesStore.newLeave(
        user_id.value,
        leaveRequest.leave_type_id,
        leaveRequest.start_date,
        leaveRequest.end_date,
        leaveRequest.reason
    );

    useNuxtApp().$toast.success('Η αίτηση άδειας υποβλήθηκε επιτυχώς!', {
      position: "bottom-right",
      autoClose: 5000,
    });

  } catch (error) {
    console.error('Error submitting leave request:', error);
    successMessage.value = '';
    // Handle the error as needed
  }
};

const datePickerStart = ref(null);
const datePickerEnd = ref(null);

const startDate = ref(datePickerStart ?? new Date());
const endDate = ref(datePickerEnd ?? new Date());

onMounted(() => {
  // Ensure flatpickr only runs on the client
  if (typeof window !== 'undefined') {
    const today = new Date();

    // Initialize the start date picker
    flatpickr(datePickerStart, {
      dateFormat: "Y-m-d",
      minDate: today, // Disable past dates
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const startDate = selectedDates[0];
          this.startDate = startDate;

          // Set the end date to one day after the start date
          const minEndDate = new Date(startDate);
          minEndDate.setDate(minEndDate.getDate() + 1);

          // Update the end date picker
          flatpickr(datePickerEnd, {
            dateFormat: "Y-m-d",
            minDate: minEndDate // Disable dates before one day after the start date
          });
        }
      }
    });
  }
});
</script>
