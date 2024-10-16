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
      <div v-if="permissionsStore.can('leave_types','modify')" class="info-actions pb-5 flex gap-4 col-span-2">
        <button
            @click="newLeaveType"
            class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
          Προσθήκη νέου τύπου αδειών
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold hidden">
        <div class="sm:col-span-2 md:col-span-4 lg:col-span-1">
          Φίλτρα:
        </div>

        <!-- Leave Type Name Filter -->
        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.leaveTypeName"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.leaveTypeName ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Τύπος άδειας"
            />
            <button
                v-if="filters.leaveTypeName"
                @click="filters.leaveTypeName = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Leaves Type Days Filter -->
<!--        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.leavesTypeDays"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.leavesTypeDays ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Ημέρες"
            />
            <button
                v-if="filters.leavesTypeDays"
                @click="filters.leavesTypeDays = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>-->

        <!-- Title Filter -->
<!--        <div class="lg:col-span-2 text-black dark:text-white">
          <div class="max-w-full -ml-4 inline-flex group border border-gray-200 rounded-lg transition-all focus-within:border-gray-400 transition-all hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500">
            <input
                v-model="filters.users"
                :class="`py-3 px-4 text-[16px] w-full bg-transparent border-none outline-0 ${filters.users ? '' : 'rounded-r-lg'} rounded-l-lg text-sm focus:outline-none dark:bg-neutral-900 dark:text-neutral-400`"
                type="text"
                placeholder="Χρήστες"
            />
            <button
                v-if="filters.users"
                @click="filters.users = ''"
                class="px-3 py-3 text-[13px] bg-white border-l border-gray-200 rounded-r-lg text-red-500 hover:bg-gray-100 transition-all dark:hover:bg-neutral-700 focus:outline-none dark:bg-neutral-900 dark:border-neutral-700"
            >
              &times;
            </button>
          </div>
        </div>-->

        <!-- Department Filter -->
<!--        <div class="lg:col-span-2 text-black dark:text-white">
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
        </div>-->

        <div class="lg:col-span-3 lg:justify-self-end items-center">
          <button
              v-if="filters.leaveTypeName || filters.leavesTypeDays || filters.users || filters.department"
              @click="
                filters.leaveTypeName = '';
                filters.leavesTypeDays  = '';
                filters.users  = '';
                filters.department = '';
              "
              class="text-red-500"
          >
            &times; Καθαρισμός φίλτρων
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[50px] py-[10px] gap-[10px] font-bold hidden">
        <div class="col-span-1 ">
          Ταξινόμηση κατά:
        </div>
        <!-- First Name Sort Button -->
        <div
            @click="sortBy('leaveTypeName')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Τύπος άδειας
          <span v-if="currentSortKey === 'leaveTypeName'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Up Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <!-- Down Arrow -->
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>
        <!-- Last Name Sort Button -->
<!--        <div
            @click="sortBy('leaveTypeDays')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Ημέρες
          <span v-if="currentSortKey === 'leaveTypeDays'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Up Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Down Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>-->
        <!-- First Name Sort Button -->
<!--        <div
            @click="sortBy('users')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Χρήστες
          <span v-if="currentSortKey === 'users'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Up Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Down Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>-->
        <!-- First Name Sort Button -->
<!--        <div
            @click="sortBy('department')"
            class="cursor-pointer col-span-2 text-black dark:text-white flex items-center"
        >
          Γκρούπς
          <span v-if="currentSortKey === 'department'" class="ml-1">
            <svg v-if="sortDirection" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Up Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 15l7-7 7 7"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              &lt;!&ndash; Down Arrow &ndash;&gt;
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7"/>
            </svg>
          </span>
        </div>-->
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
          <div v-for="leaveType in filteredLeavesTypes" :key="leaveType.id" class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]">
<!--            <div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
              <img v-if="user.profile.profile_image" :src="user.profile.profile_image" />
              <span v-else class="text-white font-bold">
                  {{ user.firstName.charAt(0) || '' }}{{ user.lastName?.charAt(0) || '' }}
              </span>
            </div>-->
            <div class="col-span-8">
              {{ leaveType.name || '' }}
            </div>
            <div class="col-span-4 justify-self-end flex gap-[25px] items-center">
              <a v-if="permissionsStore.can('leave_types','modify')" @click="editUser(user.id)" class="cursor-pointer text-[#EA021A] font-bold underline">Επεξεργασία Προφίλ</a>
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
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <!-- Conditionally render EditUser or DeleteUser component -->
      <component :is="modalComponent" :userId="selectedUserId" />
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';


// Access the necessary stores
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;

// Reactive variables for modal management
const showModal = ref(false);
const modalType = ref(''); // 'edit' or 'delete'
const selectedLeaveTypeId = ref(null);

// Compute the current theme
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});
const showFilters = ref(true);

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};
// Loading state from userStore
const loading = computed(() => centralStore.loading);

