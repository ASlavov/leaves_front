<template>
  <Sidebar />
  <!-- Content -->
  <div class="w-full lg:ps-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300">
    <h3 class="px-4 pt-[35px] sm:px-6  font-semibold text-lg dark:text-gray-100">Ρυθμίσεις</h3>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div class="w-full bg-white rounded-lg shadow-md dark:bg-neutral-800 duration-300">
        <div class="border-b border-gray-200 px-4 dark:border-neutral-700 duration-300">
          <nav class="flex gap-x-[70px] overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500 active" id="basic-tabs-item-1" aria-selected="true" data-hs-tab="#basic-tabs-1" aria-controls="basic-tabs-1" role="tab">
              Επεξεργασία Προφίλ
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-2" aria-selected="false" data-hs-tab="#basic-tabs-2" aria-controls="basic-tabs-2" role="tab">
              Δικαιώματα
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-3" aria-selected="false" data-hs-tab="#basic-tabs-3" aria-controls="basic-tabs-3" role="tab">
              Ασφάλεια
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-4" aria-selected="false" data-hs-tab="#basic-tabs-4" aria-controls="basic-tabs-4" role="tab">
              Χρήστες
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-5" aria-selected="false" data-hs-tab="#basic-tabs-5" aria-controls="basic-tabs-5" role="tab">
              Γκρουπς
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-7" aria-selected="false" data-hs-tab="#basic-tabs-6" aria-controls="basic-tabs-6" role="tab">
              Άδειες
            </button>
            <button type="button" class="hs-tab-active:font-bold hs-tab-active:border-red-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-red-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:hover:text-red-500" id="basic-tabs-item-6" aria-selected="false" data-hs-tab="#basic-tabs-7" aria-controls="basic-tabs-7" role="tab">
              Τύποι αδειών
            </button>
          </nav>
        </div>

        <div class="mt-3 p-4">
          <div id="basic-tabs-1" role="tabpanel" aria-labelledby="basic-tabs-item-1">
            <p class="text-gray-500 dark:text-neutral-400">
              <EditUser :userId="userId" />
            </p>
          </div>
          <div id="basic-tabs-2" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-2">
            <p class="text-gray-500 dark:text-neutral-400">
              This is the <em class="font-semibold text-gray-800 dark:text-neutral-200">second</em> item's tab body.
            </p>
          </div>
          <div id="basic-tabs-3" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-3">
            <p class="text-gray-500 dark:text-neutral-400">
              <Security />
            </p>
          </div>
          <div id="basic-tabs-4" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-4">
            <p class="text-gray-500 dark:text-neutral-400">
              <UsersList />
            </p>
          </div>
          <div id="basic-tabs-5" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-5">
            <p class="text-gray-500 dark:text-neutral-400">
              <GroupsList />
            </p>
          </div>
          <div id="basic-tabs-6" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-6">
            <p class="text-gray-500 dark:text-neutral-400">
              <LeavesList />
            </p>
          </div>
          <div id="basic-tabs-7" class="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-7">
            <p class="text-gray-500 dark:text-neutral-400">
              <LeavesTypesList />
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Content -->
</template>
<script setup>
import {computed, onMounted, watch} from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const authStore = centralStore.authStore;

// Use computed to make reactive
const userId = computed(() => userStore.userId);
const leavesData = computed(() => leavesStore.leavesData);

const loadLeavesList = () => {
  console.log('loading shit');
}
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
import EditUser from '~/components/Settings/EditUser.vue'
import Security from "~/components/Settings/Security.vue";
import UsersList from "~/components/Settings/UsersList.vue";
import GroupsList from "~/components/Settings/GroupsList.vue";
import LeavesTypesList from "~/components/Settings/LeavesTypesList.vue";
import LeavesList from "~/components/Settings/LeavesList.vue";
export default {
  components: {
    Sidebar,
    EditUser,
    Security,
    UsersList,
    GroupsList,
    LeavesList,
    LeavesTypesList,
  }
}
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>