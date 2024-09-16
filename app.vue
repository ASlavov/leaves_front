<template>
  <div class="h-full mt-auto">
    <main class="bg-gray-100">
      <NuxtPage />
    </main>
  </div>
</template>


<script setup>
import { computed, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';


const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const authStore = centralStore.authStore;

// Use computed to make reactive
const userId = computed(() => userStore.userId);

onMounted(async () => {
    try {
      const hasSession = await authStore.hasSession();

      // Restore session first
      if(hasSession) {
        await authStore.restoreSession();

        await centralStore.init();

      }
    } catch (error) {
      useNuxtApp().$toast.error(error, {
        position: "bottom-right",
        autoClose: 5000, // Close automatically after 5 seconds
      });
    }

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
});

// Watch for error changes in the central store and trigger a toast
</script>