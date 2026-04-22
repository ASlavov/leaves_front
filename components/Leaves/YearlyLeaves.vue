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
    <div
      class="grid grid-cols-2 text-black gap-y-2 dark:text-white"
      :class="{ 'mt-[45px]': props.isSmallComponent }"
    >
      <div
        class="flex flex-col col-span-2 gap-2 lg:gap-0 lg:grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-4"
      >
        <div
          v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
          class="text-black dark:text-white col-span-1 font-bold flex items-center gap-4"
        >
          <div class="whitespace-nowrap">
            {{ $t('leaves.leaveRequests') }}
            <span class="text-[#EA021A]">({{ filteredLeaves.length }})</span>
          </div>
          <button
            v-if="permissionsStore.can('profile_leave_balance', 'record_admin_leave')"
            class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[5px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none whitespace-nowrap"
            @click="adminLeaveModalOpen = true"
          >
            {{ $t('leaves.admin.recordBtn') }}
          </button>
        </div>
        <div v-else>
          {{ $t('leaves.yearlyLeaves') }}
        </div>
        <!-- Filters Section -->
        <div
          v-if="!props.isSmallComponent"
          class="ml-4 grid col-span-3 grid-cols-1 gap-2 lg:gap-4 w-full items-end lg:justify-self-end lg:self-end"
          :class="
            permissionsStore.can('profile_leave_balance', 'accept_leave')
              ? 'sm:grid-cols-5'
              : 'sm:grid-cols-3'
          "
        >
          <!-- Clear Filters Button -->
          <div
            class="flex items-center h-full pb-2 lg:pb-0 justify-start sm:justify-center leading-[46px]"
          >
            <button
              v-if="
                filters.group ||
                filters.leaveType ||
                filters.requesterName ||
                filters.year !== currentYear
              "
              class="btn btn-secondary text-red-500 whitespace-nowrap"
              @click="clearFilters"
            >
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
            select-id="name-select"
          />

          <!-- Group Filter (Admins/Managers) -->
          <MiscCustomSelect
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            v-model="filters.group"
            :options="groupOptions"
            :label="$t('settings.group')"
            :placeholder="$t('settings.group')"
            select-id="group-select"
          />

          <!-- Leave Type Filter (Everyone) -->
          <MiscCustomSelect
            v-model="filters.leaveType"
            :options="leaveTypeOptions"
            :label="$t('settings.leaveType')"
            :placeholder="$t('leaves.leaveType')"
            select-id="leave-type-select"
          />

          <!-- Year Filter (Everyone) -->
          <MiscCustomSelect
            v-model="filters.year"
            :options="years"
            :label="$t('common.year')"
            :placeholder="$t('common.year')"
            select-id="year-select"
          />
        </div>
        <div v-else class="justify-self-end self-end w-full col-span-3">
          <NuxtLink
            to="/yearly-leaves"
            class="text-right text-[#EA021A] dark:text-[#FF021A] underline block"
          >
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
          :class="
            permissionsStore.can('profile_leave_balance', 'accept_leave')
              ? 'xl:grid-cols-10'
              : 'xl:grid-cols-8'
          "
          class="grid grid-rows-6 xl:grid-rows-none grid-cols-[50px,1fr] gap-y-1 gap-x-[20px] xl:gap-y-0 items-center justify-items-start w-full xl:justify-items-stretch border px-[30px] py-[12px] rounded-lg bg-white dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <!-- Column 1: Date from - Date to on top, leave type on bottom -->
          <div
            class="xl:col-span-3 xl:gap-x-2 xl:justify-self-start contents xl:grid grid-cols-[50px,repeat(3,1fr)] grid-rows-[20px_1fr] justify-start items-center"
          >
            <div
              class="row-span-6 xl:col-span-1 xl:row-span-2 shrink-0 self-start justify-self-end w-full"
            >
              <img src="https://placehold.co/50x50" alt="Icon" class="rounded-md" />
            </div>
            <div class="text-sm text-gray-500 xl:col-span-3 xl:row-span-1 whitespace-nowrap">
              {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
            </div>
            <div class="font-bold xl:col-span-3 xl:row-span-1">
              {{ getLeaveTypeName(leave.leave_type_id) }}
            </div>
          </div>

          <!-- Column 2: User's name -->
          <div class="xl:col-span-2">{{ leave.user.name }}</div>

          <!-- Column 3: Leave status -->
          <div class="xl:col-span-1" :class="leave.class">
            {{ getLeaveStatusLabel(leave.status || 'unknown') }}
          </div>

          <!-- Column 4: Reason -->
          <div
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            class="xl:col-span-3 xl:mr-4"
          >
            <input
              v-if="leave.status === 'pending'"
              v-model="leaveComments[leave.id]"
              type="text"
              class="border-0 w-full border-b border-[#DFEAF2] bg-transparent focus:outline-0"
              :placeholder="$t('leaves.commentPlaceholder')"
            />
            <div
              v-if="leave.reason || leave.processed_reason"
              class="text-[#808080] dark:text-gray-300 italic text-sm flex flex-col gap-y-[5px]"
            >
              <span v-if="leave?.processed_reason">
                {{ $t('leaves.processedReason') }}: {{ leave?.processed_reason }}
              </span>
              <span v-if="leave?.reason"> {{ $t('leaves.reason') }}: {{ leave?.reason }} </span>
            </div>
          </div>

          <!-- Column 5: Actions -->

          <!-- Approve and Decline Buttons for users with modify permission and pending leaves -->
          <div
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            class="flex lg:justify-self-end gap-4 lg:col-span-1"
          >
            <button
              v-if="leave.status === 'pending'"
              class="py-2 px-4 bg-[#16DBAA26] transition-all dark:bg-green-300 text-green-700 dark:text-green-800 dark:hover:text-green-500 rounded-md hover:bg-green-300 dark:hover:bg-green-100"
              @click="approveLeave(leave.id, leave.user.id)"
            >
              <CheckIcon class="h-5 w-5" />
            </button>
            <button
              v-if="leave.status === 'pending'"
              class="py-2 px-4 rounded-md transition-all bg-[#FF455F26] hover:bg-red-300 text-[#FF455F] hover:text-red-700 dark:bg-[#FF455F8F] dark:hover:bg-red-200 dark:text-[#FF455F] dark:hover:text-red-700"
              @click="declineLeave(leave.id, leave.user.id)"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <div v-else class="justify-self-end">
            <!-- Cancel Button for users without modify permission -->
            <button
              class="py-2 px-4 border-0 text-black hover:text-neutral-500 underline dark:text-white dark:hover:text-neutral-700"
              @click="cancelLeave(leave.id)"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <AdminLeaveModal v-model="adminLeaveModalOpen" @saved="refreshLeaves" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore';
import { useRoute } from 'vue-router';
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import { extractApiError } from '@/utils/extractApiError';
import type { Leave, User, LeaveType, Department } from '@/types';
import AdminLeaveModal from './AdminLeaveModal.vue';
import {
  useAllUserLeavesReactive,
  useLeavesTypesReactive,
  useLeavesStatusesReactive,
} from '@/composables/leavesApiComposable';

const { t, locale } = useI18n();

const adminLeaveModalOpen = ref(false);

// Setup stores
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;
const userStore = centralStore.userStore;

// --- Reactive Data Fetching ---
const {
  data: remoteLeaves,
  pending: leavesPending,
  refresh: refreshLeavesData,
} = useAllUserLeavesReactive();
const { data: remoteTypes } = useLeavesTypesReactive();
const { data: remoteStatuses } = useLeavesStatusesReactive();

// Sync reactive data to stores (if needed for other components)
watch(
  remoteTypes,
  (newTypes) => {
    if (newTypes) leavesStore.leavesData.leavesTypes = newTypes;
  },
  { immediate: true },
);

watch(
  remoteStatuses,
  (newStatuses) => {
    if (newStatuses) leavesStore.leavesData.leavesStatuses = newStatuses;
  },
  { immediate: true },
);

// Combine local state and remote data
const loading = computed(() => leavesPending.value);

const currentYear = new Date().getFullYear();
const props = withDefaults(
  defineProps<{
    isSmallComponent?: boolean;
    leavesNumber?: number;
  }>(),
  {
    isSmallComponent: false,
    leavesNumber: 9999999,
  },
);

interface LocalLeave extends Leave {
  user: User;
  class: string;
}

const leaveComments = ref<Record<string | number, string>>({});
// Fetch data
const allLeaves = computed<LocalLeave[]>(() => {
  if (!remoteLeaves.value) return [];
  const list: LocalLeave[] = [];
  remoteLeaves.value.forEach((user) => {
    const userLeaves = user.leaves || [];
    userLeaves.forEach((leave: Leave) => {
      list.push({
        ...leave,
        user,
        class: leaveClass[leave.status as string] ?? '',
      } as LocalLeave);
    });
  });
  return list;
});
const years = computed(() => {
  const yearSet = new Set<number>();
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
    .map((year) => ({
      id: `${year}`,
      name: `${year}`,
    }));
});

const leaveClass: Record<string, string> = {
  pending: 'text-[#E59926]',
  canceled: 'text-[#FF455F]',
  cancelled: 'text-[#FF455F]',
  approved: 'text-[#16DBAA]',
  denied: 'text-[#FF455F]',
  rejected: 'text-[#FF455F]',
  declined: 'text-[#FF455F]',
};

// Filter Options
const userOptions = computed(() => {
  const usersWithLeaves = new Map<string | number, string>();
  allLeaves.value.forEach((l) => {
    if (l.user && !usersWithLeaves.has(l.user.id)) {
      usersWithLeaves.set(l.user.id, l.user.name || '');
    }
  });
  return Array.from(usersWithLeaves.entries()).map(([_, name]) => ({ id: name, name: name }));
});

const groupOptions = computed(() => {
  const departmentIdsWithLeaves = new Set(
    allLeaves.value.map((l) => l.user?.department_id).filter((id) => id !== undefined),
  );
  return (centralStore.departmentsStore.departmentsData || [])
    .filter((dept: Department) => departmentIdsWithLeaves.has(dept.id))
    .map((dept: Department) => ({ id: dept.id, name: dept.name }));
});

const leaveTypeOptions = computed(() => {
  const leaveTypeIdsWithLeaves = new Set(allLeaves.value.map((l) => l.leave_type_id));
  return (leavesStore.leavesData.leavesTypes || [])
    .filter((type: LeaveType) => leaveTypeIdsWithLeaves.has(type.id))
    .map((type: LeaveType) => ({ id: type.id, name: type.name }));
});

const route = useRoute();

onMounted(async () => {
  try {
    await refreshLeaves();
    // Handle deep-linking from notifications
    if (route.query.userId) {
      const targetUser = userStore.allUsers.find((u: User) => String(u.id) === String(route.query.userId));
      if (targetUser) {
        filters.value.requesterName = targetUser.name;
      }
    }
  } catch (error) {
    console.error('Error fetching leaves:', error);
  }
});

watch(
  () => route.query.userId,
  (newUserId) => {
    if (newUserId) {
      const targetUser = userStore.allUsers.find((u: User) => String(u.id) === String(newUserId));
      if (targetUser) {
        filters.value.requesterName = targetUser.name;
      }
    }
  }
);

// Filters
const filters = ref({
  requesterName: undefined as string | undefined,
  group: undefined as string | number | undefined,
  leaveType: undefined as string | number | undefined,
  year: currentYear as string | number,
});

const clearFilters = () => {
  filters.value = {
    requesterName: undefined,
    group: undefined,
    leaveType: undefined,
    year: currentYear,
  };
};

// Computed property for filtered leaves
const filteredLeaves = computed(() => {
  const returnArray = allLeaves.value
    .filter((leave) => {
      // Filter by requester's name
      const requesterNameMatch = filters.value.requesterName
        ? leave.user.name === filters.value.requesterName
        : true;

      // Filter by group
      const groupMatch = filters.value.group
        ? leave.user.department_id &&
          leave.user.department_id.toString() === filters.value.group.toString()
        : true;

      // Filter by leave type
      const leaveTypeMatch = filters.value.leaveType
        ? leave.leave_type_id &&
          leave.leave_type_id.toString() === filters.value.leaveType.toString()
        : true;

      // Filter by year
      const yearMatch = filters.value.year
        ? new Date(leave.start_date).getFullYear() === parseInt(filters.value.year as string)
        : true;

      const requesterMatchesUserNotAdmin =
        permissionsStore.isAdmin() || userStore.userId === leave.user_id;

      return (
        requesterNameMatch &&
        groupMatch &&
        leaveTypeMatch &&
        yearMatch &&
        requesterMatchesUserNotAdmin
      );
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') {
        return -1;
      }
      if (a.status !== 'pending' && b.status === 'pending') {
        return 1;
      }
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    }); // Newest first

  if (props.isSmallComponent) {
    return returnArray.slice(0, props.leavesNumber);
  }
  return returnArray;
});

// Methods for actions
const approveLeave = async (leaveId: string | number, userId: string | number) => {
  try {
    await leavesStore.approveLeave(userId, leaveId, 'approved', leaveComments.value[leaveId] ?? '');
    // Refresh data reactively
    await refreshLeavesData();
    useNuxtApp().$toast.success(t('leaves.approveSuccess'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  } catch (error) {
    const { type, message } = extractApiError(error);
    (useNuxtApp() as any).$toast.error(
      type === 'user' && message ? message : t('leaves.approveError'),
      {
        position: 'bottom-right',
        autoClose: 5000,
      },
    );
  }
};

const declineLeave = async (leaveId: string | number, userId: string | number) => {
  try {
    await leavesStore.declineLeave(userId, leaveId, 'rejected', leaveComments.value[leaveId] ?? '');
    await refreshLeavesData();
    useNuxtApp().$toast.success(t('leaves.rejectSuccess'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  } catch (error) {
    const { type, message } = extractApiError(error);
    useNuxtApp().$toast.error(type === 'user' && message ? message : t('leaves.rejectError'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  }
};

const cancelLeave = async (leaveId: string | number) => {
  if (!userStore.userId) return;
  try {
    // Assuming cancelLeave expects userId first
    await leavesStore.cancelLeave(userStore.userId, leaveId, 'cancelled', '');
    // Refresh data
    await refreshLeavesData();
    useNuxtApp().$toast.success(t('leaves.cancelSuccess'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  } catch (error) {
    useNuxtApp().$toast.error(t('leaves.cancelError'), {
      position: 'bottom-right',
      autoClose: 5000,
    });
  }
};

const refreshLeaves = async () => {
  await refreshLeavesData();
};

const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString(locale.value === 'el' ? 'el-GR' : 'en-US', options);
};

const getLeaveTypeName = (leaveTypeId: string | number) => {
  const leaveType = leavesStore.leavesData.leavesTypes.find(
    (type: LeaveType) => type.id === leaveTypeId,
  );
  return leaveType ? leaveType.name : t('common.unknownType');
};

const getLeaveStatusLabel = (status: string) => {
  // Map status codes to labels (adjust as needed)
  const statusLabels: Record<string, string> = {
    pending: t('leaves.pending'),
    approved: t('leaves.approved'),
    declined: t('leaves.rejected'),
    rejected: t('leaves.rejected'),
    denied: t('leaves.rejected'),
    cancelled: t('leaves.cancelled'),
    canceled: t('leaves.cancelled'),
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
