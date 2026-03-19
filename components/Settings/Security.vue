<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">
        <!-- Loading Skeletons -->
        <div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
        <!-- Info Details Skeleton -->
        <div class="pt-4 space-y-2">
          <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></p>
        </div>
      </template>
      <template v-else>
<!-- TODO: border-rounded to ::before instead -->
        <h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px]">{{ $t('settings.changePassword') }}</h3>
        <div class="grid grid-cols-12 pt-[30px] max-w-[847px]">
          <!-- Info Details -->
          <div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px] max-w-[625px]">
            <!-- Form Group -->
            <div class="max-w-[300px] col-span-2">
              <label class="block font-bold text-black text-sm mb-2 dark:text-white">{{ $t('settings.currentPassword') }}</label>
              <div class="relative">
                <input
                    v-model="currentPassword"
                    name="current-password" type="password"
                       class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******" value>
                <button @click="togglePassword('current-password')" type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
                  <svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22"></line>
                    <path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle class="hidden group-[.open]:block" cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="max-w-[300px]">
              <label class="block font-bold text-black text-sm mb-2 dark:text-white">{{ $t('settings.newPassword') }}</label>
              <div class="relative">
                <input
                    v-model="newPassword"
                    name="new-password" type="password"
                       class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******" value>
                <button @click="togglePassword('new-password')" type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
                  <svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22"></line>
                    <path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle class="hidden group-[.open]:block" cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="max-w-[300px]">
              <label class="block font-bold text-black text-sm mb-2 dark:text-white">{{ $t('settings.confirmPassword') }}</label>
              <div class="relative">
                <input
                    v-model="confirmPassword"
                    name="new-password-confirm" type="password"
                       class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="******">
                <button @click="togglePassword('new-password-confirm')" type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
                  <svg class="shrink-0 size-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path class="group-[.open]:hidden" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path class="group-[.open]:hidden" d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path class="group-[.open]:hidden" d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line class="group-[.open]:hidden" x1="2" x2="22" y1="2" y2="22"></line>
                    <path class="hidden group-[.open]:block" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle class="hidden group-[.open]:block" cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <!-- End Form Group -->
          </div>
        </div>
        <h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px] mt-[40px]">{{ $t('settings.twoFactorAuth') }}</h3>
        <div class="">
          <div class="max-w-[609px] mt-[20px] w-full text-black dark:text-gray-100 text-sm text-[14px] leading-[18px]" v-html="$t('settings.twoFactorDesc')"></div>
        </div>

        <!-- Save Changes Button -->
        <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
          <button @click="submitForm"
                  class="inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
            {{ $t('common.saveChanges') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useCentralStore } from '@/stores/centralStore.js';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { authStore, userStore } = useCentralStore();

const togglePassword = (name) => {
  const e = document.querySelector(`input[name="${name}"]`);
  e.type = (e.type === 'password') ? 'text' : 'password';

  const btn = e.nextElementSibling;
  if (btn.classList.contains('open')) {
    btn.classList.remove('open');
  } else {
    btn.classList.add('open');
  }
};


const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// Submit form method
const submitForm = async () => {
  const userId = userStore.userId;

  // Validate that new password and confirm password match
  if (newPassword.value !== confirmPassword.value) {
    // Handle the error, e.g., show an error message
    useNuxtApp().$toast.error(t('settings.passwordMismatch'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
    return;
  }

  // Construct the data object
  const data = {
    userId: userId,
    oldPass: currentPassword.value,
    newPass: newPassword.value,
  };

  try {
    // Call the API to update the password
    await userStore.updatePassword(data);

    useNuxtApp().$toast.success(t('settings.passwordChangeSuccess'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    // Handle errors, e.g., show an error message
    console.error('Error updating password:', error);
    useNuxtApp().$toast.error(t('settings.passwordChangeError'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};

// Loading state
const loading = computed(() => userStore && userStore.loading);
</script>

<style scoped>
/* Additional styles if needed */
</style>
