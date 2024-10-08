<template>
  <button class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none"
    aria-haspopup="dialog" aria-expanded="false" aria-controls="new-leave-modal" data-hs-overlay="#new-leave-modal"
          @click="openModal">
    Νέο αίτημα άδειας
  </button>

  <div id="new-leave-modal"
    class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
    role="dialog" tabindex="-1" aria-labelledby="hs-scale-animation-modal-label"
       v-if="isModalOpen"
  >
    <div
      class="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
      <div class="w-full flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:text-gray-100">
        <button type="button"
          class="size-8 ml-auto inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
          aria-label="Close" data-hs-overlay="#new-leave-modal">
          <span class="sr-only" @click="closeModal">Close</span>
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
        <div class="flex justify-between items-center py-3 px-4">
          <h3 id="hs-scale-animation-modal-label"
            class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg">
            Νεό αίτημα άδειας
          </h3>
        </div>
        <div class="p-4 overflow-y-auto">
          <!-- Conditionally render the leave counter if leaveType is selected -->
          <div v-if="leaveType"
            class="leave-counter bg-gray-100 py-2 max-w-[200px] text-center mx-auto text-sm rounded-lg">
            <span class="leave-counter-text">Διαθέσιμες ημέρες </span>
            <div class="leave-counter-count text-red-600 font-bold text-md text-lg">
              {{ selectedLeave?.remaining_days ?? '0' }}
            </div>
          </div>
          <div class="new-leave-form py-10">
            <form @submit.prevent="submitForm" class="space-y-6">
              <!-- First row: Single input -->
              <div>
                <label for="input1" class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">Τύπος άδειας</label>
                <div class="space-y-3">
                  <select v-model="leaveType" class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100">
                    <option class="dark:bg-neutral-800 dark:text-gray-100" value="">Επιλέξτε άδεια</option>
                    <!-- Loop through leavesData to populate the options -->
                    <option class="dark:bg-neutral-800 dark:text-gray-100" v-for="(leave, index) in filteredLeavesTypes" :key="index" :value="leave.id">
                      {{ leave.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Second row: Two inputs in two columns -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="input2" class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">Ημ/νια απο</label>
                  <input type="text" v-model="startDate" ref="datePickerStart"
                    class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                    placeholder="Επιλέξτε ημ/νια">
                </div>
                <div>
                  <label for="input3" class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">Ημ/νια μέχρι</label>
                  <input type="text" v-model="endDate" ref="datePickerEnd"
                    class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm dark:bg-neutral-800 dark:text-gray-100"
                    placeholder="Επιλέξτε ημ/νια">
                </div>
              </div>

              <!-- Third row: Textarea -->
              <div>
                <label for="textarea" class="block text-sm font-medium text-gray-700 py-3 dark:text-gray-100">Σχόλια (προαιρετικό)</label>
                <div class="space-y-3">
                  <textarea v-model="comments" class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg dark:bg-neutral-800 dark:text-gray-100"
                    rows="3" placeholder="This is a textarea placeholder"></textarea>
                </div>
              </div>

              <!-- Fourth row: Button and success message -->
              <div>
                <button type="submit"
                  class="py-3 inline-flex justify-center rounded-3xl border border-transparent dark:bg-red-600 bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                  Αποστολή αιτήματος
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import { ref, computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore.js';

export default {
  name: 'NewLeave',
  setup() {
    const centralStore = useCentralStore();
    const leavesStore = centralStore.leavesStore;

    // Ensure leavesData is always an array
    const leavesData = computed(() => leavesStore.leavesData?.leavesAvailableDays || []);
    const leavesTypes = computed(() => leavesStore.leavesData?.leavesTypes);
    const userStore = centralStore.userStore;
    const user_id = computed(() => userStore.userId);

    const leaveType = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const comments = ref('');
    const successMessage = ref(''); // Reactive variable for success message

    const isModalOpen = ref(false);

    // Functions to open and close the modal
    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const filteredLeavesTypes = computed(
        () => leavesData.value.filter(
        leave => leavesTypes.value.some(
            leaveType => leave.id === leaveType.id
          )
       )
    || []);

    const selectedLeave = computed(() => {
      if (leavesData.value && leaveType.value) {
        return leavesData.value.find(leave => leave.id === leaveType.value) || null;
      }
      return null;
    });
    const submitForm = async () => {
      const leaveRequest = {
        id: user_id.value,  // Adjusted based on your Postman example
        leave_type_id: leaveType.value,
        start_date: startDate.value,
        end_date: endDate.value,
        reason: comments.value,
      };

      console.log(leaveRequest);  // Log the data for debugging

      try {
        await leavesStore.newLeave(user_id.value, leaveRequest.leave_type_id, leaveRequest.start_date, leaveRequest.end_date, leaveRequest.reason);
        
        useNuxtApp().$toast.success('Η αίτηση άδειας υποβλήθηκε επιτυχώς!', {
            position: "bottom-right",
            autoClose: 5000, // Close automatically after 5 seconds
          });

      } catch (error) {
        console.error('Error submitting leave request:', error);
        successMessage.value = ''; // Clear the success message on error
        // Handle the error as needed
      }
    };

    return {
      user_id,
      leavesData,
      leaveType,
      startDate,
      endDate,
      comments,
      selectedLeave,
      filteredLeavesTypes,
      isModalOpen,
      openModal,
      closeModal,
      successMessage,  // Make successMessage available to the template
      submitForm,
    };
  },
  mounted() {
  const today = new Date();
  
  // Initialize the start date picker
  flatpickr(this.$refs.datePickerStart, {
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
        flatpickr(this.$refs.datePickerEnd, {
          dateFormat: "Y-m-d",
          minDate: minEndDate // Disable dates before one day after the start date
        });
      }
    }
  });

  // Initialize the end date picker
  flatpickr(this.$refs.datePickerEnd, {
    dateFormat: "Y-m-d",
    minDate: today // Disable past dates initially
  });
},
};
</script>
