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
      console.error("Error during session restoration or loading leaves:", error);
    }
});


</script>