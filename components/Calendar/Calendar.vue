<template>
  <div v-if="calendarApp">
    <!--  <div v-if="false">-->
    <!-- Filters Section -->
    <div class="grid grid-cols-12 gap-4 mb-4 dark:text-white items-end">
      <!-- Name Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <MiscCustomSelect
          v-model="selectedName"
          :options="nameOptions"
          :label="$t('common.name')"
          :placeholder="$t('calendar.allNames')"
          select-id="name-select"
        />
      </div>

      <!-- Department Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <MiscCustomSelect
          v-model="selectedDepartment"
          :options="departments"
          :label="$t('settings.group')"
          :placeholder="$t('calendar.allGroups')"
          select-id="department-select"
        />
      </div>

      <!-- Leave Type Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <MiscCustomSelect
          v-model="selectedLeaveType"
          :options="leaveTypeOptions"
          :label="$t('settings.leaveType')"
          :placeholder="$t('calendar.allTypes')"
          select-id="leave-type-select"
        />
      </div>

      <div
        v-if="selectedDepartment || selectedLeaveType || selectedName"
        class="col-span-12 sm:col-span-3 leading-[46px] justify-self-end"
      >
        <button class="btn btn-secondary text-red-500" @click="clearFilters">
          &times; {{ $t('settings.clearFilters') }}
        </button>
      </div>
    </div>
    <!-- Clear All Filters Button -->

    <!-- Color Legend for Leave Types -->
    <div class="flex flex-wrap mb-4">
      <div
        v-for="type in displayedLeaveTypes"
        :key="type.id"
        class="flex items-center mr-4 mb-2 dark:text-white cursor-pointer opacity-90 hover:opacity-100"
        @click="selectedLeaveType = type.id"
      >
        <span
          class="w-[15px] h-[15px] mr-2"
          :style="'background-color:' + getTypeColor(type.id)"
        ></span>
        <span class="text-[14px]">{{ type.name }}</span>
      </div>
    </div>

    <ScheduleXCalendar :calendar-app="calendarApp">
      <!-- Customize Event Appearance -->
      <template #monthGridEvent="{ calendarEvent }">
        <div
          :class="getEventClass(calendarEvent)"
          :style="getEventStyle(calendarEvent)"
          @click="setEventColor(calendarEvent)"
        >
          {{ calendarEvent.title }}
          <span
            v-if="calendarEvent.extendedProps.status === 'approved'"
            class="relative ml-1 text-green-500 text-[10px] font-bold w-[20px] h-[20px] inline-flex items-center justify-center /* The Background Layer */ before:absolute before:inset-0 before:rounded-full before:bg-gray-300 before:mix-blend-multiply"
            >✓</span
          >
          <span
            v-else-if="calendarEvent.extendedProps.status === 'pending'"
            class="relative ml-1 text-green-500 text-[10px] font-bold w-[20px] h-[20px] inline-flex items-center justify-center /* The Background Layer */ before:absolute before:inset-0 before:rounded-full before:bg-gray-300 before:mix-blend-multiply"
            >⌛</span
          >
        </div>
      </template>
    </ScheduleXCalendar>
    <CalendarEventModal
      v-if="selectedEvent"
      :event="selectedEvent"
      @close="selectedEvent = null"
      @refresh="leavesStore.getAllUsers()"
    />
    <NewLeave ref="newLeaveRef" :hide-button="true" :initial-date="prefilledStartDate" />
    <AdminLeaveModal
      v-model="adminLeaveModalOpen"
      :initial-date="prefilledStartDate"
      @saved="leavesStore.getAllUsers()"
    />

    <BaseModal v-model="showChoiceModal" :title="$t('leaves.newLeaveRequest')">
      <div class="p-6 flex flex-col gap-4">
        <button
          class="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          @click="openUserLeave"
        >
          {{ $t('leaves.newLeaveRequest') }}
        </button>
        <button
          class="py-3 px-4 border border-gray-300 hover:bg-gray-50 dark:border-neutral-600 dark:hover:bg-neutral-700 rounded-lg font-medium transition-colors dark:text-white"
          @click="openAdminLeave"
        >
          {{ $t('leaves.admin.recordBtn') }}
        </button>
      </div>
    </BaseModal>
  </div>

  <div
    v-else
    role="status"
    class="max-w-full p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700 flex flex-col gap-4"
  >
    <div
      v-for="y in Array(5).fill()"
      :key="y"
      class="grid grid-cols-7 gap-4 divide-x divide-gray-200 dark:divide-gray-700"
    >
      <div
        v-for="x in Array(7).fill()"
        :key="x"
        class="items-center justify-between pt-4 pl-4 mt-4"
      >
        <div>
          <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"></div>
          <div class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        </div>
        <div class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
      </div>
    </div>
    <span class="sr-only">Loading...</span>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { ScheduleXCalendar } from '@schedule-x/vue';
