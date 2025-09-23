<template>
  <template v-if="loading">

    <!-- Loading Skeletons -->
    <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
      <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
      <!-- Info Details Skeleton -->
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
      <div class="info-actions pb-5 flex gap-4 col-span-2">
        <button
            v-if="permissionsStore.can('profile_leave_balance','modify')"
            @click="newLeaves"
            class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
          Προσθήκη νέων αδειών
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1">
          Φίλτρα:
        </div>

        <!-- First Name Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
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

        <!-- Last Name Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
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

        <!-- Title Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.job_title"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.job_title ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Τίτλος"
            />
            <button
                v-if="filters.job_title"
                @click="filters.job_title = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Department Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.department"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.department ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Γκρούπ"
            />
            <button
                v-if="filters.department"
                @click="filters.department = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <div class="lg:col-span-3 lg:justify-self-end items-center">
          <button
              v-if="filters.firstName || filters.lastName || filters.job_title || filters.department"
              @click="
                filters.firstName = '';
                filters.lastName  = '';
                filters.job_title  = '';
                filters.department = '';
              "
              class="text-red-500"
          >
            &times; Καθαρισμός φίλτρων
          </button>
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
          <div v-for="user in filteredUsers" :key="user.id" class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080] cursor-pointer" @click="toggleLeaves(user.id)">
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
              {{ user?.profile?.job_title || '' }}
            </div>
            <div class="col-span-2">
              {{ user?.department?.name || '' }}
            </div>
            <div class="col-span-3 justify-self-end flex gap-[25px] items-center">
              <a v-if="permissionsStore.can('group','modify')" @click="editUser(user.id)" class="cursor-pointer text-[#EA021A] font-bold underline">Επεξεργασία Αδειών</a>
            </div>
            <div class="col-span-2 lg:col-span-12 grid hidden
overflow-auto max-h-[50vh]  gap-[10px] pr-[15px] -mr-[5px] [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" :ref="(el) => { leavesUsersRefs[user.id] = el }">
              <div class="grid grid-cols-12 font-bold" v-if="loadedUsersLeaves[user.id]?.length">
                <div class="col-span-2">
                  <span class="border-b">Τύπος Άδειας:</span>
                </div>
                <div class="col-span-2 ">
                  <span class="border-b">Κατάσταση:</span>
                </div>
                <div class="col-span-2 ">
                  <span class="border-b">Ημέρες:</span>
                </div>
                <div class="col-span-2 ">
                  <span class="border-b">Ημερομηνία Έναρξης:</span>
                </div>
                <div class="col-span-2 ">
                  <span class="border-b">Ημερομηνία Λήξης:</span>
                </div>
              </div>
              <div v-if="loadedUsersLeaves[user.id]?.length" v-for="leave in loadedUsersLeaves[user.id]" :key="leave.id" class="grid grid-cols-12">
                <div class="col-span-2" >{{ getLeaveName(leave.leave_type_id) }}</div>
                <div class="col-span-2" >{{ leave.status }}</div>
                <div class="col-span-2" >{{ getLeavesDays(leave) }}</div>
                <div class="col-span-2" >{{ leave.start_date }}</div>
                <div class="col-span-2" >{{ leave.end_date }}</div>
                <div class="col-span-2" >
                  <div>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
        <!-- Conditionally render EditUser or DeleteUser component -->
        <component :is="modalComponent" />
      </div>
    </div>
  </template>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import {useCentralStore} from "~/stores/centralStore.js";
import NewLeaves from '@/components/Settings/NewLeaves.vue';
// Compute the current theme
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});

// Setup stores
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

// Loading
const loading = computed(() => centralStore.loading);

// Other variables
const showModal = ref(false);
const modalType = ref(''); // 'edit' or 'delete'
const selectedUserId = ref(null);
const allUsers = ref([]);
const sortDirection = ref(true); // true for ascending, false for descending
const currentSortKey = ref(''); // The key currently being sorted by
const leavesUsersRefs = {}; // Plain object
const loadedUsersLeaves = ref([]);
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

const sortBy = (sortingKey) => {
  if (currentSortKey.value === sortingKey) {
    // Toggle sort direction if the same key is clicked
    sortDirection.value = !sortDirection.value;
  } else {
    // Set new sort key and reset to ascending order
    currentSortKey.value = sortingKey;
    sortDirection.value = true;
  }
};

// Define sorting functions
const sortByFunctions = {
  'firstName': (a, b) => a.firstName.localeCompare(b.firstName),
  'lastName': (a, b) => a.lastName.localeCompare(b.lastName),
  'job_title': (a, b) => (a.profile?.job_title || '').localeCompare(b.profile?.job_title || ''),
  'department': (a, b) => (a.department?.name || '').localeCompare(b.department?.name || ''),
};

// Define filters
const filters = ref({
  firstName: '',
  lastName: '',
  department: '',
  job_title: '',
});


// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
  // Filter users based on filters (currently empty)
  let users = allUsers.value.filter((user) =>
      (filters.value.firstName !== '' ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase()) : true)
      && (filters.value.lastName !== '' ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase()) : true)
      && (filters.value.department !== '' ? user?.department?.name.toLowerCase().includes(filters.value.department.toLowerCase()) : true)
      && (filters.value.job_title !== '' ? user?.profile?.job_title.toLowerCase().includes(filters.value.job_title.toLowerCase()) : true)
  );

  // Apply sorting if a valid sort key is selected
  if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {
    users = users.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return users;
});
const getLeaveName = (leaveId) => {
  return leavesStore.leavesData.leavesTypes.find(leaveType => leaveType.id === leaveId).name;
}


const newLeaves = () => {
  modalType.value = 'new';
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
  modalType.value = '';
};

const getLeavesDays = (leave) => {

  // Create date objects from the input, ensuring they are valid dates
  const start = new Date(leave.start_date);
  const end = new Date(leave.end_date);

  // Validate that the input dates are valid
  if (isNaN(start) || isNaN(end)) {
    throw new Error('Invalid date format. Please provide valid dates.');
  }

  // Set the time to midnight for both dates to avoid daylight saving issues
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Calculate the difference in milliseconds
  const diffTime = end - start;

  // Convert milliseconds to days and add 1 to include both end dates
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Handle cases where the end date is before the start date
  if (diffDays < 0) {
    throw new Error('End date must be on or after start date.');
  }

  return diffDays;
}
const toggleLeaves = async (userId) => {
  // Make API Call
  try {
    const result = await leavesStore.getAllByUserId(userId);
    //console.log(result);
    loadedUsersLeaves.value[userId] = result;
  } catch(e) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να φέρουμε τις άδειες του χρήστη!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } finally {

  }

  // First expand user leaves
  if(loadedUsersLeaves.value[userId]?.length) {
    leavesUsersRefs[userId]?.classList.toggle('hidden');
  }
}

// Compute the component to render in the modal
const modalComponent = computed(() => {
  return modalType.value === 'new' ? NewLeaves : DeleteUser;
});
</script>