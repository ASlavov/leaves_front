<template>
  <!-- Dropdown -->
  <div class="hs-dropdown [--placement:bottom-right] relative ">
    <button id="hs-dropdown-account" type="button"
            class="border-0 border-transparent size-[45px] justify-center  items-center gap-x-2 text-sm font-semibold rounded-full text-gray-800 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-white"
            aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
            <SharedUserAvatar :user="user" :size="45" />
    </button>

    <div class="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:divide-neutral-700 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full"
         role="menu" aria-orientation="vertical" aria-labelledby="hs-dropdown-account">
      <div class="py-3 px-5 bg-gray-100 rounded-t-lg dark:bg-neutral-700">
        <p class="text-sm text-gray-500 dark:text-neutral-500">{{ $t('auth.signedInAs') }}</p>
        <p class="text-sm font-medium text-gray-800 dark:text-neutral-200">{{ userEmail }}</p>
      </div>
      <div class="p-1.5 space-y-0.5">
        <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300"
           href="settings#edit-profile">
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {{ $t('settings.editProfile') }}
        </a>
        <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300"
           href="settings#permissions">
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {{ $t('settings.permissions') }}
        </a>
        <a class="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 dark:focus:text-neutral-300"
           href="settings#security">
          <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m8 17 4 4 4-4" />
          </svg>
          {{ $t('settings.security') }}
        </a>

        <!-- Logout Button -->
        <button @click="logout" type="button"
                class="w-full justify-center rounded-full py-2 px-4 inline-flex items-center gap-x-2 text-sm font-medium border border-gray-800 text-gray-800 hover:border-gray-500 hover:text-gray-500 focus:outline-none focus:border-gray-500 focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-white dark:text-white dark:hover:text-neutral-300 dark:hover:border-neutral-300">
          {{ $t('auth.logout') }}
        </button>
      </div>
    </div>
  </div>
  <!-- End Dropdown -->
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { computed } from "vue";
import UserAvatar from '@/components/shared/UserAvatar.vue';

const { t } = useI18n();
const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;

const user = computed(() => {
  const userInfo = userStore.userInfo;
  const nameSplit = userInfo?.name?.trim().split(' ') || [];
  const firstName = nameSplit?.slice(0, -1).join(' ') || nameSplit[0];
  const lastName = (nameSplit.length > 1) ? (nameSplit?.slice(-1).join(' ') || '') : '';
  const firstNameInitial = firstName?.charAt(0) || '';
  const lastNameInitial = lastName?.charAt(0) || '';
  return {
    ...userInfo,
    firstName,
    lastName,
    firstNameInitial,
    lastNameInitial,
  }
});
// Logout function
const logout = async () => {
  try {
    // Clear authentication state in authStore (if any)
    await centralStore.logout();

    // Redirect to login page
    await router.push('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const userEmail = computed(() => userStore.userInfo?.email);
</script>

<style scoped>
/* Add your custom styles here if needed */
</style>