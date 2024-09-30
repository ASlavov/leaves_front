<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">

        <!-- Loading Skeletons -->
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
          <!-- Info Details Skeleton -->
          <div class="pt-4 space-y-2 col-span-10 animate-pulse">
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse dark:bg-neutral-700"></p>
            <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></p>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
          <!-- Avatar -->

          <!-- Info Details -->
          <div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]">
            <!-- Group Name -->
            <div class="w-full">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Όνομα Γκρουπ</label>
              <input v-model="formGroupName" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Όνομα">
            </div>
            <!-- Head -->
            <div class="w-full">
<!--              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Υπεύθυνος Γκρουπ</label>-->
              <CustomSelect
                  v-model="formSelectedDepartmentHead"
                  :options="availableFormUsers"
                  label="Υπεύθυνος Γκρουπ"
                  placeholder="Επιλέξτε Υπεύθυνο"
                  selectId="department-head-select"
              />
            </div>

            <div class="col-span-2">
              <!-- Select -->
              <div class="block text-sm font-bold mb-2 text-black dark:text-white">
                Χρήστες
              </div>
              <CustomMultiSelect
                  v-model="formUsers"
                  :options="allUsers"
                  placeholder="Επιλέξτε χρήστες"
              />
              <!-- End Select -->
            </div>

            <!-- Save Changes Button -->
            <div class="info-actions pt-10 pb-5 flex gap-4 col-span-2">
              <button @click="submitForm"
                      class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Αποθήκευση Αλλαγών
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';
import CustomSelect from '@/components/misc/CustomSelect.vue';
import CustomMultiSelect from '@/components/misc/CustomMultiSelect.vue';

const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;

// Loading state
const loading = computed(() => userStore && userStore.loading);

const props = defineProps({
  groupId: {
    type: [Number, String],
    required: true,
  },
});


// Fetch user data when component is mounted or when userId changes
onMounted(() => {
  console.log(centralStore);
  if (centralStore.initialized) {
    fetchUserData();
  } else {
    // Wait for centralStore to initialize
    const unwatch = watch(
        () => centralStore.initialized,
        (initialized) => {
          if (initialized) {
            fetchUserData();
            unwatch(); // Stop watching after initialization
          }
        },
        { immediate: true }
    );
  }
});

// Watch for changes in userId
watch(
    () => props.groupId,
    () => {
      if (centralStore.initialized) {
        fetchUserData();
      }
    }
);
// Reactive variable to store all users
const allUsers = ref([]);

const getIconHtml = (user, firstName, lastName) => {
  const photo = user?.profile?.profile_image || null;
  if (photo) {
    // User has a photo
    return `
          <div class='w-[25px] h-[25px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2'>
            <img class='inline-block size-[25px] rounded-full' src='${photo}' alt='Avatar'>
          </div>
        `;
  } else {
    // User doesn't have a photo, show initials
    const firstNameInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastNameInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `
          <div class='w-[25px] h-[25px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2'>
            <span class='text-white text-[11px] font-bold'>
              ${firstNameInitial}${lastNameInitial}
            </span>
          </div>
        `;
  }
}
// Process users to extract firstName and lastName
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
          icon: getIconHtml(user, firstName, lastName),
        };
      });
    },
    { immediate: true }
);
async function fetchUserData() {

  try {
    // Fetch the user data for the given userId

    const dptData = await departmentsStore.loadGroupById(props.groupId);
    if (dptData) {
      // Initialize form fields
      initializeFormFields(dptData);

    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    useNuxtApp().$toast.error('Error fetching user data.', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
}


// Reactive variables for form fields
const formGroupName = ref('');
const formSelectedDepartmentHead = ref('');
const formUsers = ref([]);
const formAllUsers = ref([]);
/*const headCandidates = computed(() => {
  return [
      ...formUsers.value,
  ];
});*/




function initializeFormFields(dptData) {
  formGroupName.value = dptData.name;
  formSelectedDepartmentHead.value = dptData?.head || '';
  formUsers.value = allUsers.value
      .filter(user => user?.department_id === dptData.id)
      .map(user => user.id); // Set to array of IDs
  formAllUsers.value = allUsers.value;
}

const availableFormUsers = computed(() => {
  if (formUsers.value.length) {
    return allUsers.value.filter((user) => formUsers.value.includes(user.id));
  }
  return [];
});

// List of departments
const departments = computed(() => departmentsStore.departmentsData);


// Submit form method
const submitForm = async () => {
  const groupId = props.groupId;
  const groupName = formGroupName.value;
  const head = formSelectedDepartmentHead.value;
  const members = formUsers.value;

  // Uncomment and adjust when ready to submit
  try {
    /*await departmentsStore.editDepartment(
        groupId,
        groupName,
        head,
        members
    );*/

    console.log(
      "GroupId: ", groupId,
      "GroupName: ", groupName,
      "Head ID: ", head,
      "Members List:", members
    );

    // Optionally, show a success message or redirect the user
    useNuxtApp().$toast.success('Το προφίλ του χρήστη ενημερώθηκε επιτυχως!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  } catch (error) {
    useNuxtApp().$toast.error('Δεν μπορέσαμε να αποθηκεύσουμε το προφίλ του χρήστη!', {
      position: "bottom-right",
      autoClose: 5000, // Close automatically after 5 seconds
    });
  }
};
</script>


<style scoped>
/* Additional styles if needed */
</style>
