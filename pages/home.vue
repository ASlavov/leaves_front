<template>
  <SidebarTopbarSidebar />
  <!-- Content -->
  <div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900">
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- your content goes here ... -->
      <HomeLeavesMetric />
      <HomeInfo />
      <template v-if="centralStore.permissionsStore.can('profile_leave_balance', 'accept_leave')">
        <LeavesYearlyLeaves :is-small-component="true" :leaves-number="3" />
      </template>
    </div>
  </div>
  <!-- End Content -->
</template>
<script setup>
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
/*onMounted(async () => {
  try {
    // Restore session first
    await authStore.restoreSession();

    // If session restoration is successful, load leaves
    if (userId.value) { // Ensure userId is available after restoring session
      await leavesStore.getAll(userId.value);
      await userStore.loadUserProfile();
    }
  } catch (error) {
    console.error("Error during session restoration or loading leaves:", error);
  }
});*/
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>
