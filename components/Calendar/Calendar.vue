<template>
  <!-- Filters Section -->
  <div class="grid grid-cols-12 gap-4 mb-4 dark:text-white">
    <!-- Name Filter -->
    <div class="col-span-12 sm:col-span-4 dark:text-white">
      <CustomSelect
          v-model="selectedName"
          :options="nameOptions"
          label="Όνομα"
          placeholder="Επιλέξτε Όνομα"
          selectId="name-select"
      />
    </div>

    <!-- Department Filter -->
    <div class="col-span-12 sm:col-span-4 dark:text-white">
      <CustomSelect
          v-model="selectedDepartment"
          :options="departments"
          label="Γκρουπ"
          placeholder="Επιλέξτε Γκρουπ"
          selectId="department-select"
      />
    </div>

    <!-- Leave Type Filter -->
    <div class="col-span-12 sm:col-span-4 dark:text-white">
      <CustomSelect
          v-model="selectedLeaveType"
          :options="leaveTypeOptions"
          label="Τύπος Άδειας"
          placeholder="Επιλέξτε Τύπο Άδειας"
          selectId="leave-type-select"
      />
    </div>
  </div>

  <!-- Clear All Filters Button -->
  <div class="mb-4">
    <button @click="clearFilters" class="btn btn-secondary dark:text-white">
      Καθαρισμός Φίλτρων
    </button>
  </div>

  <!-- Color Legend for Leave Types -->
  <div class="flex flex-wrap mb-4">
    <div
        v-for="type in displayedLeaveTypes"
        :key="type.id"
        class="flex items-center mr-4 mb-2 dark:text-white"
    >
      <span
          :class="[
          'w-4 h-4 rounded-full mr-2',
          getLeaveTypeColor(type.id),
        ]"
      ></span>
      <span class="text-sm">{{ type.name }}</span>
    </div>
  </div>

  <!-- Calendar Header -->
  <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 dark:text-white">
    <div
        v-for="(day, index) in weekDays"
        :key="index"
        class="bg-white dark:bg-gray-800 p-2 font-semibold"
    >
      {{ day.toLocaleUpperCase() }}
    </div>
  </div>

  <!-- Calendar Days -->
  <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 relative hidden">
    <div
        v-for="(date, index) in calendarDates"
        :key="index"
        class="relative bg-white dark:bg-gray-800 p-2 h-40 border"
    >
      <!-- Date Number -->
      <div class="absolute top-1 left-1 text-sm text-gray-500">
        {{ date.getDate() }}
      </div>

      <!-- Leaves -->
      <div
          v-for="(leave, idx) in leavesByDate[formatDateKey(date)]?.leaves || []"
          :key="idx"
      >
        <div
            :class="[
            'p-1 text-xs rounded text-white',
            getLeaveTypeColor(leave.leave_type_id),
          ]"
            :style="getLeaveStyle(leave, date)"
            @click="onLeaveClick(leave)"
        >
          {{ leave.userName }}
        </div>
      </div>

      <!-- Collapsed Leaves Indicator -->
      <div v-if="leavesByDate[formatDateKey(date)]?.collapsedCount > 0">
        <div
            class="mt-1 text-xs text-blue-500 cursor-pointer"
            @mouseenter="showTooltip(date)"
            @mouseleave="hideTooltip"
        >
          +{{ leavesByDate[formatDateKey(date)].collapsedCount }} άτομα
        </div>

        <!-- Tooltip -->
        <div
            v-if="tooltipDate && tooltipDate.getTime() === date.getTime()"
            class="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 rounded shadow-lg"
            style="top: 100%; left: 50%; transform: translateX(-50%);"
        >
          <div
              v-for="leave in leavesByDate[formatDateKey(date)].collapsedLeaves"
              :key="leave.id"
              class="text-xs"
          >
            {{ leave.userName }}, {{ formatDateRange(leave) }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Calendar Grid -->
  <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
    <!-- Calendar Days -->
    <div
        v-for="(date, index) in calendarDates"
        :key="index"
        class="relative bg-white dark:bg-gray-800 p-2 h-40 border"
    >
      <!-- Date Number -->
      <div class="absolute top-1 left-1 text-sm text-gray-500">
        {{ date.getDate() }}
      </div>
    </div>
  </div>

  <!-- Leaves -->
  <div class="leaves-container absolute inset-0">
    <div
        v-for="(leave, idx) in leavesInView"
        :key="idx"
        :class="[
        'p-1 text-xs rounded text-white',
        getLeaveTypeColor(leave.leave_type_id),
      ]"
        :style="getLeaveStyle(leave)"
        @click="onLeaveClick(leave)"
    >
      {{ leave.userName }}
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue';
import { format } from 'date-fns';
import CustomSelect from "~/components/misc/CustomSelect.vue";
import { useCentralStore } from '@/stores/centralStore';

