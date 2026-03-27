<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
    <div
        class="login w-full max-w-md p-4 bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
      <h2 class="text-2xl font-bold text-center text-gray-700 dark:text-gray-300 pb-10">{{ $t('auth.login') }}</h2>

      <!-- Display error message if login fails -->
<!--      <div v-if="authStore.error" class="mb-4 text-center text-red-500">
        {{ authStore.error }}
      </div>-->

      <form class="space-y-6" @submit="login">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('auth.email') }} <span class="text-[#EA021A]">*</span></label>
          <input v-model="email" id="email" name="email" type="email" required
                 class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 placeholder="Enter your email">
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('auth.password') }} <span class="text-[#EA021A]">*</span></label>
<!--          <input v-model="password" id="password" name="password" type="password" required
                 class="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 placeholder="Enter your password">-->
              <div class="relative">
                <input
                    v-model="password"
                    name="password" type="password" id="password"
                    class="py-3 px-4 block w-full border-gray-200 border pe-10 rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Enter your password" value>
                <button @click="togglePassword('password')" type="button" class="group absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-blue-600 dark:text-neutral-600 dark:focus:text-blue-500">
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

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input v-model="rememberMe" type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{{ $t('auth.rememberMe') }}</span>
          </label>
          <NuxtLink to="../auth/forgot-password" class="text-sm text-blue-700">{{ $t('auth.forgotPassword') }}</NuxtLink>
        </div>

        <div v-if='loading' class="
        bg-red-600
        w-full
        rounded-full
        h-2
        animate-loading-bar">
        </div>

        <button type="submit"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none">
          {{ $t('auth.login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
/*definePageMeta({
  middleware: 'redirect-if-authenticated',  // Apply the middleware to this page
});*/

import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationsStore } from '@/stores/notifications';
import { useCentralStore } from "@/stores/centralStore";
import { useNuxtApp } from '#imports';

// Initialize the toast function
const email = ref('');
const password = ref('');
const rememberMe = ref(false);  // "Remember Me" does nothing
const router = useRouter();
const loading = ref(false);
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const centralStore = useCentralStore();

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

const login = async (event) => {
  event.preventDefault();  // Prevent default form submission

  try {
    loading.value = true;
    // Call auth store to handle login and await the result
    const isAuthenticated = await authStore.authUser(email.value, password.value);

    // After a successful login, perform the redirection.
    if (isAuthenticated) {
      centralStore.initialized = false;  // Triggers re-init on nav
      await router.push({ path: '/home' });
    } else {
      /*useNuxtApp().$toast.error('Login failed. Please check your credentials.', {
        position: "bottom-right",
        autoClose: 5000,
      });*/
    }
  } catch (error) {
    // Add error message to the toast
    useNuxtApp().$toast.error(error.message || 'Login failed', {
      position: "bottom-right",
      autoClose: 5000,
    });
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  notificationsStore.stopPollingNotifications();
  centralStore.initialized = false;
  watch(
      () => authStore.error,  // Watch the error state in the store
      (newError) => {
        if (newError) {
          // Show the toast when the error changes
          useNuxtApp().$toast.error(newError, {
            position: "bottom-right",
            autoClose: 5000, // Close automatically after 5 seconds
          });
        }
      }
  )
});
</script>
<style scoped>

</style>
