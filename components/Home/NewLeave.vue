<template>
  <button class="bg-red-600 text-white rounded-full py-2 px-4 hover:bg-red-600 focus:outline-none"
    aria-haspopup="dialog" aria-expanded="false" aria-controls="new-leave-modal" data-hs-overlay="#new-leave-modal">
    Νέο αίτημα άδειας
  </button>

  <div id="new-leave-modal"
    class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
    role="dialog" tabindex="-1" aria-labelledby="hs-scale-animation-modal-label">
    <div
      class="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
      <div class="w-full flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
        <button type="button"
          class="size-8 ml-auto inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
          aria-label="Close" data-hs-overlay="#new-leave-modal">
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
            Νεό αίτημα άδειας
          </h3>
        </div>
        <div class="p-4 overflow-y-auto">
          <div class="leave-counter bg-gray-100 py-2 max-w-[200px] text-center mx-auto text-sm rounded-lg">
            <span class="leave-counter-text">Διαθέσιμες ημέρες </span><span
              class="leave-counter-count text-red-600 font-bold text-md">
              05
            </span>
          </div>
          <div class="new-leave-form py-10">

            <form class="space-y-6">
              <!-- First row: Single input -->
              <div>
                <label for="input1" class="block text-sm font-medium text-gray-700 py-3">Τύπος άδειας</label>
                <div class="space-y-3">
                  <select
                    class="py-3 px-4 pe-9 block w-full border-gray-200 border rounded-lg text-sm disabled:opacity-50 disabled:pointer-events-none">
                    <option selected="">Πληρωμένη άδεια</option>
                    <option>Work from home</option>
                  </select>
                </div>
              </div>

              <!-- Second row: Two inputs in two columns -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label for="input2" class="block text-sm font-medium text-gray-700 py-3">Ημ/νια απο</label>
                  <input type="text" id="date-picker" ref="datePickerStart" class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm" placeholder="Επιλέξτε ημ/νια">
                </div>
                <div>
                  <label for="input3" class="block text-sm font-medium text-gray-700 py-3">Ημ/νια μέχρι</label>
                  <input type="text" id="date-picker" ref="datePickerEnd" class="py-3 px-4 block border w-full border-gray-200 rounded-lg text-sm" placeholder="Επιλέξτε ημ/νια">
                </div>
              </div>

              <!-- Third row: Textarea -->
              <div>
                <label for="textarea" class="block text-sm font-medium text-gray-700 py-3">Σχόλια (προαιρετικό)</label>
                <div class="space-y-3">
                  <textarea
                    class="py-3 px-4 block w-full border-gray-200 border text-sm"
                    rows="3" placeholder="This is a textarea placeholder"></textarea>
                </div>
              </div>

              <!-- Fourth row: Button -->
              <div>
                <button type="submit"
                  class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
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
export default {
  mounted() {
    // Initialize Flatpickr for the first date input
    flatpickr(this.$refs.datePickerStart, {
      dateFormat: "Y-m-d", // Customize the date format if needed
    });

    // Initialize Flatpickr for the second date input
    flatpickr(this.$refs.datePickerEnd, {
      dateFormat: "Y-m-d", // Customize the date format if needed
    });
  },
  name: ' NewLeave'
}
</script>