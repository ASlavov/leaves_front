<template>
  <div class="container mx-auto p-4">
    <div class="flex flex-col sm:inline-flex sm:flex-row rounded-lg shadow-sm">
      <button type="button" @click="fetchAuth('developers@whyagency.gr', '@@developers@@')" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        Login
      </button>
      <button type="button" @click="fetchAllLeaves(userId)" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        Get All Leaves
      </button>
      <button type="button" @click="newLeave(userId, 1, '2024-09-18', '2024-09-19', 'Family vacation')" class="py-3 px-4 inline-flex items-center gap-x-2 -mt-px -ms-px first:rounded-t-md last:rounded-b-md sm:first:rounded-s-md sm:mt-0 sm:first:ms-0 sm:first:rounded-se-none sm:last:rounded-es-none sm:last:rounded-e-md text-sm font-medium focus:z-10 border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
        Post new Leave
      </button>
    </div>
    <div class="flex flex-col my-10 -mx-2 text-white">
      <div v-if="userStore.loading">
        Loading...
      </div>
      <div v-else>
        <div v-if="userId">
          {{ userId }}
        </div>
        <div v-else>
          No Data for user!
        </div>
      </div>

      <div v-if="leavesStore.loading">
        Loading...
      </div>
      <div v-else>
        <div v-if="leavesData">
          {{ leavesData }}
        </div>
        <div v-else>
          No Data for leaves!
        </div>
      </div>
    </div>
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
    // Restore session first
    await authStore.restoreSession();

    // If session restoration is successful, load leaves
    if (userId.value) { // Ensure userId is available after restoring session
      await leavesStore.getAll(userId.value);
    }
  } catch (error) {
    console.error("Error during session restoration or loading leaves:", error);
  }
});


</script>