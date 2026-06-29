<template>
  <Sidebar />

  <div class="w-full lg:ps-64 flex min-h-screen bg-gray-100 dark:bg-neutral-900">
    <!-- Settings nav sidebar -->
    <aside
      class="w-52 shrink-0 sticky top-0 h-screen overflow-y-auto flex flex-col bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700"
    >
      <!-- Sidebar header -->
      <div class="px-5 py-5 border-b border-gray-100 dark:border-neutral-700">
        <p class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500">
          {{ $t('settings.title') }}
        </p>
      </div>

      <!-- Nav groups -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-5 px-3">
        <div v-for="group in visibleGroups" :key="group.labelKey">
          <p
            class="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-600 select-none"
          >
            {{ $t(group.labelKey) }}
          </p>
          <div class="space-y-px">
            <button
              v-for="tab in group.tabs"
              :key="tab.name"
              type="button"
              :class="navItemClass(tab.name)"
              @click="changeTab(tab.name)"
            >
              <component :is="tab.icon" />
              <span>{{ $t(tab.labelKey) }}</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Content area -->
    <main class="flex-1 min-w-0 overflow-auto p-6">
      <transition name="fade" mode="out-in">
        <div
          v-if="activeTabObj"
          :key="activeTabObj.name"
          class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden"
        >
          <!-- Content header -->
          <div
            class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-neutral-700"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 shrink-0"
            >
              <component :is="activeTabObj.icon" />
            </div>
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {{ $t(activeTabObj.labelKey) }}
            </h2>
          </div>

          <!-- Tab content -->
          <div class="p-4">
            <component
              :is="activeTabObj.component"
              v-bind="activeTabObj.props ? activeTabObj.props() : {}"
            />
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore';

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
import DocumentSources from '~/components/Settings/DocumentSources.vue';
definePageMeta({ middleware: ['auth'] as any, ssr: false });

// ---------------------------------------------------------------------------
// Icon factory — produces a 16×16 Heroicons-style SVG component
// ---------------------------------------------------------------------------
function makeIcon(paths: string[]): Component {
  return {
    render() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          class: 'w-4 h-4 shrink-0',
        },
        paths.map((d) => h('path', { d })),
      );
    },
  };
}

const IconUserCircle = makeIcon([
  'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
]);
const IconLock = makeIcon([
  'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z',
]);
const IconUsers = makeIcon([
  'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
]);
const IconBuilding = makeIcon([
  'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
]);
const IconShield = makeIcon([
  'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
]);
const IconDocument = makeIcon([
  'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
]);
const IconCalendarDays = makeIcon([
  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z',
]);
const IconClock = makeIcon(['M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z']);
const IconSun = makeIcon([
  'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
]);
const IconLink = makeIcon([
  'M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244',
]);
const IconFolder = makeIcon([
  'M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z',
]);

// ---------------------------------------------------------------------------
// Tab + group definitions
// ---------------------------------------------------------------------------
interface Tab {
  name: string;
  labelKey: string;
  component: Component;
  icon: Component;
  props?: () => Record<string, any>;
  permission: { category: string; action: string } | null;
}

interface TabGroup {
  labelKey: string;
  tabNames: string[];
  tabs: Tab[];
}

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const permissionsStore = centralStore.permissionsStore;

const userId = computed(() => userStore.userId);

const route = useRoute();
const router = useRouter();

