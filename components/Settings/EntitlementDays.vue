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
          v-if="permissionsStore.can('entitlements', 'modify')"
          class="info-actions pb-5 flex gap-4 col-span-2">
        <button
            @click="newEntitlement"
            class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
          Προσθήκη νέας άδειας
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1">
          Φίλτρα:
        </div>

        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.firstName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.firstName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Όνομα"
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
                placeholder="Επώνυμο"
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
                placeholder="Έτος"
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
                filters.year = new Date().getFullYear();
              "
              class="text-red-500"
          >
            &times; Καθαρισμός φίλτρων
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="col-span-1">
          Ταξινόμηση κατά:
        </div>
        <div
            @click="sortBy('firstName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Όνομα
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
          Επώνυμο
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
        <div
            class="col-span-2 text-black dark:text-white flex items-center"
        >
          Έτος
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
          <div v-for="user in filteredUsers" :key="user.id" class="flex flex-col border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080] cursor-pointer" @click="toggleUserEntitlements(user.id)">
            <div class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center">
              <div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
                <img
                    class="rounded-full object-cover size-[50px]"
                    v-if="user?.profile?.profile_image_base64" :src="user?.profile?.profile_image_base64" />
                <span v-else class="text-white font-bold">
                  {{ user.firstName.charAt(0) || '' }}{{ user.lastName?.charAt(0) || '' }}
              </span>
              </div>
              <div class="col-span-2">
                {{ user.firstName || '' }}
              </div>
              <div class="col-span-2">
                {{ user.lastName || '' }}
              </div>
              <div class="col-span-2">
                {{ user?.year || '' }}
              </div>
              <div class="col-span-3 justify-self-end flex gap-[25px] items-center">
                <a v-if="permissionsStore.can('entitlements','modify')" @click.stop="editEntitlement(user.id)" class="cursor-pointer text-[#EA021A] font-bold underline">Επεξεργασία</a>
              </div>
            </div>
            <div v-if="selectedUserId === user.id && showEntitlements" class="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <div class="grid grid-cols-4 font-bold text-sm text-black dark:text-white pb-2">
                <div>Είδος</div>
                <div>Έτος</div>
                <div>Δικαιούμενες Ημέρες</div>
                <div>Υπόλοιπο</div>
              </div>
              <div v-for="entitlement in userEntitlements" :key="entitlement.id" class="grid grid-cols-4 items-center py-2 text-sm">
                <div>{{ getLeaveTypeName(entitlement.leave_type_id) }}</div>
                <div>{{ entitlement.year }}</div>
                <div>{{ entitlement.entitled_days }}</div>
                <div>{{ entitlement.remaining_days }}</div>
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
      <component :is="modalComponent" :entitlementId="selectedEntitlementId" />
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import EditEntitlement from "~/components/Settings/EditEntitlement.vue";

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
const showEntitlements = ref(false);

const selectedUserId = ref(null);

// Reactive variable to store all users
const allUsers = ref([]);

// Process users to extract firstName and lastName
watch(
    () => userStore.allUsers,
    (users) => {
      allUsers.value = users.map(user => {
        // Extract firstName and lastName from user.name
        const nameSplit = user.name.trim().split(' ');
        const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0];
        const lastName = nameSplit.slice(-1).join(' ') || '';

        // Return a new user object with firstName and lastName added
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
  return leavesStore.leaveTypes.reduce((map, type) => {
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
  //leave_type: 1, // Pre-selected filter for leave type
  year: new Date().getFullYear(), // Pre-selected filter for current year
});

// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
  let users = allUsers.value.filter((user) =>
      (filters.value.firstName !== '' ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase()) : true)
      && (filters.value.lastName !== '' ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase()) : true)
      //&& (filters.value.leave_type !== null ? user.leave_type_id === filters.value.leave_type : true)
      //&& (filters.value.year !== null ? user.year === filters.value.year : true)
  );

  if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
    users = users.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return users;
});

const newEntitlement = () => {
  selectedEntitlementId.value = null;
  showModal.value = true;
};

const editEntitlement = (entitlementId) => {
  selectedEntitlementId.value = entitlementId;
  showModal.value = true;
};

const toggleUserEntitlements = async (userId) => {
  if (selectedUserId.value === userId && showEntitlements.value) {
    selectedUserId.value = null;
    showEntitlements.value = false;
    userEntitlements.value = [];
  } else {
    selectedUserId.value = userId;
    showEntitlements.value = true;
    // Fetch entitlements for the selected user
    userEntitlements.value = await entitlementStore.fetchEntitlementsForUser(userId);
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedEntitlementId.value = null;
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