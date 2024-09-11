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

const fetchAuth = async (userName, userPass) => {
  await authStore.authUser(userName, userPass).then(() => {

  });
}
const fetchAllLeaves = async (userId) => {
  await leavesStore.getAll(userId);
}

const newLeave = async (userId, leaveTypeId, startDate, endDate, reason) => {
  await leavesStore.newLeave(userId, leaveTypeId, startDate, endDate, reason);
}

// Use computed to make reactive
const userId = computed(() => userStore.userId);
const leavesData = computed(() => leavesStore.leavesData);

onMounted(async () => {
    try {
      const hasSession = await authStore.hasSession();

      // Restore session first
      if(hasSession) {
        await authStore.restoreSession();

        // If session restoration is successful, load leaves
        if (userId.value) { // Ensure userId is available after restoring session
          await leavesStore.getAll(userId.value);
        }
      }
    } catch (error) {
      console.error("Error during session restoration or loading leaves:", error);
    }
});


</script>