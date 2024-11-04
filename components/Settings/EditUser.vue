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
          <div class="relative w-[132px] h-[132px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-2">
            <img @click="triggerFileSelect"
                v-if="userPhoto" class="cursor-pointer inline-block w-[132px] h-[132px] rounded-full object-cover"
                 :src="userPhoto"
                 alt="Avatar">
            <span v-else class="text-white font-bold">
              {{ firstNameInitial }}{{ lastNameInitial }}
            </span>
            <!-- Pencil Button -->
            <button @click="triggerFileSelect" class="absolute bottom-1 right-1 transform bg-[#EA021A] rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <g clip-path="url(#clip0_811_2144)">
                  <path d="M14.5872 4.16284L13.2366 5.51343C13.0989 5.65112 12.8763 5.65112 12.7386 5.51343L9.48661 2.26147C9.34892 2.12378 9.34892 1.90112 9.48661 1.76343L10.8372 0.412842C11.385 -0.13501 12.2757 -0.13501 12.8265 0.412842L14.5872 2.17358C15.138 2.72144 15.138 3.61206 14.5872 4.16284ZM8.32646 2.92358L0.633095 10.6169L0.0120011 14.1765C-0.0729598 14.657 0.345986 15.073 0.826454 14.991L4.38602 14.3669L12.0794 6.67358C12.2171 6.53589 12.2171 6.31323 12.0794 6.17554L8.82743 2.92358C8.68681 2.78589 8.46415 2.78589 8.32646 2.92358ZM3.63602 9.95776C3.47489 9.79663 3.47489 9.53882 3.63602 9.37769L8.14774 4.86597C8.30888 4.70483 8.56669 4.70483 8.72782 4.86597C8.88895 5.0271 8.88895 5.28491 8.72782 5.44605L4.2161 9.95776C4.05497 10.1189 3.79716 10.1189 3.63602 9.95776ZM2.57841 12.4216H3.98466V13.4851L2.09501 13.8162L1.18388 12.905L1.51493 11.0154H2.57841V12.4216Z" fill="white"/>
                </g>
                <defs>
                  <clipPath id="clip0_811_2144">
                    <rect width="15" height="15" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
            <!-- Hidden File Input -->
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/png" class="hidden">
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
const { $toast } = useNuxtApp();

// Loading state
const loading = computed(() => userStore && userStore.loading);

const props = defineProps({
  userId: {
    type: [Number, String, null],
    required: false,
  },
});

// File input reference
const fileInput = ref(null);

// Reactive variables for form fields
const formFirstName = ref('');
const formLastName = ref('');
const formEmail = ref('');
const formImage = ref('');
const formTitle = ref('');
const formPhone = ref('');
const formRole = ref('');
const formInternalPhone = ref('');
const formTitleDescription = ref('');
const formPhoto = ref('');

// Computed properties for avatar initials
const firstNameInitial = computed(() => formFirstName.value.charAt(0) || '');
const lastNameInitial = computed(() => formLastName.value.charAt(0) || '');
const userPhoto = computed(() => formPhoto.value);

// Methods
const triggerFileSelect = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      formImage.value = base64Data; // Update the formImage for submission
      formPhoto.value = base64Data; // Update the preview
    };
    reader.readAsDataURL(file);
  } else {
    $toast.error('Παρακαλώ επιλέξτε μια εικόνα τύπου JPEG ή PNG.', {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};

// Fetch user data when component is mounted or when userId changes
onMounted(() => {
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
    if (props.userId) {
      const newUserInfo = await userStore.loadUserProfileById(props.userId);
      if (newUserInfo) {
        // Initialize form fields
        initializeFormFields(newUserInfo);
      }
    } else {
      // Handle case when userId is not provided
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    $toast.error('Error fetching user data.', {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
}

function initializeFormFields(userInfo) {
  const userName = userInfo.name || '';
  const nameParts = userName.split(' ');
  formFirstName.value = nameParts[0] || '';
  formLastName.value = nameParts.slice(1).join(' ') || '';
  formEmail.value = userInfo.email || '';
  formImage.value = '';
  formTitle.value = userInfo.profile?.job_title || '';
  formPhone.value = userInfo.profile?.phone || '';
  formRole.value = userInfo?.roles[0].id || '2';
  formInternalPhone.value = userInfo.profile?.internal_phone || '';
  formTitleDescription.value = userInfo.profile?.title_description || '';
  formSelectedDepartmentId.value = String(userInfo.department?.id || '');
  formPhoto.value = userInfo.profile?.profile_image || null;
}

// Reactive variable for selected department ID
const formSelectedDepartmentId = ref(null);

// List of departments
const departments = computed(() => departmentsStore.departmentsData);

// List of roles
const roles = computed(() => {
  const flatMapper = userStore.allUsers.flatMap(user => user?.roles);
  return Object.values(flatMapper.reduce((accumulator, currentItem) => {
    accumulator[currentItem.id] = currentItem;
    return accumulator;
  }, {}));
});

// Submit form method
const submitForm = async () => {
  const userId = props.userId;
  const userName = `${formFirstName.value} ${formLastName.value}`.trim();
  const userEmail = formEmail.value;
  const userDepartment = formSelectedDepartmentId.value;
  const userRole = formRole.value;
  const userPhone = parseInt(formPhone.value);
  const userInternalPhone = formInternalPhone.value;
  const userTitle = formTitle.value;
  const userTitleDescription = formTitleDescription.value || formTitle.value;
  const userImage = formImage.value;

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
        userTitleDescription,
        userImage
    );
    $toast.success('Το προφίλ του χρήστη ενημερώθηκε επιτυχώς!', {
      position: "bottom-right",
      autoClose: 5000,
    });
  } catch (error) {
    $toast.error('Δεν μπορέσαμε να αποθηκεύσουμε το προφίλ του χρήστη!', {
      position: "bottom-right",
      autoClose: 5000,
    });
  }
};
</script>



<style scoped>
/* Additional styles if needed */
</style>
