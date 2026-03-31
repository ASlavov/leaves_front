<template>
  <Sidebar />
  <!-- Content -->
  <div class="w-full lg:pl-64 bg-gray-100 dark:bg-neutral-900 min-h-dvh-64 duration-300">
    <h3 class="px-4 pt-9 sm:px-6 font-semibold text-lg dark:text-gray-100">
      {{ $t('settings.title') }}
    </h3>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div class="w-full bg-white rounded-lg shadow-md dark:bg-neutral-800 duration-300">
        <div class="border-b border-gray-200 px-4 dark:border-neutral-700 duration-300">
          <nav
            class="flex gap-x-16 overflow-x-auto custom-scrollbar"
            aria-label="Tabs"
            role="tablist"
            aria-orientation="horizontal"
          >
            <!-- Tab Buttons -->
            <button
              v-for="tab in visibleTabs"
              :id="'basic-tabs-item-' + tab.name"
              :key="tab.name"
              type="button"
              :class="tabButtonClass(tab.name)"
              :aria-selected="activeTab === tab.name"
              :aria-controls="'basic-tabs-' + tab.name"
              role="tab"
              @click="changeTab(tab.name)"
            >
              {{ $t(tab.labelKey) }}
            </button>
          </nav>
        </div>

        <div class="mt-3 p-4">
          <transition name="fade" mode="out-in">
            <div
              v-if="activeTabObj"
              :id="'basic-tabs-' + activeTabObj.name"
              :key="activeTabObj.name"
              role="tabpanel"
              :aria-labelledby="'basic-tabs-item-' + activeTabObj.name"
              class="text-gray-500 dark:text-neutral-400"
            >
              <component
                :is="activeTabObj.component"
                v-bind="activeTabObj.props ? activeTabObj.props() : {}"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
  <!-- End Content -->
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore';

// Import components
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue';
import EditUser from '~/components/Settings/EditUser.vue';
import Security from '~/components/Settings/Security.vue';
import UsersList from '~/components/Settings/UsersList.vue';
import GroupsList from '~/components/Settings/GroupsList.vue';
import LeavesTypesList from '~/components/Settings/LeavesTypesList.vue';
import Permissions from '~/components/Settings/Permissions.vue';
import EntitlementDays from '~/components/Settings/EntitlementDays.vue';
import WorkWeekSettings from '~/components/Settings/WorkWeekSettings.vue';
import PublicHolidays from '~/components/Settings/PublicHolidays.vue';
import Invitations from '~/components/Settings/Invitations.vue';

interface Tab {
  name: string;
  labelKey: string;
  component: Component;
  props?: () => Record<string, any>;
  permission: { category: string; action: string } | null;
}

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const permissionsStore = centralStore.permissionsStore;

// Reactive properties
const userId = computed(() => userStore.userId);

// Get route and router instances
const route = useRoute();
const router = useRouter();

// Define tabs array with unique names and translation keys
const tabs: Tab[] = [
  {
    name: 'edit-profile',
    labelKey: 'settings.editProfile',
    component: EditUser,
    props: () => ({
      userId: userId.value,
    }),
    permission: null, // No permission required
  },
  {
    name: 'permissions',
    labelKey: 'settings.permissions',
    component: Permissions,
    permission: { category: 'permissions', action: 'view' },
  },
  {
    name: 'security',
    labelKey: 'settings.security',
    component: Security,
    permission: null,
  },
  {
    name: 'users',
    labelKey: 'settings.users',
    component: UsersList,
    permission: null,
  },
  {
    name: 'groups',
    labelKey: 'settings.groups',
    component: GroupsList,
    permission: null,
  },
  {
    name: 'leave-types',
    labelKey: 'settings.leaveTypes',
    component: LeavesTypesList,
    permission: { category: 'leave_types', action: 'view' },
  },
  {
    name: 'entitlement-days',
    labelKey: 'settings.leaveDays',
    component: EntitlementDays,
    permission: { category: 'entitlement', action: 'view' },
  },
  {
    name: 'work-week',
    labelKey: 'settings.workWeek',
    component: WorkWeekSettings,
    permission: { category: 'work_week', action: 'view' },
  },
  {
    name: 'public-holidays',
    labelKey: 'settings.publicHolidays',
    component: PublicHolidays,
    permission: { category: 'public_holidays', action: 'view' },
  },
  {
    name: 'invitations',
    labelKey: 'settings.invitations',
    component: Invitations,
    permission: { category: 'invitations', action: 'view' },
  },
];

// Compute visible tabs based on permissions
const visibleTabs = computed<Tab[]>(() => {
  return tabs.filter((tab) => {
    if (tab.permission) {
      return permissionsStore.can(tab.permission.category, tab.permission.action);
    }
    return true;
  });
});

// Active tab name
const activeTab = ref<string | null>('edit-profile');

// Active tab object
const activeTabObj = computed<Tab | undefined>(() =>
  visibleTabs.value.find((tab) => tab.name === activeTab.value),
);

// Function to change tab
const changeTab = (tabName: string | null) => {
  activeTab.value = tabName;
};

// Function to set active tab based on hash or default
const setActiveTabFromHash = () => {
  const hash = route.hash.replace('#', '');
  const tabExists = visibleTabs.value.find((tab) => tab.name === hash);
  if (tabExists) {
    changeTab(hash);
  } else {
    // Set to default tab if hash doesn't match any tab
    if (visibleTabs.value.length > 0) {
      changeTab(visibleTabs.value[0].name);
    } else {
      activeTab.value = null;
    }
  }
};

// Initialize active tab on component mount
onMounted(() => {
  setActiveTabFromHash();
});

// Watch for route hash changes
watch(
  () => route.hash,
  () => {
    setActiveTabFromHash();
  },
);

// Watch for changes in visibleTabs to update activeTab if necessary
watch(
  () => visibleTabs.value,
  (newTabs) => {
    if (activeTab.value && !newTabs.find((tab) => tab.name === activeTab.value)) {
      if (newTabs.length > 0) {
        changeTab(newTabs[0].name);
      } else {
        activeTab.value = null;
      }
    }
  },
);

// Function to compute tab button classes
function tabButtonClass(tabName: string) {
  const baseClasses =
    'py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm whitespace-nowrap focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-all duration-300';
  const activeClasses = 'border-red-600 text-black font-bold dark:text-white';
  const inactiveClasses =
    'border-transparent text-gray-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-500';

  return [baseClasses, activeTab.value === tabName ? activeClasses : inactiveClasses].join(' ');
}

// Function to update the URL hash when the active tab changes
const updateHash = (tabName: string) => {
  router.replace({ hash: `#${tabName}` });
};

// Watch for activeTab changes to update the URL hash
watch(
  () => activeTab.value,
  (newTab) => {
    if (newTab) {
      updateHash(newTab);
    }
  },
);
</script>
<style>
.min-h-dvh-64 {
  min-height: calc(100vh - 66px);
}

/* Custom scrollbar styles */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  background-color: var(--scrollbar-track-color);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color);
  border-radius: 9999px;
}

/* Define CSS variables for scrollbar colors */
:root {
  --scrollbar-track-color: #f3f4f6; /* Tailwind's gray-100 */
  --scrollbar-thumb-color: #d1d5db; /* Tailwind's gray-300 */
}

.dark {
  --scrollbar-track-color: #374151; /* Tailwind's neutral-700 */
  --scrollbar-thumb-color: #6b7280; /* Tailwind's neutral-500 */
}

/* Fade transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