const tabs: Tab[] = [
  {
    name: 'edit-profile',
    labelKey: 'settings.editProfile',
    component: EditUser,
    icon: IconUserCircle,
    props: () => ({ userId: userId.value }),
    permission: null,
  },
  {
    name: 'security',
    labelKey: 'settings.security',
    component: Security,
    icon: IconLock,
    permission: null,
  },
  {
    name: 'users',
    labelKey: 'settings.users',
    component: UsersList,
    icon: IconUsers,
    permission: null,
  },
  {
    name: 'groups',
    labelKey: 'settings.groups',
    component: GroupsList,
    icon: IconBuilding,
    permission: null,
  },
  {
    name: 'permissions',
    labelKey: 'settings.permissions',
    component: Permissions,
    icon: IconShield,
    permission: { category: 'permissions', action: 'view' },
  },
  {
    name: 'leave-types',
    labelKey: 'settings.leaveTypes',
    component: LeavesTypesList,
    icon: IconDocument,
    permission: { category: 'leave_types', action: 'view' },
  },
  {
    name: 'entitlement-days',
    labelKey: 'settings.leaveDays',
    component: EntitlementDays,
    icon: IconCalendarDays,
    permission: { category: 'entitlement', action: 'view' },
  },
  {
    name: 'work-week',
    labelKey: 'settings.workWeek',
    component: WorkWeekSettings,
    icon: IconClock,
    permission: { category: 'work_week', action: 'view' },
  },
  {
    name: 'public-holidays',
    labelKey: 'settings.publicHolidays',
    component: PublicHolidays,
    icon: IconSun,
    permission: { category: 'public_holidays', action: 'view' },
  },
  {
    name: 'invitations',
    labelKey: 'settings.invitations',
    component: Invitations,
    icon: IconLink,
    permission: { category: 'invitations', action: 'view' },
  },
  {
    name: 'document-sources',
    labelKey: 'settings.documentSources',
    component: DocumentSources,
    icon: IconFolder,
    permission: { category: 'permissions', action: 'view' },
  },
];

const groups: Omit<TabGroup, 'tabs'>[] = [
  { labelKey: 'settings.groupPersonal', tabNames: ['edit-profile', 'security'] },
  { labelKey: 'settings.groupPeople', tabNames: ['users', 'groups', 'permissions'] },
  { labelKey: 'settings.groupLeave', tabNames: ['leave-types', 'entitlement-days'] },
  {
    labelKey: 'settings.groupCompany',
    tabNames: ['work-week', 'public-holidays', 'invitations', 'document-sources'],
  },
];

const visibleTabs = computed<Tab[]>(() =>
  tabs.filter((tab) => {
    if (tab.permission) {
      return permissionsStore.can(tab.permission.category, tab.permission.action);
    }
    return true;
  }),
);

const visibleGroups = computed<TabGroup[]>(() =>
  groups
    .map((g) => ({
      ...g,
      tabs: g.tabNames
        .map((name) => visibleTabs.value.find((t) => t.name === name))
        .filter(Boolean) as Tab[],
    }))
    .filter((g) => g.tabs.length > 0),
);

const activeTab = ref<string | null>('edit-profile');

const activeTabObj = computed<Tab | undefined>(() =>
  visibleTabs.value.find((tab) => tab.name === activeTab.value),
);

const changeTab = (tabName: string | null) => {
  activeTab.value = tabName;
};

const setActiveTabFromHash = () => {
  const hash = route.hash.replace('#', '');
  const tabExists = visibleTabs.value.find((tab) => tab.name === hash);
  if (tabExists) {
    changeTab(hash);
  } else if (visibleTabs.value.length > 0) {
    changeTab(visibleTabs.value[0].name);
  } else {
    activeTab.value = null;
  }
};

onMounted(() => {
  setActiveTabFromHash();
});

watch(
  () => route.hash,
  () => {
    setActiveTabFromHash();
  },
);

watch(
  () => visibleTabs.value,
  (newTabs) => {
    if (activeTab.value && !newTabs.find((tab) => tab.name === activeTab.value)) {
      changeTab(newTabs.length > 0 ? newTabs[0].name : null);
    }
  },
);

watch(
  () => activeTab.value,
  (newTab) => {
    if (newTab) router.replace({ hash: `#${newTab}` });
  },
);

function navItemClass(tabName: string) {
  const base =
    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 text-left';
  if (activeTab.value === tabName) {
    return `${base} bg-red-50 text-red-600 font-medium dark:bg-red-500/10 dark:text-red-400`;
  }
  return `${base} text-gray-600 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700/50`;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
