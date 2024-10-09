<template>
  <div v-if="calendarApp">
    <ScheduleXCalendar :calendar-app="calendarApp">
      <!-- Customize Event Appearance -->
      <template #monthGridEvent="{ calendarEvent }">
        <div :class="getEventClass(calendarEvent)" :style="getEventStyle(calendarEvent)">
          {{ calendarEvent.title }}
        </div>
      </template>
    </ScheduleXCalendar>
  </div>
</template>

<script setup>
import {onMounted, ref, computed, watch} from 'vue';
import {ScheduleXCalendar} from '@schedule-x/vue';
import {createCalendar, createViewMonthGrid} from '@schedule-x/calendar';
import {createEventsServicePlugin} from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import {useCentralStore} from '@/stores/centralStore';
import {format} from 'date-fns';

const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;

const selectedName = ref(null);
const selectedDepartment = ref(null);
const selectedLeaveType = ref(null);

const calendarApp = shallowRef(null);
const eventsServicePlugin = createEventsServicePlugin();

/*const colorList = [
  'custom-red',
  'custom-purple',
  'custom-blue',
  'custom-light-blue',
  'custom-teal',
  'custom-amber',
  'custom-orange',
  'custom-brown',
  'custom-grey',
  'custom-green',
];*/
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
const getTypeColor = (vacationId) => {
  if (!vacationId) return '#00F';

  const index = parseInt(vacationId) % colorList.length;
  return colorList[index];
}

function getEventClass(calendarEvent) {
  const leaveTypeId = calendarEvent.extendedProps.leaveTypeId;
  const status = calendarEvent.extendedProps.status;

  /*const leaveTypeClasses = {
    1: 'bg-red-500',
    2: 'bg-green-500',
    3: 'bg-blue-500',
  };*/

  const statusClasses = {
    pending: '',
    approved: '',
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

  leavesStore.leavesData?.allUsers?.forEach(userLeaves => {
    if (Array.isArray(userLeaves)) {
      userLeaves.forEach(leave => {
        const userForLeave = userStore.allUsers.find(user => user.id === leave.user_id);
        if (!userForLeave) return;

        // Apply filters
        if (selectedName.value && !userForLeave.name.includes(selectedName.value)) return;
        if (selectedDepartment.value && userForLeave.department_id !== selectedDepartment.value) return;
        if (selectedLeaveType.value && leave.leave_type_id !== selectedLeaveType.value) return;

        returnArray.push({
          ...leave,
          name: userForLeave.name || '',
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
      createViewMonthGrid({
        moreLinkText: (num) => `+${num} άτομα`,
      }),
    ],
    plugins: [eventsServicePlugin], // Use the events service plugin
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
  console.log('loading users');
  await leavesStore.getAllUsers(); // Replace with actual data fetching method
  await userStore.getAllUsers();

  initializeCalendar();
});

</script>

<style scoped>
.sx-vue-calendar-wrapper {
  width: 100%;
  height: 800px;
  max-height: 90vh;
}
div:has(> .leave-entry) {
  margin-left:4px;
}
</style>
