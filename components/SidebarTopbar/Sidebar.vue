<template>
  <header
    class="duration-300 sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px] dark:bg-neutral-800 dark:border-neutral-700"
  >
    <nav class="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
      <div
        class="w-full flex flex-col-reverse pb-[15px] md:pb-0 gap-y-[15px] md:flex-row justify-center md:justify-end items-center ms-auto gap-x-1 md:gap-x-3"
      >
        <Search />
        <div
          class="flex flex-col sm:flex-row items-center justify-center sm:justify-between md:justify-end w-full md:w-auto gap-1"
        >
          <SharedLogo container-class="md:hidden flex" />
          <div
            class="md:contents flex items-center justify-between max-w-[250px] w-full gap-4 sm:gap-1"
          >
            <ColorModeSwitcher />
            <UserNotification />
            <LanguageSwitcher />
            <MyAccount />
          </div>
        </div>
      </div>
    </nav>
  </header>

  <div class="-mt-px">
    <div
      class="sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700"
    >
      <div class="flex items-center py-2">
        <button
          type="button"
          class="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500"
          :aria-label="$t('common.toggleNavigation')"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">{{ $t('common.toggleNavigation') }}</span>
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
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
            <path d="m8 9 3 3-3 3" />
          </svg>
        </button>
        <ol class="ms-3 flex items-center whitespace-nowrap">
          <li class="flex items-center text-sm text-gray-800 dark:text-neutral-400">
            {{ $t('common.menu') }}
            <svg
              class="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </li>
        </ol>
      </div>
    </div>
  </div>

  <!-- Mobile backdrop -->
  <Transition name="backdrop">
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-[59] bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />
  </Transition>

  <!-- Sidebar -->
  <div
    :class="[
      'fixed inset-y-0 start-0 z-[60] w-[260px] h-full bg-white border-e border-gray-200 transition-transform duration-300 dark:bg-neutral-800 dark:border-neutral-700',
      'lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    role="dialog"
    tabindex="-1"
    :aria-label="$t('common.sidebar')"
  >
    <div class="relative flex flex-col h-full max-h-full">
      <SharedLogo />
      <SidebarMenu @navigate="sidebarOpen = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Search from '~/components/SidebarTopbar/Search.vue';
import MyAccount from '~/components/SidebarTopbar/MyAccount.vue';
import SidebarMenu from '~/components/SidebarTopbar/SidebarMenu.vue';
import UserNotification from '~/components/SidebarTopbar/UserNotification.vue';
import LanguageSwitcher from '~/components/SidebarTopbar/LanguageSwitcher.vue';
import ColorModeSwitcher from '~/components/SidebarTopbar/ColorModeSwitcher.vue';

const sidebarOpen = ref(false);
const route = useRoute();

// Close sidebar on navigation (mobile)
watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
  },
);
</script>

<style>
body {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.8);
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

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
