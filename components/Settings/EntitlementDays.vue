<template>
  <template v-if="loading">
    <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
      <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
      <div class="pt-4 space-y-2 col-span-10 animate-pulse">
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col gap-[10px]">
      <div
          v-if="permissionsStore.can('entitlement', 'modify')"
          class="info-actions pb-5 flex gap-4 col-span-2">
        <button
            @click="newEntitlement"
            class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
          {{ $t('settings.addEntitlement') }}
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1">
          {{ $t('settings.filters') }}
        </div>

        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.firstName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                :placeholder="$t('settings.firstName')"
            />
            <button
                v-if="filters.firstName"
                @click="filters.firstName = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.lastName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.lastName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                :placeholder="$t('settings.lastName')"
            />
            <button
                v-if="filters.lastName"
                @click="filters.lastName = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.year"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.year ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                :placeholder="$t('common.year')"
            />
            <button
                v-if="filters.year"
                @click="filters.year = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 lg:justify-self-end items-center">
          <button
              v-if="filters.firstName || filters.lastName || filters.leave_type || filters.year"
              @click="
                filters.firstName = '';
                filters.lastName  = '';
                filters.leave_type = 1;
                filters.year = null;
              "
              class="text-red-500"
          >
            &times; {{ $t('settings.clearFilters') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="col-span-1">
          {{ $t('settings.sortBy') }}
        </div>
        <div
            @click="sortBy('firstName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          {{ $t('settings.firstName') }}
          <span v-if="currentSortKey === 'firstName'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <div
            @click="sortBy('lastName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          {{ $t('settings.lastName') }}
          <span v-if="currentSortKey === 'lastName'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
      </div>
      <div class="relative -m-4 p-4 mt-0">
        <div ref="scrollContainer"
             class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <div v-for="user in filteredUsers" :key="user.id" :class="`flex flex-col border border-[#DFEAF2] rounded-lg ${ !toggledUsers[user.id] ? 'hover:bg-neutral-100 dark:hover:bg-neutral-600 pl-[20px] pr-[30px] py-[10px]' : ''} text-[#808080]`">
            <div :class="`grid gap-[10px] grid-cols-2  lg:grid-cols-12 items-center cursor-pointer ${ toggledUsers[user.id] ? 'rounded-t-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 pb-4 pl-[20px] pr-[30px] pt-[10px]' : ''}`" @click="toggleUserEntitlements(user.id)">
              <div class="mr-4 flex flex-shrink-0 items-center justify-center col-span-1 ">
                <SharedUserAvatar :user="user" :size="50" />
              </div>
              <div class="col-span-2">
                {{ user.firstName || '' }}
              </div>
              <div class="col-span-2">
                {{ user.lastName || '' }}
              </div>
              <div class="col-span-2">
              </div>
            </div>
            <div v-if="toggledUsers[user.id]" class="toggledOpen pt-4 border-t border-gray-200 dark:border-neutral-700 pl-[20px] pr-[30px] pb-[10px]">
              <div class="grid grid-cols-6 font-bold text-sm text-black dark:text-white pb-2">
                <div>{{ $t('common.type') }}</div>
                <div>{{ $t('common.from') }}</div>
                <div>{{ $t('common.to') }}</div>
                <div>{{ $t('settings.entitledDays') }}</div>
                <div>{{ $t('settings.remainingDays') }}</div>
                <div></div>
              </div>
              <div v-for="entitlement in getFilteredEntitlements(user.id)" :key="entitlement.id" class="grid grid-cols-6 items-center py-2 text-sm">
                <div>{{ entitlement.leave_type_name }}</div>
                <div>{{ entitlement.start_from }}</div>
                <div>{{ entitlement.end_to }}</div>
                <div>{{ entitlement.entitled_days }}</div>
                <div>{{ entitlement.remaining_days }}</div>
                <div class="justify-self-end flex gap-[25px] items-center">
                  <a v-if="permissionsStore.can('entitlement','modify')" @click.stop="editEntitlement(entitlement.id)" class="cursor-pointer text-[#EA021A] font-bold underline">{{ $t('settings.editDays') }}</a>
                  <svg v-if="permissionsStore.can('entitlement','modify')" @click.stop="deleteEntitlement(entitlement.id)" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
                    <path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z" :fill="theme === 'light' ? 'black' : 'white'"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeModal"
  >
    <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative">
      <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        <svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500"  xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black">
          <path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <component :is="modalComponent" :entitlementId="selectedEntitlementId" @saved="closeModal" />
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import EditEntitlement from "~/components/Settings/EditEntitlement.vue";
import DeleteEntitlement from "~/components/Settings/DeleteEntitlement.vue";
import UserAvatar from '@/components/shared/UserAvatar.vue';

// Access the necessary stores
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const permissionsStore = centralStore.permissionsStore;
const entitlementStore = centralStore.entitlementStore;
const leavesStore = centralStore.leavesStore;

// Reactive variables for modal management
const showModal = ref(false);
const modalType = ref(''); // 'edit' or 'delete'
const selectedEntitlementId = ref(null);
const selectedEntitlementUserId = ref(null);

// Reactive variable to store all users
const allUsers = ref([]);
const userEntitlements = ref({}); // Now an object to hold entitlements for each user

const toggledUsers = ref({});

// Compute the current theme
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});

