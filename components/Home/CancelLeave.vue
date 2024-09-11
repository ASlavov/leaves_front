<template>
    <a href="#" class="py-3 px-5 inline-flex items-center gap-x-2 text-md" aria-haspopup="dialog" aria-expanded="false"
        aria-controls="hs-scale-animation-modal" data-hs-overlay="#cancel_leaves">
        Ακύρωση Άδειας
    </a>

    <div id="cancel_leaves"
        class="hs-overlay hidden size-full fixed top-0 start-0 z-[80] overflow-x-hidden overflow-y-auto pointer-events-none"
        role="dialog" tabindex="-1" aria-labelledby="hs-scale-animation-modal-label">
        <div
            class="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center">
            <div class="w-full flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto">
                <button type="button"
                    class="size-8 ml-auto inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                    aria-label="Close" data-hs-overlay="#cancel_leaves">
                    <span class="sr-only">Close</span>
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>
                </button>
                <div class="flex  items-center py-3 px-4">
                    <h3 id="hs-scale-animation-modal-label"
                        class="font-bold text-gray-800 dark:text-white max-w-[300px] mx-auto text-lg">
                        Ακύρωση άδειας
                    </h3>
                </div>
                <div class="mx-auto font-extralight text-gray-500">Επιλέξετε την άδεια που θέλετε να ακυρώσετε</div>
                <div class="p-4 overflow-y-auto">
                    <div class="new-leave-form py-10">

                        <form class="cancel-leave">

                            <div class="max-h-60 overflow-y-auto">

                                <label for="hs-radioradio-on-right"
                                    class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                    <input type="radio" name="hs-radio-on-right"
                                        class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                        id="hs-radio-on-right">
                                    <span class="text-xs text-gray-400 mx-auto">27/12 - 29/12<br><span
                                            class="text-sm text-black font-semibold">3 ημέρες</span></span>
                                    <span
                                        class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold">Πληρωμένη
                                        άδεια</span>
                                    <span class="text-sm ms-auto text-green-700 font-semibold">Αποδεκτή</span>
                                </label>

                                <label for="hs-radioradio-on-right"
                                    class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                    <input type="radio" name="hs-radio-on-right"
                                        class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                        id="hs-radio-on-right">
                                    <span class="text-xs text-gray-400 mx-auto">27/12 - 29/12<br><span
                                            class="text-sm text-black font-semibold">3 ημέρες</span></span>
                                    <span
                                        class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold">Πληρωμένη
                                        άδεια</span>
                                    <span class="text-sm ms-auto text-green-700 font-semibold">Αποδεκτή</span>
                                </label>

                                <label for="hs-radioradio-on-right"
                                    class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                    <input type="radio" name="hs-radio-on-right"
                                        class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                        id="hs-radio-on-right">
                                    <span class="text-xs text-gray-400 mx-auto">27/12 - 29/12<br><span
                                            class="text-sm text-black font-semibold">3 ημέρες</span></span>
                                    <span
                                        class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold">Πληρωμένη
                                        άδεια</span>
                                    <span class="text-sm ms-auto text-green-700 font-semibold">Αποδεκτή</span>
                                </label>

                                <label for="hs-radioradio-on-right"
                                    class="my-2 flex items-center justify-between p-3 w-full bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400">
                                    <input type="radio" name="hs-radio-on-right"
                                        class="shrink-0 ms-auto mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                        id="hs-radio-on-right">
                                    <span class="text-xs text-gray-400 mx-auto">27/12 - 29/12<br><span
                                            class="text-sm text-black font-semibold">3 ημέρες</span></span>
                                    <span
                                        class="text-sm text-black-600 dark:text-neutral-400 mx-auto font-semibold">Πληρωμένη
                                        άδεια</span>
                                    <span class="text-sm ms-auto text-green-700 font-semibold">Αποδεκτή</span>
                                </label>

                            </div>


                            <div class="space-y-3 pt-5">
                                <label for="textarea" class="block text-sm font-medium text-gray-700 py-3">Σχόλια
                                    (προαιρετικό)</label>
                                <textarea class="py-3 px-4 block w-full border-gray-200 border text-sm rounded-lg"
                                    rows="3" placeholder="Τα σχόλια σας"></textarea>
                            </div>


                            <div class="py-5">
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
export default {
    name: ' CancelLeave'
}
</script>