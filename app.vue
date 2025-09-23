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
    console.log('runInitCode: userAuthed =', userAuthed.value); // Debug: Confirm cookie read
    if (userAuthed.value === 'true') {  // Explicit string check for safety
      if (!centralStore.initialized) {
        await centralStore.init();
        console.log('initialized');
      }
    }
  } catch (error) {
    console.error('runInitCode error:', error); // Debug
    useNuxtApp().$toast.error(error, {
      position: "bottom-right",
      autoClose: 5000,
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
  // Initial run on mount/refresh (key fix!)
  await runInitCode();

  // Watch for changes to userAuthed (e.g., middleware updates it during API calls)
  watch(
      () => userAuthed.value,
      async (newValue, oldValue) => {
        console.log('userAuthed changed:', oldValue, '->', newValue); // Debug
        if (newValue === 'true' && oldValue !== 'true') {
          await runInitCode();
        } else if (newValue !== 'true' && oldValue === 'true') {
          // Optional: Handle logout/unauth (e.g., redirect)
          router.push('/auth/login');
        }
      },
      { immediate: true } // Check initial value immediately
  );

  watch(
      () => centralStore.error,  // Watch the error state in the store
      (newError) => {
        if (newError) {
          // Show the toast when the error changes
          useNuxtApp().$toast.error(newError, {
            position: "bottom-right",
            autoClose: 5000,
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