<template>
    <Sidebar />
    <!-- Content -->
    <div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900">
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <!-- your content goes here ... -->
            <LeavesMetric />
            <Info />
            <template v-if="centralStore.permissionsStore.can('profile_leave_balance','accept_leave')">
              <YearlyLeaves
                  :isSmallComponent=true
                  :leavesNumber=3
              />
            </template>
        </div>
    </div>
    <!-- End Content -->
</template>
<script setup>
import { computed, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import YearlyLeaves from "~/components/Leaves/YearlyLeaves.vue";

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const authStore = centralStore.authStore;

// Use computed to make reactive
const userId = computed(() => userStore.userId);
const leavesData = computed(() => leavesStore.leavesData);
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
<script>
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue'
import LeavesMetric from '~/components/Home/LeavesMetric.vue'
import Info from '~/components/Home/Info.vue'
export default {
    components: {
        Sidebar,
        LeavesMetric,
        Info
    }
}
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>