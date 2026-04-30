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
          v-if="permissionsStore.can('profile_leave_balance', 'modify')"
          class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          @click="newLeaves"
        >
          {{ $t('settings.addNewLeaves') }}
        </button>
      </div>
      <SharedSettingsFilterBar
        v-model="filters"
        :filter-fields="[
          { key: 'firstName', placeholder: $t('settings.firstName') },
          { key: 'lastName', placeholder: $t('settings.lastName') },
          { key: 'job_title', placeholder: $t('settings.jobTitle') },
          { key: 'department', placeholder: $t('settings.group') },
        ]"
      />

      <div class="relative -m-4 p-4 mt-0">
        <div
          ref="scrollContainer"
          class="overflow-auto max-h-[50vh] grid gap-[10px] pr-[15px] -mr-[5px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="grid gap-[10px] grid-cols-2 lg:grid-cols-12 items-center border border-gray-200 dark:border-neutral-700 rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-gray-500 dark:text-neutral-300 cursor-pointer"
            @click="toggleLeaves(user.id)"
          >
            <div class="mr-4 flex items-center justify-start col-span-1">
              <SharedUserAvatar :user="user" :size="50" />
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
              <a
                v-if="permissionsStore.can('group', 'modify')"
                class="cursor-pointer text-[#EA021A] font-bold underline"
                @click.stop="editUser(user.id)"
                >{{ $t('settings.editLeaves') }}</a
              >
            </div>
            <div
              :ref="
                (el) => {
                  leavesUsersRefs[user.id] = el;
                }
              "
              class="col-span-2 lg:col-span-12 grid hidden overflow-auto max-h-[50vh] gap-[10px] pr-[15px] -mr-[5px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
              <div v-if="loadedUsersLeaves[user.id]?.length" class="grid grid-cols-12 font-bold">
                <div class="col-span-2">
                  <span class="border-b">{{ $t('settings.leaveType') }}:</span>
                </div>
                <div class="col-span-2">
                  <span class="border-b">{{ $t('common.status') }}:</span>
                </div>
                <div class="col-span-2">
                  <span class="border-b">{{ $t('common.days') }}:</span>
                </div>
                <div class="col-span-2">
                  <span class="border-b">{{ $t('common.startDate') }}:</span>
                </div>
                <div class="col-span-2">
                  <span class="border-b">{{ $t('common.endDate') }}:</span>
                </div>
              </div>
              <template v-if="loadedUsersLeaves[user.id]?.length">
                <div
                  v-for="leave in loadedUsersLeaves[user.id]"
                  :key="leave.id"
                  class="grid grid-cols-12"
                >
                  <div class="col-span-2">{{ getLeaveName(leave.leave_type_id) }}</div>
                  <div class="col-span-2">{{ leave.status }}</div>
                  <div class="col-span-2">{{ getLeavesDays(leave) }}</div>
                  <div class="col-span-2">{{ leave.start_date }}</div>
                  <div class="col-span-2">{{ leave.end_date }}</div>
                  <div class="col-span-2">
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SharedBaseModal v-model="showModal">
      <component :is="modalComponent" />
    </SharedBaseModal>
  </template>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import NewLeaves from '@/components/Settings/NewLeaves.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
const allUsers = ref([]);
const sortDirection = ref(true); // true for ascending, false for descending
const currentSortKey = ref(''); // The key currently being sorted by
const leavesUsersRefs = {}; // Plain object
const loadedUsersLeaves = ref([]);
watch(
  () => userStore.allUsers,
  (users) => {
    allUsers.value = users.map((user) => {
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
  { immediate: true },
);

// Define sorting functions
const sortByFunctions = {
  firstName: (a, b) => a.firstName.localeCompare(b.firstName),
  lastName: (a, b) => a.lastName.localeCompare(b.lastName),
  job_title: (a, b) => (a.profile?.job_title || '').localeCompare(b.profile?.job_title || ''),
  department: (a, b) => (a.department?.name || '').localeCompare(b.department?.name || ''),
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
  let users = allUsers.value.filter(
    (user) =>
      (filters.value.firstName !== ''
        ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase())
        : true) &&
      (filters.value.lastName !== ''
        ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
        : true) &&
      (filters.value.department !== ''
        ? user?.department?.name.toLowerCase().includes(filters.value.department.toLowerCase())
        : true) &&
      (filters.value.job_title !== ''
        ? user?.profile?.job_title.toLowerCase().includes(filters.value.job_title.toLowerCase())
        : true),
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
  return leavesStore.leavesData.leavesTypes.find((leaveType) => leaveType.id === leaveId).name;
};

const newLeaves = () => {
  modalType.value = 'new';
  showModal.value = true;
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
};
const toggleLeaves = async (userId) => {
  // Make API Call
  try {
    const result = await leavesStore.getAllByUserId(userId);
    console.log(result);
    loadedUsersLeaves.value[userId] = result;
  } catch {
    useNuxtApp().$toast.error(t('leaves.errorFetchingUserLeaves'), {
      position: 'bottom-right',
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } finally {
    /* intentional */
  }

  // First expand user leaves
  if (loadedUsersLeaves.value[userId]?.length) {
    leavesUsersRefs[userId]?.classList.toggle('hidden');
  }
};

// Compute the component to render in the modal
const modalComponent = computed(() => {
  return modalType.value === 'new' ? NewLeaves : DeleteUser;
});
</script>
