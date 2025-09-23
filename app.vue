<template>
  <div class="h-full mt-auto">
    <main class="bg-gray-100">
      <NuxtPage />
    </main>
  </div>
</template>


<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, watch } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useCookie, useNuxtApp } from '#imports';

useHead({
  htmlAttrs: {
    lang: 'el',
  },
})
const router = useRouter();

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const authStore = centralStore.authStore;

const userAuthed = useCookie('user_authed');

const runInitCode = async () => {
  try {
    if (userAuthed.value) {
      if (!centralStore.initialized) {
        await centralStore.init();
      }
    }
  } catch (error) {
    useNuxtApp().$toast.error(error, {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};

// Use computed to make reactive
const userId = computed(() => userStore.userId);

router.afterEach(async (to, from) => {
  // Runs after every navigation, including router.push and NuxtLink clicks
  await runInitCode();
});

onMounted(async () => {
  // Watch for changes to the authToken cookie.
  // This handles the case where the cookie is set client-side after login.

  watch(
      () => centralStore.error,  // Watch the error state in the store
      (newError) => {
        if (newError) {
          // Show the toast when the error changes
          useNuxtApp().$toast.error(newError, {
            position: "bottom-right",
            autoClose: 5000, // Close automatically after 5 seconds
          });
        }
      }
  );

  watch(
      () => centralStore.notificationsStore.notificationsData,
      (notificationError) => {
        if (notificationError?.statusCode && notificationError?.statusCode === 403) {
          router.push('/auth/login');
        }
      },
      {
        immediate: true,
      }
  );
});
</script>
<style>
body {
  font-family: 'Roboto', sans-serif;
}
</style>