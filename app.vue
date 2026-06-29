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

// Plain module-level flags — reset to false on every page load, never touched
// by pinia-plugin-persistedstate or any other persistence layer.
// centralStore.initialized was used here before but pinia-persistedstate was
// restoring it as `true` from a previous session, causing runInitCode() to
// short-circuit and leave the page empty (most visibly after a light-mode switch).
let initInProgress = false;
let sessionInitDone = false;

const runInitCode = async () => {
  const isAuthed = userAuthed.value === 'true' || userAuthed.value === true;
  if (!isAuthed || sessionInitDone || initInProgress) return;

  initInProgress = true;
  sessionInitDone = true; // block re-entry immediately; reset on failure below
  try {
    await authStore.me();
    await centralStore.init();
  } catch (error: unknown) {
    sessionInitDone = false; // allow retry if init failed
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

// router.afterEach covers client-side navigations (link clicks, router.push).
// On Netlify SSG a hard refresh hydrates an already-resolved route without
// triggering router.afterEach, so onMounted() calls runInitCode() directly
// as the explicit fallback. The initInProgress mutex prevents duplicate runs.
router.afterEach(runInitCode);

onMounted(async () => {
  // Explicit initial trigger — covers refresh/direct URL on SSG deployments
  // where router.afterEach does not fire during hydration.
  await runInitCode();

  watch(
    () => userAuthed.value,
    async (newValue, oldValue) => {
      const isNewAuthed = newValue === 'true' || newValue === true;
      const isOldAuthed = oldValue === 'true' || oldValue === true;

      if (isNewAuthed && !isOldAuthed) {
        await runInitCode();
      } else if (!isNewAuthed && isOldAuthed) {
        sessionInitDone = false; // reset so next login triggers a fresh init
        router.push('/auth/login');
      }
    },
    // Not immediate — the explicit runInitCode() call above covers initial load.
    // This watcher only reacts to login/logout cookie changes mid-session.
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