// Weekday Names
const weekDays = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];

// Current Date State
const currentDate = ref(new Date());

// Selected Filters
const selectedName = ref(null);
const selectedDepartment = ref(null);
const selectedLeaveType = ref(null);

// Tooltip state
const tooltipDate = ref(null);

// Access Stores
const centralStore = useCentralStore();
const leavesStore = centralStore.leavesStore;
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

onMounted(() => {
  if (centralStore.initialized) {
    leavesStore.getAllUsers();
  } else {
    // Wait for centralStore to initialize
    const unwatch = watch(
        () => centralStore.initialized,
        (initialized) => {
          if (initialized) {
            leavesStore.getAllUsers();
            unwatch(); // Stop watching after initialization
          }
        },
        { immediate: true }
    );
  }
});

// CustomSelect Options
const departments = computed(() => departmentsStore.departmentsData);
const leaveTypeOptions = computed(() => leavesStore.leavesData.leavesTypes);
const nameOptions = computed(() =>
    userStore.allUsers
);

// Clear Filters Function
const clearFilters = () => {
  selectedName.value = null;
  selectedDepartment.value = null;
  selectedLeaveType.value = null;
};

// Calendar Dates Computation
/*const calendarDates = computed(() => {
  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

  const dates = [];
  const startDate = new Date(startOfMonth);
  startDate.setDate(startOfMonth.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  return dates;
});*/

const calendarMode = ref('monthly');

const calendarDates = computed(() => {
  if (calendarMode.value === 'weekly') {
    // Compute dates for the current week
    const startOfWeek = new Date(currentDate.value);
    startOfWeek.setDate(currentDate.value.getDate() - currentDate.value.getDay());

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(new Date(date));
    }
    return dates;
  } else {
    // Compute dates for the current month
    const startOfMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth(),
        1
    );
    const endOfMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        0
    );

    const dates = [];
    const startDate = new Date(startOfMonth);
    startDate.setDate(startOfMonth.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }
    return dates;
  }
});


// Function to get leaves for a specific date
const getLeavesForDate = date => {
  let leaves = [];

  leavesStore.leavesData.allUsers.forEach(userLeaves => {
    // Skip entries that are not arrays (messages)
    if (!Array.isArray(userLeaves)) {
      return;
    }

    userLeaves.forEach(leave => {
      // Get the user data from userStore.allUsers
      const user = userStore.allUsers.find(u => u.id === leave.user_id);
      if (!user) {
        return; // User not found
      }

      // Apply Name filter
      if (selectedName.value && user.id !== selectedName.value) {
        return;
      }

      // Apply Department filter
      if (selectedDepartment.value && user.department_id !== selectedDepartment.value) {
        return;
      }

      // Apply Leave Type filter
      if (selectedLeaveType.value && leave.leave_type_id !== selectedLeaveType.value) {
        return;
      }

      // Check if date is within the leave period
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);

      if (date >= startDate && date <= endDate) {
        // Calculate leave duration
        const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

        leaves.push({
          ...leave,
          userName: user.name,
          department_id: user.department_id,
          leaveDuration: duration,
        });
      }
    });
  });

  // Prioritize longer leaves
  leaves.sort((a, b) => b.leaveDuration - a.leaveDuration);

  return leaves.slice(0, 4); // Show up to 4 leaves
};

// Get collapsed leaves count
const getCollapsedCount = date => {
  let leaves = [];

  leavesStore.leavesData.allUsers.forEach(userLeaves => {
    if (!Array.isArray(userLeaves)) {
      return;
    }

    userLeaves.forEach(leave => {
      const user = userStore.allUsers.find(u => u.id === leave.user_id);
      if (!user) {
        return;
      }

      // Apply filters
      if (selectedName.value && user.id !== selectedName.value) {
        return;
      }

      if (selectedDepartment.value && user.department_id !== selectedDepartment.value) {
        return;
      }

      if (selectedLeaveType.value && leave.leave_type_id !== selectedLeaveType.value) {
        return;
      }

      // Check date
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);

      if (date >= startDate && date <= endDate) {
        leaves.push(leave);
      }
    });
  });

  // Prioritize longer leaves
  leaves.sort((a, b) => {
    const durationA = new Date(a.end_date) - new Date(a.start_date);
    const durationB = new Date(b.end_date) - new Date(b.start_date);
    return durationB - durationA;
  });

  return Math.max(0, leaves.length - 4);
};

// Helper Functions
const getUserName = userId => {
  const user = userStore.allUsers.find(user => user.id === userId);
  return user ? user.name : 'Unknown';
};

