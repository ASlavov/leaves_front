<template>
  <header
      class="duration-300 sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px] dark:bg-neutral-800 dark:border-neutral-700">
    <nav class="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
      <div
          class="w-full flex items-center justify-end ms-auto md:justify-between gap-x-1 md:gap-x-3"
      >
        <!-- Other Components -->
        <Search />
        <div class="flex flex-row items-center justify-end gap-1">
          <ColorModeSwitcher />
          <UserNotification />
          <LanguageSwitcher />
          <MyAccount />
        </div>
      </div>
    </nav>
  </header>
    <div class="-mt-px">
        <div
            class="sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700">
            <div class="flex items-center py-2">
                <button type="button"
                    class="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-none focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
                    aria-haspopup="dialog" aria-expanded="false" aria-controls="hs-application-sidebar"
                    :aria-label="$t('common.toggleNavigation')" data-hs-overlay="#hs-application-sidebar">
                    <span class="sr-only">{{ $t('common.toggleNavigation') }}</span>
                    <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M15 3v18" />
                        <path d="m8 9 3 3-3 3" />
                    </svg>
                </button>
                <ol class="ms-3 flex items-center whitespace-nowrap">
                    <li class="flex items-center text-sm text-gray-800 dark:text-neutral-400">
                        {{ $t('common.menu') }}
                        <svg class="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500"
                            width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </li>
                </ol>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div id="hs-application-sidebar" class="hs-overlay  [--auto-close:lg]
        hs-overlay-open:translate-x-0
        -translate-x-full transition-all duration-300 transform
        w-[260px] h-full
        hidden
        fixed inset-y-0 start-0 z-[60]
        bg-white border-e border-gray-200
        lg:block lg:translate-x-0 lg:end-auto lg:bottom-0
        dark:bg-neutral-800 dark:border-neutral-700" role="dialog" tabindex="-1" :aria-label="$t('common.sidebar')">
        <div class="relative flex flex-col h-full max-h-full">
            <div class="px-6 pt-4">
                <!-- Logo -->
                <a class="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-none focus:opacity-80 mb-10"
                    href="/home" aria-label="WHY">
                    <img :src="`https://whyagency.gr/wp-content/uploads/2023/10/${theme === 'light' ? 'logo_dark' : 'logo'}.png`" width="130" alt="Logo">
                </a>
                <!-- End Logo -->
            </div>
            <SidebarMenu />
        </div>
    </div>
    <!-- End Sidebar -->
    <!-- ========== END MAIN CONTENT ========== -->
</template>

<script setup>
import Search from '~/components/SidebarTopbar/Search.vue';
import MyAccount from '~/components/SidebarTopbar/MyAccount.vue';
import SidebarMenu from '~/components/SidebarTopbar/SidebarMenu.vue';
import UserNotification from '~/components/SidebarTopbar/UserNotification.vue';
import LanguageSwitcher from '~/components/SidebarTopbar/LanguageSwitcher.vue';
import ColorModeSwitcher from "~/components/SidebarTopbar/ColorModeSwitcher.vue";
import { useCentralStore } from "~/stores/centralStore.js";
import { computed } from 'vue';

const {通知store } = useCentralStore();

// Compute the current theme
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});
</script>

<style>
body {
  background-color: #fff;
  color: rgba(0,0,0,0.8);
}
.dark-mode body {
  background-color: #091a28;
  color: #ebf4f1;
}
.sepia-mode body {
  background-color: #f1e7d0;
  color: #433422;
}
</style>