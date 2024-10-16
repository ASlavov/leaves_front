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
          <div class="w-[132px] h-[132px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2">
            <img v-if="userPhoto" class="inline-block size-[132px] rounded-full"
                 :src="userPhoto"
                 alt="Avatar">
            <span v-else class="text-white font-bold">
                            {{ firstNameInitial }}{{ lastNameInitial }}
                        </span>
          </div>
          <!-- Info Details -->
          <div class="grid grid-cols-2 col-span-10 gap-y-[15px] gap-x-[25px]">
            <!-- First Name -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Όνομα</label>
              <input v-model="formFirstName" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Όνομα">
            </div>
            <!-- Last Name -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Επώνυμο</label>
              <input v-model="formLastName" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Επώνυμο">
            </div>
            <!-- Title -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Τίτλος</label>
              <input v-model="formTitle" type="text" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Τίτλος">
            </div>
            <!-- Email -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Email</label>
              <input v-model="formEmail" type="email" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Email">
            </div>
            <!-- Phone -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Κινητό</label>
              <input v-model="formPhone"
                     pattern="[0-9]{10}"
                     type="tel" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Κινητό">
            </div>
            <!-- Internal Phone -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Εσωτ. τηλέφωνο</label>
              <input v-model="formInternalPhone" type="number" class="py-3 px-4 block w-full border-gray-200  border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Εσωτ. τηλέφωνο">
            </div>
            <div class="max-w-sm">
              <CustomSelect
                  v-model="formSelectedDepartmentId"
                  :options="departments"
                  label="Γκρουπ"
                  placeholder="Επιλέξτε Γκρουπ"
                  selectId="department-select"
              />
            </div>
            <div
                v-if="permissionsStore.can('all_users','modify')"
                class="max-w-sm">
              <CustomSelect
                  v-model="formRole"
                  :options="roles"
                  label="Ρόλος"
                  placeholder="Επιλέξτε Ρόλο χρήστη"
                  selectId="role-select"
              />
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

const router = useRouter();
const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;

// Loading state
const loading = computed(() => userStore && userStore.loading);

const props = defineProps({
  userId: {
    type: [Number, String],
    required: false,
  },
});


/*onMounted(async () => {
  await fetchUserData();
});

watch(() => props.userId, async () => {
    await fetchUserData();
  },
  { immediate: true }
);*/

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
    () => props.userId,
    () => {
      if (centralStore.initialized) {
        fetchUserData();
      }
    }
);

async function fetchUserData() {

  try {
    // Fetch the user data for the given userId
    if(props.userId) {
      const newUserInfo = await userStore.loadUserProfileById(props.userId);
      if (newUserInfo) {
        // Initialize form fields
        initializeFormFields(newUserInfo);
      }
    }
    else {

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
const formFirstName = ref('');
const formLastName = ref('');
const formEmail = ref('');
const formTitle = ref('');
const formPhone = ref('');
const formRole = ref('');
const formInternalPhone = ref('');
const formTitleDescription = ref('');
const formPhoto = ref('');


function initializeFormFields(userInfo) {
  const userName = userInfo.name || '';
  const nameParts = userName.split(' ');
  formFirstName.value = nameParts[0] || '';
  formLastName.value = nameParts.slice(1).join(' ') || '';
  formEmail.value = userInfo.email || '';
  formTitle.value = userInfo.profile?.job_title || '';
  formPhone.value = userInfo.profile?.phone || '';
  /* TODO: Roles have multiple values?! */
  formRole.value = userInfo?.roles[0].id || '2';
  formInternalPhone.value = userInfo.profile?.internal_phone || '';
  formTitleDescription.value = userInfo.profile?.title_description || '';

  formSelectedDepartmentId.value = String(userInfo.department?.id || '');
  formPhoto.value = userInfo.profile?.userPhoto || null;
}

// Reactive variable for selected department IDs
const formSelectedDepartmentIds = ref([]);

// List of departments
const departments = computed(() => departmentsStore.departmentsData);

// Fetch departments on component mount
const formSelectedDepartmentId = ref(null);

const roles = computed(() => {
  const flatMapper = userStore.allUsers.flatMap(user => user?.roles);
  return Object.values(flatMapper.reduce((accumulator, currentItem) => {
    // This will overwrite earlier entries with the same id
    accumulator[currentItem.id] = currentItem;
    return accumulator;
  }, {}));
});
// Initialize form fields when userStore.userInfo is available
/*watch(
    () => userStore.userInfo,
    (newUserInfo) => {
      if (newUserInfo) {
        // Initialize other form fields
        const userName = newUserInfo.name || '';
        const nameParts = userName.split(' ');
        formFirstName.value = nameParts[0] || '';
        formLastName.value = nameParts.slice(1).join(' ') || '';
        formEmail.value = newUserInfo.email || '';
        formTitle.value = newUserInfo.profile?.job_title || '';
        formPhone.value = newUserInfo.profile?.phone || '';
        formInternalPhone.value = newUserInfo.profile?.internal_phone || '';
        formTitleDescription.value = newUserInfo.profile?.title_description || '';

        // Initialize selected department IDs from user's departments
        formSelectedDepartmentId.value = Number(newUserInfo.department?.id) || null;
      }
    },
    { immediate: true }
);*/


// Computed properties for avatar initials
const firstNameInitial = computed(() => formFirstName.value.charAt(0) || '');
const lastNameInitial = computed(() => formLastName.value.charAt(0) || '');
const userPhoto = computed(() => formPhoto.value);

// Submit form method
const submitForm = async () => {
  const userId = props.userId;
  const userName = `${formFirstName.value} ${formLastName.value}`.trim();
  const userEmail = formEmail.value;
  const userDepartment = formSelectedDepartmentId.value; // Selected department IDs
  const userRole = formRole.value; // TODO CHANGE THE DEFAULT
  const userPhone = parseInt(formPhone.value);
  const userInternalPhone = formInternalPhone.value;
  const userTitle = formTitle.value;
  const userTitleDescription = formTitleDescription.value || formTitle.value;

  /*const forAlert = `
  'userId:', ${userId},
  'userName:', ${userName},
  'userEmail:', ${userEmail},
  'userDepartment:', ${userDepartment},
  'userRole:', ${userRole},
  'userPhone:', ${userPhone},
  'userInternalPhone:', ${userInternalPhone},
  'userTitle:', ${userTitle},
  'userTitleDescription:', ${userTitleDescription},
  `;
  alert(forAlert);*/

  // Uncomment and adjust when ready to submit
  try {
    await userStore.editUser(
      userId,
      userName,
      userEmail,
      userDepartment,
      userRole,
      userPhone,
      userInternalPhone,
      userTitle,
      userTitleDescription
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