const formatDateRange = leave => {
  return `${format(new Date(leave.start_date), 'dd-MM-yyyy')} μέχρι ${format(
      new Date(leave.end_date),
      'dd-MM-yyyy'
  )}`;
};

// Leave Click Handler (Placeholder)
const onLeaveClick = leave => {
  // Placeholder for future functionality
};

// Function to show and hide tooltip
const showTooltip = date => {
  tooltipDate.value = date;
};

const hideTooltip = () => {
  tooltipDate.value = null;
};

// Function to get the color class for a leave type
const getLeaveTypeColor = id => {
  const colors = {
    1: 'bg-red-500',
    2: 'bg-green-500',
    3: 'bg-blue-500',
    // Add more mappings as needed
  };
  return colors[id] || 'bg-gray-500';
};

// Get Leave Style (for spanning multiple days)
/*const getLeaveStyle = (leave, date) => {
  const startDate = new Date(leave.start_date);
  const endDate = new Date(leave.end_date);

  // Determine the effective start and end dates within the calendar view
  const calendarStartDate = new Date(calendarDates.value[0]);
  const calendarEndDate = new Date(calendarDates.value[calendarDates.value.length - 1]);

  const leaveStart = startDate < calendarStartDate ? calendarStartDate : startDate;
  const leaveEnd = endDate > calendarEndDate ? calendarEndDate : endDate;

  // Calculate the number of days the leave spans from the current date
  if (date.getTime() !== leaveStart.getTime()) {
    // Only render the leave on its start date
    //return { display: 'none' };
  }

  const dayWidth = 100 / 7; // Assuming each day cell is equally divided

  const daysToSpan =
      (leaveEnd - leaveStart) / (1000 * 60 * 60 * 24) + 1; // Number of days to span

  const widthPercentage = daysToSpan * dayWidth;

  return {
    width: `${widthPercentage}%`,
    position: 'absolute',
    top: '2.5rem', // Adjust as needed
    left: '0',
  };
};*/

const getLeaveStyle = (leave) => {
  const calendarStartDate = new Date(calendarDates.value[0]);
  const calendarEndDate = new Date(
      calendarDates.value[calendarDates.value.length - 1]
  );

  const leaveStart = new Date(leave.leaveStart);
  const leaveEnd = new Date(leave.leaveEnd);

  // Compute day offset from the start of the calendar
  const dayOffset = (leaveStart - calendarStartDate) / (1000 * 60 * 60 * 24);

  // Number of days the leave spans
  const daysToSpan =
      (leaveEnd - leaveStart) / (1000 * 60 * 60 * 24) + 1;

  const totalDays = calendarDates.value.length;

  const leftPercentage = (dayOffset / totalDays) * 100;
  const widthPercentage = (daysToSpan / totalDays) * 100;

  // Position leaves vertically based on their assigned row
  const top = `${(leave.row - 1)} * 2rem`; // Adjust as needed

  return {
    width: `${widthPercentage}%`,
    left: `${leftPercentage}%`,
    position: 'absolute',
    top: top,
  };
};

function leavesOverlap(a, b) {
  return a.leaveStart <= b.leaveEnd && b.leaveStart <= a.leaveEnd;
}

// Computed Leave Types Being Displayed
const displayedLeaveTypes = computed(() => {
  // Get unique leave types from the filtered leaves
  const types = new Set(filteredLeaves.value.map(leave => leave.leave_type_id));

  return leavesStore.leavesData.leavesTypes.filter(type => types.has(type.id));
});


/*const filteredLeaves = computed(() => {
  let leaves = [];

  leavesStore.leavesData.allUsers.forEach(userLeaves => {
    // Skip entries that are not arrays (messages)
    if (!Array.isArray(userLeaves)) {
      return;
    }

    userLeaves.forEach(leave => {
      // Get the user data from userStore.allUsers
      const user = userStore.allUsers.find(u => u.id === leave.user_id);
      if (!user) {
        return; // User not found
      }

      // Apply Name filter
      if (selectedName.value && user.id !== selectedName.value) {
        return;
      }

      // Apply Department filter
      if (selectedDepartment.value && user.department_id !== selectedDepartment.value) {
        return;
      }

      // Apply Leave Type filter
      if (selectedLeaveType.value && leave.leave_type_id !== selectedLeaveType.value) {
        return;
      }

      // Calculate leave duration
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

      leaves.push({
        ...leave,
        userName: user.name,
        department_id: user.department_id,
        leaveDuration: duration,
        startDate,
        endDate,
      });
    });
  });

  return leaves;
});*/
// Helper function to format date keys
const formatDateKey = date => date.toISOString().split('T')[0];

