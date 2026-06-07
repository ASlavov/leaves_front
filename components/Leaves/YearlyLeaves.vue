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
        class="flex flex-col col-span-2 gap-3"
      >
        <!-- Top row: Title + Record Button -->
        <div class="flex flex-wrap items-center gap-3">
          <div
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            class="text-black dark:text-white font-bold flex items-center gap-4 flex-wrap"
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
        </div>
        <!-- Filters Section -->
        <div
          v-if="!props.isSmallComponent"
          class="grid grid-cols-1 gap-2 lg:gap-4 w-full items-end"
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
        <div v-else class="w-full">
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
          class="group relative flex flex-wrap items-center bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 hover:border-red-100 dark:hover:border-red-900/30 hover:shadow-sm transition-all duration-200 rounded-xl px-5 py-4 gap-x-4 gap-y-3"
        >
          <!-- Status bar (left edge) -->
          <div
            class="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
            :class="{
              'bg-yellow-400': leave.status === 'pending',
              'bg-emerald-500': leave.status === 'approved',
              'bg-red-400': leave.status === 'cancelled' || leave.status === 'canceled',
              'bg-red-600':
                leave.status === 'rejected' ||
                leave.status === 'declined' ||
                leave.status === 'denied',
            }"
          ></div>

          <!-- Icon + date + leave type -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              :class="{
                'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400':
                  leave.status === 'pending',
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400':
                  leave.status === 'approved',
                'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400':
                  leave.status !== 'pending' && leave.status !== 'approved',
              }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="min-w-0">
              <p
                class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5 whitespace-nowrap"
              >
                {{ formatDate(leave.start_date) }} — {{ formatDate(leave.end_date) }}
              </p>
              <p class="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                {{ getLeaveTypeName(leave.leave_type_id) }}
              </p>
            </div>
          </div>

          <!-- User avatar + name (admin view) -->
          <div
            v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
            class="flex items-center gap-2 min-w-[120px]"
          >
            <SharedUserAvatar :user="leave.user" :size="28" class="shrink-0" />
            <span class="text-sm text-gray-600 dark:text-gray-300 truncate">{{
              leave.user.name
            }}</span>
          </div>

          <!-- Status badge -->
          <div class="flex items-center">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap"
              :class="{
                'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400':
                  leave.status === 'pending',
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400':
                  leave.status === 'approved',
                'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400':
                  leave.status !== 'pending' && leave.status !== 'approved',
              }"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="{
                  'bg-yellow-400': leave.status === 'pending',
                  'bg-emerald-500': leave.status === 'approved',
                  'bg-red-400': leave.status !== 'pending' && leave.status !== 'approved',
                }"
              ></span>
              {{ getLeaveStatusLabel(leave.status || 'unknown') }}
            </span>
          </div>

          <!-- Actions: approve/decline (admin) or cancel (user) -->
          <div class="flex items-center gap-2 ml-auto">
            <template v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')">
              <button
                v-if="leave.status === 'pending'"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
                :title="$t('leaves.approve')"
                @click="approveLeave(leave.id, leave.user.id)"
              >
                <CheckIcon class="h-4 w-4" />
              </button>
              <button
                v-if="leave.status === 'pending'"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                :title="$t('leaves.decline')"
                @click="declineLeave(leave.id, leave.user.id)"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </template>
            <button
              v-else-if="leave.status === 'approved' || leave.status === 'pending'"
              class="text-sm font-semibold text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
              @click="cancelLeave(leave.id)"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>

          <!-- Comment input (pending, admin) -->
          <div
            v-if="
              permissionsStore.can('profile_leave_balance', 'accept_leave') &&
              leave.status === 'pending'
            "
            class="w-full basis-full"
          >
            <input
              v-model="leaveComments[leave.id]"
              type="text"
              class="w-full text-sm bg-gray-50 dark:bg-neutral-700/50 border border-gray-200 dark:border-neutral-600 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:border-gray-400 dark:focus:border-neutral-500 transition-colors"
              :placeholder="$t('leaves.commentPlaceholder')"
            />
          </div>

          <!-- Comments display -->
          <div
            v-if="leave.processed_reason || leave.reason"
            class="w-full basis-full border-t border-gray-50 dark:border-neutral-700/50 pt-2 flex flex-col gap-1"
          >
            <p
              v-if="leave.processed_reason"
              class="text-xs text-gray-400 dark:text-neutral-500 italic"
            >
              <span class="font-semibold not-italic text-gray-500 dark:text-neutral-400"
                >{{ $t('leaves.processedReason') }}:</span
              >
              {{ leave.processed_reason }}
            </p>
            <p v-if="leave.reason" class="text-xs text-gray-400 dark:text-neutral-500 italic">
              <span class="font-semibold not-italic text-gray-500 dark:text-neutral-400"
                >{{ $t('leaves.reason') }}:</span
              >
              {{ leave.reason }}
            </p>
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
import SharedUserAvatar from '~/components/shared/UserAvatar.vue';
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
      const targetUser = userStore.allUsers.find(
        (u: User) => String(u.id) === String(route.query.userId),
      );
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
  },
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
