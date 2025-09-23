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
      <div class="flex flex-col col-span-2 gap-2 lg:gap-0 lg:grid grid-rows-2 grid-cols-1 lg:grid-rows-1 lg:grid-cols-2">
      <div
          v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
          class="text-black dark:text-white font-bold flex items-center gap-2">
        Αιτήματα άδειας <span class="text-[#EA021A]">({{filteredLeaves.length}})</span>
      </div>
      <div v-else>
        Άδειες έτους
      </div>
      <!-- Filters Section -->
      <div v-if="!props.isSmallComponent" class="ml-4 grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4 w-full lg:max-w-3xl items-end lg:justify-self-end lg:self-end">
        <!-- Requester Name Filter -->
        <FilterInput
            v-model="filters.requesterName"
            type="text"
            placeholder="Όνομα"
            class="w-full"
        />

        <!-- Group Filter -->
        <FilterInput
            v-model="filters.group"
            type="text"
            placeholder="Γκρουπ"
        />

        <!-- Year Filter -->
        <FilterInput
            v-model="filters.year"
            type="CustomSelect"
            :options="years"
            placeholder="Έτος"

            class="-ml-4 mr-4 lg:mr-0"
        />
      </div>
      <div class="lg:justify-self-end lg:self-end" v-else>
        <NuxtLink to="/yearly-leaves" class="text-[#EA021A] dark:text-[#FF021A] underline block">
          Όλα τα αιτήματα άδειας
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
            class="grid grid-rows-6 lg:grid-rows-none grid-cols-[50px,1fr] gap-y-1 gap-x-[20px] lg:gap-y-0 items-center justify-items-start w-full lg:justify-items-stretch border p-4 rounded-lg bg-white dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <!-- Column 1: Date from - Date to on top, leave type on bottom -->
          <div class="lg:col-span-2 lg:gap-x-2 lg:justify-self-start contents lg:grid grid-cols-4 grid-rows-2 justify-start items-center">
            <div class="row-span-6 lg:col-span-1 lg:row-span-2 self-start justify-self-end">
              <img src="https://placehold.co/50x50" alt="Icon" class="rounded-md">
            </div>
            <div class="text-sm text-gray-500 lg:col-span-3 lg:row-span-1">
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
                   placeholder="Συμπληρώστε εαν έχετε κάποιο σχόλιο"
                   v-if="leave.status === 'pending'"
                   v-model="leaveComments[leave.leaveId]"
            />
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
                Ακύρωση
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
import FilterInput from "~/components/misc/FilterInput.vue";

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
  const returnYears = [];

  allLeaves.value.forEach((leave) => {

    const startDate  = new Date(leave?.start_date).getFullYear();
    const endDate = new Date(leave?.end_date).getFullYear();

    if(startDate) {
      returnYears[startDate] = {
        id: `${startDate}`,
        name: `${startDate}`,
      };
    }
    if(endDate) {
      returnYears[endDate] = {
        id: `${endDate}`,
        name: `${endDate}`,
      };
    }
  });

  if(returnYears.length) {
    return [{
      id: `${currentYear}`,
      name: `${currentYear}`,
    }];
  }

  return returnYears;
});

const leaveClass = {
  pending:'text-[#E59926]',
  canceled:'text-[#FF455F]',
  approved:'text-[#16DBAA]',
  denied:'text-[#FF455F]',
};

onMounted(async () => {
  try {
    await leavesStore.getAllUsers(); // Fetch leavesStore.leavesData.allUsers
    const usersData = leavesStore.leavesData.allUsers;

    // Build allLeaves array
    allLeaves.value = [];
    usersData.forEach(user => {
      const userLeaves = user.leaves || [];
      userLeaves.forEach(leave => {
        allLeaves.value.push({
          ...leave,
          user, // include user data
          class: leaveClass[leave.status] ?? '',
        });
      });
    });
  } catch (error) {
    //console.error('Error fetching leaves:', error);
    useNuxtApp().$toast.error('Δεν μπορέσαμε να απορρίψουμε την άδεια!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } finally {
    loading.value = false; // Set loading to false when done
  }
});

// Filters
const filters = ref({
  requesterName: '',
  group: '',
  year: currentYear,
});

// Computed property for filtered leaves
const filteredLeaves = computed(() => {
  const returnArray = allLeaves.value
      .filter(leave => {
        // Filter by requester's name
        const requesterNameMatch = filters.value.requesterName
            ? leave.user.name.toLowerCase().includes(filters.value.requesterName.toLowerCase())
            : true;

        // Filter by group (assuming group is user.department_id)
        const groupMatch = filters.value.group
            ? leave.user.department_id && leave.user.department_id.toString().includes(filters.value.group)
            : true;

        // Filter by year
        const yearMatch = filters.value.year
            ? new Date(leave.start_date).getFullYear() === parseInt(filters.value.year)
            : true;

        const requesterMatchesUserNotAdmin = (permissionsStore.isAdmin() || userStore.userId !== leave.user_id);

        return requesterNameMatch && groupMatch && yearMatch && requesterMatchesUserNotAdmin;
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
    await leavesStore.approveLeave(userId, leaveId, 'approved', (leaveComments[leaveId] ?? ''));
    // Refresh data
    await refreshLeaves();
    useNuxtApp().$toast.success('Η αίτηση άδειας εγκρήθηκε επιτυχώς!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να εγκρίνουμε την άδεια!!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};

const declineLeave = async (leaveId, userId) => {
  try {
    await leavesStore.declineLeave(userId, leaveId, 'rejected', (leaveComments[leaveId] ?? ''));
    // Refresh data
    await refreshLeaves();
    useNuxtApp().$toast.success('Η αίτηση άδειας απορρίφθηκε επιτυχώς!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να απορρίψουμε την άδεια!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};

const cancelLeave = async (leaveId) => {
  try {
    await leavesStore.cancelLeave(leaveId);
    // Refresh data
    await refreshLeaves();
    useNuxtApp().$toast.success('Η αίτηση άδειας ακυρώθηκε επιτυχώς!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να ακυρώσουμε την άδεια!', {
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
        });
      });
    });
  } catch (error) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να φέρουμε τις άδειες!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
    //console.error('Error refreshing leaves:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('el-GR', options);
};

const getLeaveTypeName = (leaveTypeId) => {
  const leaveType = leavesStore.leavesData.leavesTypes.find(type => type.id === leaveTypeId);
  return leaveType ? leaveType.name : 'Άγνωστος Τύπος';
};

const getLeaveStatusLabel = (status) => {
  // Map status codes to labels (adjust as needed)
  const statusLabels = {
    'pending': 'Σε Εκκρεμότητα',
    'approved': 'Εγκεκριμένη',
    'declined': 'Απορρίφθηκε',
    'cancelled': 'Ακυρώθηκε',
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