// Computed property for leaves by date
const leavesByDate = computed(() => {
  const map = {};

  filteredLeaves.value.forEach(leave => {
    let currentDate = new Date(leave.startDate);
    while (currentDate <= leave.endDate) {
      const dateKey = formatDateKey(currentDate);
      console.log(dateKey);

      if (!map[dateKey]) {
        map[dateKey] = [];
      }

      map[dateKey].push(leave);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // For each date, sort leaves by leaveDuration and compute collapsed count
  const result = {};
  for (const dateKey in map) {
    const leaves = map[dateKey];
    leaves.sort((a, b) => b.leaveDuration - a.leaveDuration);
    result[dateKey] = {
      leaves: leaves.slice(0, 4),
      collapsedCount: Math.max(0, leaves.length - 4),
      collapsedLeaves: leaves.slice(4),
    };
  }

  return result;
});

const leavesInView = computed(() => {
  const adjustedLeaves = [];

  const calendarStartDate = new Date(calendarDates.value[0]);
  const calendarEndDate = new Date(
      calendarDates.value[calendarDates.value.length - 1]
  );

  filteredLeaves.value.forEach((leave) => {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    // Adjust leave dates to fit within the calendar view
    const leaveStart =
        startDate < calendarStartDate ? calendarStartDate : startDate;
    const leaveEnd = endDate > calendarEndDate ? calendarEndDate : endDate;

    // Include leaves that intersect with the calendar view
    if (leaveEnd >= calendarStartDate && leaveStart <= calendarEndDate) {
      adjustedLeaves.push({
        ...leave,
        leaveStart,
        leaveEnd,
      });
    }
  });

  // Assign rows to leaves to prevent overlapping
  const leaves = adjustedLeaves.sort((a, b) => a.leaveStart - b.leaveStart);
  const rows = [];

  leaves.forEach((leave) => {
    let assigned = false;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.some((l) => leavesOverlap(l, leave))) {
        row.push(leave);
        leave.row = i + 1;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      rows.push([leave]);
      leave.row = rows.length;
    }
  });

  return leaves;
});

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
const compareLeavesDates = (dateToCompare) => {
  return calendarDates.value.some(date => formatDateKey(dateToCompare) === formatDateKey(date));
}

const isValidDate = (date) => {
  return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}
const twoDatesEqual = (date1, date2) => {
  let date_1 = date1;
  let date_2 = date2;
  //Check if they are Date objects, if not instantiate one
  if (!isValidDate(date1)) {
    date_1 = new Date(date1);
  }
  if (!isValidDate(date2)) {
    date_2 = new Date(date2);
  }

  return formatDate(date_1) === formatDate(date_2);
}
// First stage date, name, dpt, type filters
const filteredLeaves = computed(() => {
  const returnArray = [];

  //Iterate over array
  leavesStore.leavesData.allUsers.forEach(leave => {
    //For each leave we need to:
    //1.Figure out if it's in the date range currently enabled
    const startDateInCurrentCalendar = compareLeavesDates(new Date(leave.start_date));
    const endDateInCurrentCalendar = compareLeavesDates(new Date(leave.end_date));

    if(!(startDateInCurrentCalendar || endDateInCurrentCalendar)) {
      return;
    }

    // find the user first so we can go over his props
    const userForLeave = userStore.allUsers.filter(user => user.id === leave.user_id)[0];
    //2.Apply name filter over it
    if(selectedName.value && !userForLeave.name.contains(selectedName.value)) {
      return;
    }
    //3.Apply department filter over it
    if(selectedDepartment.value && !(userForLeave.department_id === selectedDepartment.value)) {
      return;
    }
    //4.Apply leave type filter over it
    if(selectedLeaveType.value && !leave.leave_type_id === selectedLeaveType.value) {
      return;
    }
    //5.add to returned leaves it if it's passed all these
    returnArray.push(leave);
  });

  return returnArray;
});


//Second stage - check which leaves belong to which day
const assignedLeaves = computed(() => {
  const returnArray = [];

  //Iterate over days
  calendarDates.value.forEach(day => {
    const leavesThatStartToday = filteredLeaves.value.filter(leave => twoDatesEqual(leave.start_date, day));
    leavesThatStartToday.forEach(leave => returnArray[day.getDate()].push(leave));
  })
  /*filteredLeaves.value.forEach(leave => {

  });*/

  //Sort by duration
  returnArray.forEach(day => {

  })
  const startDate = new Date(leave.start_date);
  const endDate = new Date(leave.end_date);

  // Calculate leave duration
  const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

  return returnArray;
})

const sortFunction = (date1, date2) => {


}

</script>

<style scoped>
/* Additional styles if needed */
</style>