import {
  createCalendar,
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
  createViewMonthAgenda,
  viewMonthGrid,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { useCentralStore } from '@/stores/centralStore';
import CalendarEventModal from './CalendarEventModal.vue';
import NewLeave from '~/components/Home/NewLeave.vue';
import AdminLeaveModal from '~/components/Leaves/AdminLeaveModal.vue';
import BaseModal from '~/components/shared/BaseModal.vue';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { getTypeColor } from '@/utils/leaveColors';

const { locale } = useI18n();

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const leavesStore = centralStore.leavesStore;
const permissionsStore = centralStore.permissionsStore;

const selectedName = ref(null);
const selectedDepartment = ref(null);
const selectedLeaveType = ref(null);
const selectedEvent = ref(null);

const prefilledStartDate = ref('');
const showChoiceModal = ref(false);
const adminLeaveModalOpen = ref(false);
const newLeaveRef = ref(null);

const isAdminOrHr = computed(() =>
  permissionsStore.can('profile_leave_balance', 'record_admin_leave'),
);

const handleDateClick = (dateString) => {
  prefilledStartDate.value = dateString;
  if (isAdminOrHr.value) {
    showChoiceModal.value = true;
  } else {
    if (newLeaveRef.value) newLeaveRef.value.openModal();
  }
};

const openUserLeave = () => {
  showChoiceModal.value = false;
  if (newLeaveRef.value) newLeaveRef.value.openModal();
};

const openAdminLeave = () => {
  showChoiceModal.value = false;
  adminLeaveModalOpen.value = true;
};

const displayedLeaveTypes = ref([]);
// Clear Filters Function
const clearFilters = () => {
  selectedName.value = null;
  selectedDepartment.value = null;
  selectedLeaveType.value = null;
};

// CustomSelect Options
const departments = computed(() => departmentsStore.departmentsData);
const leaveTypeOptions = computed(() => leavesStore.leavesData.leavesTypes);
const userLeaves = computed(() => leavesStore.leavesData.allUsers);
const nameOptions = computed(() =>
  userStore.allUsers.map((user) => ({
    id: user.name, // Workaround to use the name as value. CustomSelect doesnt actually use "id" as id.
    // TODO: Add non-req prop to CustomSelect so it can have a variable object key as value
    name: user.name,
  })),
);

const calendarApp = shallowRef(null);
let eventsServicePlugin = createEventsServicePlugin();

// Removed local colorList and getTypeColor - now using utils/leaveColors.ts

// Updated getTypeColor function usage in component (if any specific local wrap needed)
// ... already imported ...

function getEventClass(calendarEvent) {
  const status = calendarEvent.extendedProps.status;

  const statusClasses = {
    pending: 'opacity-80',
    approved: 'opacity-100',
  };

  return ['text-xs rounded text-white w-full p-1 leave-entry', statusClasses[status] || ''].join(
    ' ',
  );
}
function getEventStyle(calendarEvent) {
  const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;

  return `background-color: ${getTypeColor(leaveTypeId)}`;
}

function setEventColor(calendarEvent) {
  const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;
  const userId = calendarEvent.extendedProps.userId;
  const color = getTypeColor(leaveTypeId, userId);
  const root = document.documentElement;

  root.style.setProperty('--custom-event-modal-color', color);
  selectedEvent.value = calendarEvent;
}

const leavesData = computed(() => {
  const returnArray = [];
  userLeaves.value?.forEach((userLeaves) => {
    if (Array.isArray(userLeaves.leaves)) {
      userLeaves?.leaves.forEach((leave) => {
        // Apply filters
        if (selectedName.value && !userLeaves.name.includes(selectedName.value)) return;
        if (
          selectedDepartment.value &&
          parseInt(userLeaves.department_id) !== parseInt(selectedDepartment.value)
        )
          return;
        if (
          selectedLeaveType.value &&
          parseInt(leave.leave_type_id) !== parseInt(selectedLeaveType.value)
        )
          return;
        if (leave.status && leave.status !== 'approved' && leave.status !== 'pending') return;

        returnArray.push({
          ...leave,
          name: userLeaves?.name || '',
          userId: userLeaves?.id,
        });
      });
    }
  });

  return returnArray;
});

// Update displayedLeaveTypes when leavesData changes (replaces side-effect in computed)
watch(
  leavesData,
  (newLeaves) => {
    const leaveTypeMap = new Map();
    const types = [];

    newLeaves.forEach((leave) => {
      if (!leaveTypeMap.has(leave.leave_type_id)) {
        leaveTypeMap.set(leave.leave_type_id, true);
        const typeInfo = leavesStore.leavesData.leavesTypes.find(
          (t) => t.id === leave.leave_type_id,
        );
        if (typeInfo) {
          types.push({
            id: leave.leave_type_id,
            name: typeInfo.name,
          });
        }
      }
    });

    displayedLeaveTypes.value = types;
  },
  { immediate: true },
);

const events = computed(() => {
  const eventsArray =
    leavesData.value
      ?.map((leave) => {
        if (!leave) return null;

        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);

        if (isNaN(startDate) || isNaN(endDate)) {
          console.error('Invalid date in leave:', leave);
          return null;
        }

        return {
          id: leave.id,
          title: leave.name || 'Unnamed Leave',
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd'),
          description: leave.status,
          extendedProps: {
            leaveTypeId: leave.leave_type_id || 0,
            status: leave.status || 'unknown',
            userId: leave.userId,
          },
        };
      })
      .filter(Boolean) || [];

  console.log('Events:', eventsArray);
  return eventsArray;
});

