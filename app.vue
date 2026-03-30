<template>
  <div class="h-full mt-auto">
    <main class="bg-gray-100 dark:bg-neutral-900 transition-colors duration-300">
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
    const isAuthed = userAuthed.value === 'true' || userAuthed.value === true;
    if (isAuthed && !centralStore.initialized) {
      console.log('runInitCode: Initializing...'); // Debug
      await authStore.me();
      await centralStore.init();
      console.log('runInitCode: Initialization complete');
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
  // Only try to init if we're not initialized and might be authed
  const isAuthed = userAuthed.value === 'true' || userAuthed.value === true;
  if (!centralStore.initialized && isAuthed) {
    await runInitCode();
  }
});

onMounted(async () => {
  // Watch for changes to userAuthed (e.g., middleware updates it during API calls)
    watch(
        () => userAuthed.value,
        async (newValue, oldValue) => {
          console.log('userAuthed changed:', oldValue, '->', newValue); // Debug
          const isNewAuthed = newValue === 'true' || newValue === true;
          const isOldAuthed = oldValue === 'true' || oldValue === true;
          
          if (isNewAuthed && !isOldAuthed) {
            await runInitCode();
          } else if (!isNewAuthed && isOldAuthed) {
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