<template>
  <div v-if="loading">
    <!-- Loading Skeleton -->
    <div class="grid gap-4 grid-cols-4 items-center border p-4 rounded-lg">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-500">
            <div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse"></div>
          </div>
          <div class="font-bold">
            <div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse"></div>
          </div>
        </div>
        <div><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse"></div></div>
        <div><div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse"></div></div>
        <div class="flex space-x-2">
          <div>
            <div class="h-8 bg-gray-400 rounded col-span-1 animate-pulse"></div>
          </div>
        </div>
    </div>

    <!-- Repeat as needed -->
  </div>
  <div v-else>
    <div class="grid grid-cols-2 text-black gap-y-2 dark:text-white"
    :class="{'mt-[45px]': props.isSmallComponent}"
    >
      <div class="flex flex-col col-span-2 gap-2 lg:gap-0 lg:grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-4">
        <div
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            class="text-black dark:text-white col-span-1 font-bold flex items-center gap-2">
          {{ $t('leaves.leaveRequests') }} <span class="text-[#EA021A]">({{filteredLeaves.length}})</span>
        </div>
        <div v-else>
          {{ $t('leaves.yearlyLeaves') }}
        </div>
      <!-- Filters Section -->
      <div v-if="!props.isSmallComponent"
           class="ml-4 grid col-span-3 grid-cols-1 gap-2 lg:gap-4 w-full items-end lg:justify-self-end lg:self-end"
           :class="permissionsStore.can('profile_leave_balance', 'accept_leave') ? 'sm:grid-cols-5' : 'sm:grid-cols-3'"
      >
        <!-- Clear Filters Button -->
        <div class="flex items-center h-full pb-2 lg:pb-0 justify-start sm:justify-center leading-[46px]">
          <button @click="clearFilters" class="btn btn-secondary text-red-500 whitespace-nowrap" 
          v-if="filters.group || filters.leaveType || filters.requesterName || filters.year !== currentYear">
            &times; {{ $t('settings.clearFilters') }}
          </button>
        </div>

        <!-- Requester Name Filter (Admins/Managers) -->
        <MiscCustomSelect
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            v-model="filters.requesterName"
            :options="userOptions"
            :label="$t('common.name')"
            :placeholder="$t('common.name')"
            selectId="name-select"
        />

        <!-- Group Filter (Admins/Managers) -->
        <MiscCustomSelect
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            v-model="filters.group"
            :options="groupOptions"
            :label="$t('settings.group')"
            :placeholder="$t('settings.group')"
            selectId="group-select"
        />

        <!-- Leave Type Filter (Everyone) -->
        <MiscCustomSelect
            v-model="filters.leaveType"
            :options="leaveTypeOptions"
            :label="$t('settings.leaveType')"
            :placeholder="$t('leaves.leaveType')"
            selectId="leave-type-select"
        />

        <!-- Year Filter (Everyone) -->
        <MiscCustomSelect
            v-model="filters.year"
            :options="years"
            :label="$t('common.year')"
            :placeholder="$t('common.year')"
            selectId="year-select"
        />

      </div>
      <div class="justify-self-end self-end w-full col-span-3" v-else>
        <NuxtLink to="/yearly-leaves" class="text-right text-[#EA021A] dark:text-[#FF021A] underline block">
          {{ $t('leaves.allRequests') }}
        </NuxtLink>
      </div>
      </div>
      <!-- Leaves List -->
      <div class="col-span-2 grid grid-cols-1 gap-4">
        <!-- Table Headers -->
        <!--<div class="grid gap-4 font-bold pb-[25px] grid-cols-4">
          <div>Ημερομηνίες / Τύπος Άδειας</div>
          <div>Όνομα</div>
          <div>Κατάσταση Άδειας</div>
          <div>Ενέργειες</div>

        </div>-->
        <!-- Leaves Data -->
        <div
            v-for="leave in filteredLeaves"
            :key="leave.id"
            :class="permissionsStore.can('profile_leave_balance','accept_leave') ? 'lg:grid-cols-10' : 'lg:grid-cols-8'"
            class="grid grid-rows-6 lg:grid-rows-none grid-cols-[50px,1fr] gap-y-1 gap-x-[20px] lg:gap-y-0 items-center justify-items-start w-full lg:justify-items-stretch border px-[30px] py-[12px] rounded-lg bg-white dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <!-- Column 1: Date from - Date to on top, leave type on bottom -->
          <div class="lg:col-span-2 lg:gap-x-2 lg:justify-self-start contents lg:grid grid-cols-4 grid-rows-[20px_1fr] justify-start items-center">
            <div class="row-span-6 lg:col-span-1 lg:row-span-2 self-start justify-self-end w-full">
              <img src="https://placehold.co/50x50" alt="Icon" class="rounded-md">
            </div>
            <div class="text-sm text-gray-500 lg:col-span-3 lg:row-span-1 whitespace-nowrap">
              {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
            </div>
            <div class="font-bold lg:col-span-3 lg:row-span-1">
              {{ getLeaveTypeName(leave.leave_type_id) }}
            </div>
          </div>

          <!-- Column 2: User's name -->
          <div class="lg:col-span-2">{{ leave.user.name }}</div>

          <!-- Column 3: Leave status -->
          <div class="lg:col-span-2"
              :class="leave.class">{{ getLeaveStatusLabel(leave.status) }}</div>

          <!-- Column 4: Reason -->
          <div class="lg:col-span-3 lg:mr-4" v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')">
            <input type="text"
                   class="border-0 w-full border-b border-[#DFEAF2] bg-transparent focus:outline-0"
                   :placeholder="$t('leaves.commentPlaceholder')"
                   v-if="leave.status === 'pending'"
                   v-model="leaveComments[leave.id]"
            />
            <div
                v-if="leave.reason || leave.processed_reason"
                class="text-[#808080] dark:text-gray-300 italic text-sm flex flex-col gap-y-[5px]"
            >
              <span v-if="leave?.processed_reason">
                {{ $t('leaves.processedReason') }}: {{ leave?.processed_reason }}
              </span>
              <span v-if="leave?.reason">
                {{ $t('leaves.reason') }}: {{ leave?.reason }}
              </span>
            </div>
          </div>

          <!-- Column 5: Actions -->

            <!-- Approve and Decline Buttons for users with modify permission and pending leaves -->
            <div
                class="flex lg:justify-self-end gap-4 lg:col-span-1 "
                v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')">
              <button
                  v-if="leave.status === 'pending'"
                  @click="approveLeave(leave.id, leave.user.id)"
                  class="py-2 px-4 bg-[#16DBAA26] transition-all dark:bg-green-300 text-green-700 dark:text-green-800 dark:hover:text-green-500 rounded-md hover:bg-green-300 dark:hover:bg-green-100"
              >
                <CheckIcon class="h-5 w-5" />
              </button>
              <button
                  v-if="leave.status === 'pending'"
                  @click="declineLeave(leave.id, leave.user.id)"
                  class="
                  py-2 px-4 rounded-md transition-all
                  bg-[#FF455F26] hover:bg-red-300
                  text-[#FF455F] hover:text-red-700
                  dark:bg-[#FF455F8F] dark:hover:bg-red-200
                  dark:text-[#FF455F] dark:hover:text-red-700
                  "
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <div v-else class="justify-self-end">
              <!-- Cancel Button for users without modify permission -->
              <button
                  @click="cancelLeave(leave.id)"
                  class="py-2 px-4 border-0
                  text-black hover:text-neutral-500 underline
                  dark:text-white dark:hover:text-neutral-700
                  "
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCentralStore } from '~/stores/centralStore.js';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import { extractApiError } from '@/utils/extractApiError';

const { t, locale } = useI18n();

// Setup stores
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;
const userStore = centralStore.userStore;

// Loading
const loading = ref(true); // Set loading to true initially

const currentYear = new Date().getFullYear();
const props = defineProps({
  isSmallComponent: {
    type: Boolean,
    required: false,
    default: false,
  },
  leavesNumber: {
    type: Number,
    required: false,
    default: 9999999,
  },
});

const leaveComments = ref([]);
// Fetch data
const allLeaves = ref([]);
const years = computed(() => {
  const yearSet = new Set();
  yearSet.add(currentYear);

  allLeaves.value.forEach((leave) => {
    if (leave?.start_date) {
      yearSet.add(new Date(leave.start_date).getFullYear());
    }
    if (leave?.end_date) {
      yearSet.add(new Date(leave.end_date).getFullYear());
    }
  });

  return Array.from(yearSet)
    .sort((a, b) => b - a)
    .map(year => ({
      id: `${year}`,
      name: `${year}`
    }));
});

const leaveClass = {
  pending:'text-[#E59926]',
  canceled:'text-[#FF455F]',
  cancelled:'text-[#FF455F]',
  approved:'text-[#16DBAA]',
  denied:'text-[#FF455F]',
  rejected:'text-[#FF455F]',
  declined:'text-[#FF455F]',
};

// Filter Options
const userOptions = computed(() => {
  const usersWithLeaves = new Map();
  allLeaves.value.forEach(l => {
    if (l.user && !usersWithLeaves.has(l.user.id)) {
      usersWithLeaves.set(l.user.id, l.user.name);
    }
  });
  return Array.from(usersWithLeaves.entries()).map(([id, name]) => ({ id: name, name: name }));
});

const groupOptions = computed(() => {
  const departmentIdsWithLeaves = new Set(allLeaves.value.map(l => l.user?.department_id).filter(id => id !== undefined));
  return centralStore.departmentsStore.departmentsData
    .filter(dept => departmentIdsWithLeaves.has(dept.id))
    .map(dept => ({ id: dept.id, name: dept.name }));
});

const leaveTypeOptions = computed(() => {
  const leaveTypeIdsWithLeaves = new Set(allLeaves.value.map(l => l.leave_type_id));
  return leavesStore.leavesData.leavesTypes
    .filter(type => leaveTypeIdsWithLeaves.has(type.id))
    .map(type => ({ id: type.id, name: type.name }));
});


onMounted(async () => {
  try {
    await refreshLeaves();
    console.log('Available years:', years.value);
  } catch (error) {
    console.error('Error fetching leaves:', error);
  }
});

// Filters
const filters = ref({
  requesterName: null,
  group: null,
  leaveType: null,
  year: currentYear,
});

const clearFilters = () => {
  filters.value = {
    requesterName: null,
    group: null,
    leaveType: null,
    year: currentYear,
  };
};

// Computed property for filtered leaves
const filteredLeaves = computed(() => {
  const returnArray = allLeaves.value
      .filter(leave => {
        // Filter by requester's name
        const requesterNameMatch = filters.value.requesterName
            ? leave.user.name === filters.value.requesterName
            : true;

        // Filter by group
        const groupMatch = filters.value.group
            ? leave.user.department_id && leave.user.department_id.toString() === filters.value.group.toString()
            : true;

        // Filter by leave type
        const leaveTypeMatch = filters.value.leaveType
            ? leave.leave_type_id && leave.leave_type_id.toString() === filters.value.leaveType.toString()
            : true;

        // Filter by year
        const yearMatch = filters.value.year
            ? new Date(leave.start_date).getFullYear() === parseInt(filters.value.year)
            : true;

        const requesterMatchesUserNotAdmin = (permissionsStore.isAdmin() || userStore.userId === leave.user_id);

        return requesterNameMatch && groupMatch && leaveTypeMatch && yearMatch && requesterMatchesUserNotAdmin;
      })
      .sort((a, b) => {
        if(a.status === 'pending' && b.status !== 'pending') {
          return -1;
        }
        if(a.status !== 'pending' && b.status === 'pending') {
          return 1;
        }
        return new Date(b.start_date) - new Date(a.start_date);
      }); // Newest first

  if(props.isSmallComponent) {
    return returnArray.slice(0, props.leavesNumber);
  }
  return returnArray;
});

// Methods for actions
const approveLeave = async (leaveId, userId) => {
  try {
    await leavesStore.approveLeave(userId, leaveId, 'approved', (leaveComments.value[leaveId] ?? ''));
    // Refresh data
    await refreshLeaves();
    useNuxtApp().$toast.success(t('leaves.approveSuccess'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.approveError'), {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};

const declineLeave = async (leaveId, userId) => {
  try {
    await leavesStore.declineLeave(userId, leaveId, 'rejected', (leaveComments.value[leaveId] ?? ''));
    await refreshLeaves();
    useNuxtApp().$toast.success(t('leaves.rejectSuccess'), {
      position: "bottom-right",
      autoClose: 5000,
    });
  } catch (error) {
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.rejectError'), {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};

const cancelLeave = async (leaveId) => {
  try {
    await leavesStore.cancelLeave(leaveId);
    // Refresh data
    await refreshLeaves();
    useNuxtApp().$toast.success(t('leaves.cancelSuccess'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error(t('leaves.cancelError'), {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};

const refreshLeaves = async () => {
  // Re-fetch the data
  try {
    loading.value = true;
    await leavesStore.getAllUsers();
    const usersData = leavesStore.leavesData.allUsers;
    allLeaves.value = [];
    usersData.forEach(user => {
      const userLeaves = user.leaves || [];
      userLeaves.forEach(leave => {
        allLeaves.value.push({
          ...leave,
          user,
          class: leaveClass[leave.status] ?? '',
        });
      });
    });
  } catch (error) {
    console.error('Error refreshing leaves:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString(locale.value === 'el' ? 'el-GR' : 'en-US', options);
};

const getLeaveTypeName = (leaveTypeId) => {
  const leaveType = leavesStore.leavesData.leavesTypes.find(type => type.id === leaveTypeId);
  return leaveType ? leaveType.name : t('common.unknownType');
};

const getLeaveStatusLabel = (status) => {
  // Map status codes to labels (adjust as needed)
  const statusLabels = {
    'pending': t('leaves.pending'),
    'approved': t('leaves.approved'),
    'declined': t('leaves.rejected'),
    'rejected': t('leaves.rejected'),
    'denied': t('leaves.rejected'),
    'cancelled': t('leaves.cancelled'),
    'canceled': t('leaves.cancelled'),
    // Add other statuses if needed
  };
  return statusLabels[status] || status;
};
</script>

<style scoped>
.input {
  /* Add input styles as needed */
  border: 1px solid #ccc;
}

button {
  /* Button styles */
  cursor: pointer;
}
</style>