// Reactive variable to store all users
const allLeaves = ref([]);
const allUsers = ref([]);

// Process users to extract firstName and lastName
watch(
    () => leavesStore.leavesData.leavesTypes,
    (leaves) => {
      allLeaves.value = leaves;
    },
    { immediate: true }
);
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

// Reactive variables for sorting
const sortDirection = ref(true); // true for ascending, false for descending
const currentSortKey = ref(''); // The key currently being sorted by

// Function to handle sorting when a sort button is clicked
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
  'leaveTypeName': (a, b) => a.name.localeCompare(b.name),
  'leaveTypeDays': (a, b) => parseInt(a.days) - parseInt(b.days),
  'users': (a, b) => a.users.length - b.users.length,
  'department': (a, b) => a.departments.length - b.departments.length,
};

// Define filters
const filters = ref({
  leaveTypeName: '',
  //leaveTypeDays: '',
  users: '',
  department: '',
});

// Computed property for filtered and sorted users
const filteredLeavesTypes = computed(() => {
  // Filter users based on filters (currently empty)
  let leaves = allLeaves.value.filter((leave) =>
      (filters.value.leaveTypeName !== '' ? leave.name.toLowerCase().includes(filters.value.leaveTypeName.toLowerCase()) : true)
      //&& (filters.value.leaveTypeDays !== '' ? leave.daysfilters.value.leaveTypeDays.toLowerCase()) : true)
      && (filters.value.users !== '' ? leave.users.some(user => user.name.toLowerCase().includes(filters.value.users.toLowerCase())) : true)
      && (filters.value.department !== '' ? leave.departments.some(dpt => dpt.name.toLowerCase().includes(filters.value.department.toLowerCase())) : true)
  );

  // Apply sorting if a valid sort key is selected
  if (currentSortKey.value && sortByFunctions[currentSortKey.value]) {

    leaves = leaves.slice().sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return leaves;
});

// Functions to handle edit and delete actions
function canEditUser() {
  // Check if the current user has 'edit_user' permission
  // You can add additional logic if needed, such as checking departments
  return userStore.hasPermission('edit_user');
}

function canDeleteUser() {
  return userStore.hasPermission('delete_user');
}

const getDepartmentsText = (departments) => {
  let loops = departments.length > 5 ? 5 : departments.length;
  let output = ``;

  for(let i = 0; i < loops; i++) {
    output += `<span class="dark:text-white font-bold">${departmentsStore?.departmentsData?.filter(dpt => dpt.id === departments[i])[0]?.name || ''}</span>`;
    if(i !== (loops - 1)) {
      output += `,`;
    }
  }

  if(loops < departments.length) {
    output += `
        <span class="dark:text-white font-bold">
         +${departments.length - loops}
        </span>`;
  }
}
const getUserIcons = (users) => {
  let loops = users.length > 5 ? 5 : users.length;
   /*loops = users.length == 6 ? 6 : loops;*/


  /*
    <div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
      <img v-if="user.profile.profile_image" :src="user.profile.profile_image" />
      <span v-else class="text-white font-bold">
          {{ user.firstName.charAt(0) || '' }}{{ user.lastName?.charAt(0) || '' }}
      </span>
    </div>
  */

  let output = ``;
  for(let i = 0; i < loops; i++) {
    output += `<div class="w-[30px] h-[30px] bg-gray-300 rounded-full -mr-2 flex items-center justify-center col-span-1 ">`;

    const user = allUsers.value.filter(user => user.id === users[i])[0] || null;
    if(user?.profile?.profile_image) {
      output += `<img class="rounded-full" src="${user.profile.profile_image}" />`
    } else {
      output += `
        <span class="text-white font-bold">
          ${ user.firstName.charAt(0) || '' }${ user.lastName?.charAt(0) || '' }
        </span>
        `;
    }
    output += `</div>`;
  }
  if(loops < users.length) {
    output += `<div class="w-[30px] h-[30px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
          <span class="text-white font-bold">
           +${users.length - loops}
          </span>
        </div>`;
  }
  return output;
}

const newLeaveType = () => {
  selectedLeaveTypeId.value = null;
  modalType.value = 'edit';
  showModal.value = true;
};
const editLeaveType = (leaveTypeId) => {
  selectedLeaveTypeId.value = leaveTypeId;
  modalType.value = 'edit';
  showModal.value = true;
};

const deleteLeaveType = (leaveTypeId) => {
  selectedLeaveTypeId.value = leaveTypeId;
  modalType.value = 'delete';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedLeaveTypeId.value = null;
  modalType.value = '';
};

// Compute the component to render in the modal
const modalComponent = computed(() => {
  return modalType.value === 'edit' ? EditLeaveType : DeleteLeaveType;
});
</script>

<script>
</script>