// Process users to extract firstName and lastName
watch(
    () => userStore.allUsers,
    (users) => {
      allUsers.value = users.map(user => {
        const nameSplit = user.name.trim().split(' ');
        const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
        const lastName = nameSplit.slice(-1).join(' ') || '';

        return {
          ...user,
          firstName,
          lastName,
        };
      });
    },
    { immediate: true }
);

// Map leave type IDs to their names
const leaveTypesMap = computed(() => {
  return leavesStore.leavesData.leavesTypes.reduce((map, type) => {
    map[type.id] = type.name;
    return map;
  }, {});
});

const getLeaveTypeName = (id) => {
  return leaveTypesMap.value[id] || '';
};

// Loading state from centralStore
const loading = computed(() => centralStore.loading);

// Reactive variables for sorting
const sortDirection = ref(true);
const currentSortKey = ref('');

const sortBy = (sortingKey) => {
  if (currentSortKey.value === sortingKey) {
    sortDirection.value = !sortDirection.value;
  } else {
    currentSortKey.value = sortingKey;
    sortDirection.value = true;
  }
};

const sortByFunctions = {
  'firstName': (a, b) => a.firstName.localeCompare(b.firstName),
  'lastName': (a, b) => a.lastName.localeCompare(b.lastName),
};

// Define filters with pre-selected values
const filters = ref({
  firstName: '',
  lastName: '',
  year: new Date().getFullYear(),
});

// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
  let users = allUsers.value.filter((user) =>
      (filters.value.firstName !== '' ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase()) : true)
      && (filters.value.lastName !== '' ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase()) : true)
  );

  if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
    users = users.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return users;
});

// New computed property to get filtered entitlements for a specific user
const getFilteredEntitlements = computed(() => (userId) => {
  const allEntitlements = entitlementStore.entitledDaysData.savedUsers[userId] || {};

  // If no specific year is filtered, flatten all entitlements into a single array
  if (!filters.value.year) {
    return Object.values(allEntitlements).flatMap(yearEntitlements => yearEntitlements);
  }
  // Otherwise, return the entitlements for the specific filtered year
  return allEntitlements[filters.value.year] || [];
});

const newEntitlement = () => {
  selectedEntitlementId.value = null;
  modalType.value = 'edit';
  showModal.value = true;
};

const editEntitlement = (entitlementId) => {
  selectedEntitlementId.value = entitlementId;
  const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers)
      .flatMap(Object.values)
      .flat();
  const target = allEntitlements.find(e => e.id === entitlementId);
  selectedEntitlementUserId.value = target?.user_id ?? null;
  modalType.value = 'edit';
  showModal.value = true;
};

const deleteEntitlement = (entitlementId) => {
  selectedEntitlementId.value = entitlementId;
  const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers)
      .flatMap(Object.values)
      .flat();
  const target = allEntitlements.find(e => e.id === entitlementId);
  selectedEntitlementUserId.value = target?.user_id ?? null;
  modalType.value = '';
  showModal.value = true;
};

// Simplified toggle function to manage UI state only
const toggleUserEntitlements = async (userId) => {
  // Toggle the user's state
  if (toggledUsers.value[userId]) {
    delete toggledUsers.value[userId];
  } else {
    toggledUsers.value[userId] = true;
  }
  console.log(toggledUsers);
};

// Watch for changes in toggled users to trigger data fetch
watch(() => toggledUsers.value, async (newToggledUsers) => {
  const usersToFetch = Object.keys(newToggledUsers);
  for (const userId of usersToFetch) {
    await entitlementStore.getEntitledDaysForUser(userId);
  }
}, { deep: true });

// Watch for changes in the year filter and re-fetch data for currently toggled users
watch(() => filters.value.year, (newYear, oldYear) => {
  const usersToReFetch = Object.keys(toggledUsers.value);
  for (const userId of usersToReFetch) {
    entitlementStore.getEntitledDaysForUser(userId);
  }
});


const closeModal = async () => {
  showModal.value = false;
  if (selectedEntitlementUserId.value && toggledUsers.value[selectedEntitlementUserId.value]) {
      await entitlementStore.getEntitledDaysForUser(selectedEntitlementUserId.value, true);
  }
  selectedEntitlementId.value = null;
  selectedEntitlementUserId.value = null;
};

// The modal will always render EditEntitlement
const modalComponent = computed(() => {
  return modalType.value === 'edit' ? EditEntitlement : DeleteEntitlement;
});
</script>

<style scoped>
/* Scoped styles remain unchanged */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(-100%);
}

.slide-left-enter-to {
  transform: translateX(0);
}

.slide-left-leave-from {
  transform: translateX(0);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>