const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});

const localeComputed = computed(() => {
  return locale.value === 'el' ? 'el-GR' : 'en-US';
});

function initializeCalendar() {
  eventsServicePlugin = createEventsServicePlugin();
  calendarApp.value = createCalendar({
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    views: [createViewDay(), createViewWeek(), createViewMonthAgenda(), createViewMonthGrid()],
    plugins: [eventsServicePlugin],
    locale: localeComputed.value,
    defaultView: viewMonthGrid.name,
    theme: theme.value === 'dark' ? 'dark' : 'light',
    monthGridOptions: {
      nEventsPerDay: 4,
    },
    callbacks: {
      onClickDate(dateString) {
        handleDateClick(dateString);
      },
    },
  });
  eventsServicePlugin.set(events.value);
  calendarApp.value.setTheme(theme.value === 'dark' ? 'dark' : 'light');
}

// Single events watcher — runs once, always references the current eventsServicePlugin
watch(events, (newEvents) => {
  if (calendarApp.value) {
    eventsServicePlugin.set(newEvents || []);
  }
});

// Single theme watcher — runs once
watch(
  theme,
  (newVal) => {
    if (calendarApp.value) {
      calendarApp.value.setTheme(newVal === 'dark' ? 'dark' : 'light');
    }
  },
  { immediate: true },
);

// Locale change: null calendarApp so v-if unmounts ScheduleXCalendar cleanly,
// then recreate with a fresh plugin on the next tick
watch(localeComputed, async () => {
  if (calendarApp.value) {
    calendarApp.value.destroy();
    calendarApp.value = null;
    await nextTick();
  }
  initializeCalendar();
});

onMounted(async () => {
  await leavesStore.getAllUsers();
  await leavesStore.getLeavesTypes();
  await userStore.getAllUsers();

  initializeCalendar();
});

/*HELPERS REMOVED - MOVED TO utils/leaveColors.ts*/
</script>

<style>
.sx-vue-calendar-wrapper {
  width: 100%;
  height: 600px;
  max-height: 90vh;
}

@media (min-width: 768px) {
  .sx-vue-calendar-wrapper {
    height: 800px;
  }
}
div:has(> .leave-entry) {
  margin-left: 4px;
}
.sx__event-modal__description {
  white-space: pre-line;
}

.sx__view-container {
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
}

.sx__view-container::-webkit-scrollbar {
  height: 8px;
  background-color: var(--scrollbar-track-color);
}

.sx__view-container::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb-color);
  border-radius: 9999px;
}
.sx__month-grid-day__header-day-name {
  font-size: 16px;
  background: black;
  color: white;
  width: 100%;
  font-weight: bold;
  line-height: 47px;
  padding-left: 10px;
}
.sx__month-grid-week:first-child > div {
  padding-top: 0;
}
:root,
:root.dark {
  --custom-event-modal-color: #f00;
}
.sx__has-icon .sx__event-modal__color-icon {
  /*Override their default background color*/
  background-color: var(--custom-event-modal-color) !important;
}
.sx__month-grid-day {
  cursor: pointer;
}
</style>
