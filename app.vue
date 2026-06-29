<template>
  <div class="h-full mt-auto">
    <main class="bg-gray-100 dark:bg-neutral-900 transition-colors duration-300">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, watch } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import { useCookie, useNuxtApp } from '#imports';

useHead({
  htmlAttrs: {
    lang: 'el',
  },
});

const router = useRouter();
const { $toast } = useNuxtApp();

const centralStore = useCentralStore();
const authStore = centralStore.authStore;

const userAuthed = useCookie<string | boolean | undefined>('user_authed');

// Mutex: prevents router.afterEach and the userAuthed watcher from triggering
// concurrent inits. Without this, both fire at app mount and race each other,
// causing every store to be initialised twice and doubling all API calls.
let initInProgress = false;

const runInitCode = async () => {
  const isAuthed = userAuthed.value === 'true' || userAuthed.value === true;
  if (!isAuthed || centralStore.initialized || initInProgress) return;

  initInProgress = true;
  try {
    await authStore.me();
    await centralStore.init();
  } catch (error: unknown) {
    console.error('runInitCode error:', error);
    const status = (error as any)?.status ?? (error as any)?.statusCode;
    if (status === 403 || status === 401) {
      userAuthed.value = undefined;
      await router.push('/auth/login');
    } else {
      $toast.error('An error occurred during initialization', {
        position: 'bottom-right',
        autoClose: 5000,
      });
    }
  } finally {
    initInProgress = false;
  }
};

// router.afterEach handles the initial load and any hard navigations.
// The userAuthed watcher below handles login/logout transitions.
// Both share the initInProgress mutex so they never run concurrently.
router.afterEach(runInitCode);

onMounted(async () => {
  watch(
    () => userAuthed.value,
    async (newValue, oldValue) => {
      const isNewAuthed = newValue === 'true' || newValue === true;
      const isOldAuthed = oldValue === 'true' || oldValue === true;

      if (isNewAuthed && !isOldAuthed) {
        await runInitCode();
      } else if (!isNewAuthed && isOldAuthed) {
        router.push('/auth/login');
      }
    },
    // NOT immediate — router.afterEach already covers the initial check,
    // so { immediate: true } here was the source of the duplicate concurrent init.
  );

  watch(
    () => centralStore.error, // Watch the error state in the store
    (newError) => {
      if (newError) {
        // Show the toast when the error changes
        useNuxtApp().$toast.error(newError, {
          position: 'bottom-right',
          autoClose: 5000,
        });
      }
    },
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
    },
  );
});
</script>
<style>
body {
  font-family: 'Roboto', sans-serif;
}
</style>
