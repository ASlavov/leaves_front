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
            <!-- Department -->

<!--            <div class="max-w-sm">
              <select
                  v-model="formSelectedDepartmentIds"
                  data-hs-select='{
    "placeholder": "Select option...",
    "toggleTag": "<button type=\"button\" aria-expanded=\"false\"></button>",
    "toggleClasses": "hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 relative py-3 ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 rounded-lg text-start text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-neutral-600",
    "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700",
    "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800",
    "optionTemplate": "<div class=\"flex justify-between items-center w-full\"><span data-title></span><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-3.5 text-blue-600 dark:text-blue-500 \" xmlns=\"http:.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg></span></div>",
    "extraMarkup": "<div class=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500 dark:text-neutral-500 \" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>"
  }' class="hidden">
                <option value="">Choose</option>
                <option
                    v-for="department in departments"
                    :key="department.id"
                    :value="department.id"
                    :data-hs-select-option="JSON.stringify({ description: department.name })"
                >
                  {{ department.name }}
                </option>
              </select>
            </div>-->
            <div class="max-w-sm">
              <CustomSelect
                  v-model="formSelectedDepartmentId"
                  :options="departments"
                  label="Γκρουπ"
                  placeholder="Επιλέξτε Γκρουπ"
                  selectId="department-select"
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
