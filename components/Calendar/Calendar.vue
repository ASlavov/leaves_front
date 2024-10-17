<template>
  <div v-if="calendarApp">
<!--  <div v-if="false">-->
    <!-- Filters Section -->
    <div class="grid grid-cols-12 gap-4 mb-4 dark:text-white items-end">
      <!-- Name Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <CustomSelect
            v-model="selectedName"
            :options="nameOptions"
            label="Όνομα"
            placeholder="Επιλέξτε Όνομα"
            selectId="name-select"
        />
      </div>

      <!-- Department Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <CustomSelect
            v-model="selectedDepartment"
            :options="departments"
            label="Γκρουπ"
            placeholder="Επιλέξτε Γκρουπ"
            selectId="department-select"
        />
      </div>

      <!-- Leave Type Filter -->
      <div class="col-span-12 sm:col-span-3 dark:text-white">
        <CustomSelect
            v-model="selectedLeaveType"
            :options="leaveTypeOptions"
            label="Τύπος Άδειας"
            placeholder="Επιλέξτε Τύπο Άδειας"
            selectId="leave-type-select"
        />
      </div>

      <div class="col-span-12 sm:col-span-3 leading-[46px] justify-self-end" v-if="selectedDepartment || selectedLeaveType || selectedName">
        <button @click="clearFilters" class="btn btn-secondary text-red-500">
          &times; Καθαρισμός φίλτρων
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
        <span class="rounded-full w-5 h-5 mr-2" :style="'background-color:' + getTypeColor(type.id)"></span>
        <span class="text-sm">{{ type.name }}</span>
      </div>
    </div>

    <ScheduleXCalendar :calendar-app="calendarApp">
      <!-- Customize Event Appearance -->
      <template #monthGridEvent="{ calendarEvent }">
        <div :class="getEventClass(calendarEvent)" :style="getEventStyle(calendarEvent)">
          {{ calendarEvent.title }}
        </div>
      </template>
    </ScheduleXCalendar>
  </div>

  <div v-else role="status" class="max-w-full p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700 flex flex-col gap-4">
    <div class="grid grid-cols-7 gap-4 divide-x divide-gray-200 dark:divide-gray-700" v-for="y in Array(5).fill()" :key="y">
      <div class="items-center justify-between pt-4 pl-4 mt-4" v-for="x in Array(7).fill()" :key="x">
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
import {computed, onMounted, ref, watch} from 'vue';
import {ScheduleXCalendar} from '@schedule-x/vue';
import {
  createCalendar,
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
  createViewMonthAgenda,
  viewMonthGrid
} from '@schedule-x/calendar';
import {createEventsServicePlugin} from '@schedule-x/events-service';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import '@schedule-x/theme-default/dist/index.css';
import {useCentralStore} from '@/stores/centralStore';
import {format} from 'date-fns';
import CustomSelect from "~/components/misc/CustomSelect.vue";

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const departmentsStore = centralStore.departmentsStore;
const userStore = centralStore.userStore;

const selectedName = ref(null);
const selectedDepartment = ref(null);
const selectedLeaveType = ref(null);

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
const nameOptions = computed(() =>
    userStore.allUsers.map(user => ({
      id: user.name, // Workaround to use the name as value. CustomSelect doesnt actually use "id" as id.
      // TODO: Add non-req prop to CustomSelect so it can have a variable object key as value
      name: user.name,
    }))
);

const calendarApp = shallowRef(null);
const eventsServicePlugin = createEventsServicePlugin();

const colorList = [
  '#F44336',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#FFC107',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#4CAF50',
];

// Function to convert HEX to HSL
function hexToHSL(H) {
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta === 0)
    h = 0;
  else if (cmax === r)
    h = ((g - b) / delta) % 6;
  else if (cmax === g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

// Function to convert HSL to HEX
function HSLToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);
  if (r.length === 1)
    r = "0" + r;
  if (g.length === 1)
    g = "0" + g;
  if (b.length === 1)
    b = "0" + b;
  return "#" + r + g + b;
}

// Updated getTypeColor function
const getTypeColor = (vacationId, userId) => {
  if (!vacationId) return '#F00';

  const index = parseInt(vacationId) % colorList.length;
  const baseColor = colorList[index];

  const hsl = hexToHSL(baseColor);

  // Adjust the hue slightly based on userId
  const userHash = parseInt(userId) || 0; // Ensure userId is a number
  const hueAdjustment = (userHash * 7) % 10 - 5; // Adjust by -5 to +5 degrees

  const newHue = (hsl.h + hueAdjustment + 360) % 360;

  return HSLToHex(newHue, hsl.s, hsl.l);
};


function getEventClass(calendarEvent) {
  const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;
  const status = calendarEvent.extendedProps.status;

  const statusClasses = {
    pending: 'opacity-80',
    approved: 'opacity-100',
  };

  return [
    'text-xs rounded text-white w-full p-1 leave-entry',
    statusClasses[status] || '',
  ].join(' ');
}
function getEventStyle(calendarEvent) {
  const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;


  return `background-color: ${getTypeColor(leaveTypeId)}`;
}

const leavesData = computed(() => {
  const returnArray = [];
  displayedLeaveTypes.value = [];

  const leaveTypeMap = new Map();

  leavesStore.leavesData?.allUsers?.forEach(userLeaves => {
    if (Array.isArray(userLeaves.leaves)) {
      userLeaves?.leaves.forEach(leave => {

        // Apply filters
        if (selectedName.value && !userLeaves.name.includes(selectedName.value)) return;
        if (selectedDepartment.value && parseInt(userLeaves.department_id) !== parseInt(selectedDepartment.value)) return;
        if (selectedLeaveType.value && parseInt(leave.leave_type_id) !== parseInt(selectedLeaveType.value)) return;
        if (leave.status && leave.status !== 'approved' && leave.status !== 'pending') return;

        if (!leaveTypeMap.has(leave.leave_type_id)) {
          leaveTypeMap.set(leave.leave_type_id, true);
          displayedLeaveTypes.value.push({
            id: leave.leave_type_id,
            name: leavesStore.leavesData.leavesTypes.filter(leaveType => leaveType.id === leave.leave_type_id)[0]?.name,
          });
        }

        returnArray.push({
          ...leave,
          name: userLeaves?.name || '',
        });
      });
    }
  });

  return returnArray;
});

const events = computed(() => {
  const eventsArray = leavesData.value?.map((leave) => {
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
      },
    };
  }).filter(Boolean) || [];

  console.log('Events:', eventsArray);
  return eventsArray;
});

const theme = computed(() => {
  const {$colorMode} = useNuxtApp();
  return $colorMode?.value || 'light';
});

function initializeCalendar() {
  calendarApp.value = createCalendar({
    selectedDate: format(new Date(), 'yyyy-MM-dd'),
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthAgenda(),
      createViewMonthGrid()
    ],
    plugins: [eventsServicePlugin, createEventModalPlugin()],
    locale: 'el-GR',
    defaultView: viewMonthGrid.name,
    monthGridOptions: {
      nEventsPerDay: 4,
    },
  });

  // Set initial events
  eventsServicePlugin.set(events.value);

  // Update events when they change
  watch(events, (newEvents) => {
    console.log('Updating events:', newEvents);
    if (calendarApp.value) {
      eventsServicePlugin.set(newEvents || []);
    }
  }, {immediate: true});

  // Handle theme changes
  watch(theme, (newVal) => {
    if (calendarApp.value) {
      calendarApp.value.setTheme(newVal === 'dark' ? 'dark' : 'light');
    }
  }, {immediate: true});
}

onMounted(async () => {
  // Wait for data to load
  await leavesStore.getAllUsers(); // Replace with actual data fetching method
  await leavesStore.getLeavesTypes();
  await userStore.getAllUsers();

  initializeCalendar();
});

</script>

<style>
.sx-vue-calendar-wrapper {
  width: 100%;
  height: 800px;
  max-height: 90vh;
}
div:has(> .leave-entry) {
  margin-left:4px;
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
.dark .sx__month-grid-day__header-day-name {

}
.sx__month-grid-week:first-child {

}
.sx__month-grid-week:first-child > div {
  padding-top: 0;
}
</style>
