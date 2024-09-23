<template>
  <div class="bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
    <div class="flex-1">
      <template v-if="loading">
        <!-- Loading Skeletons -->
        <div class="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
        <!-- Info Details Skeleton -->
        <div class="pt-4 space-y-2">
          <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></p>
          <p class="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></p>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-12 pt-[30px]">
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
              <input v-model="formPhone" type="tel" class="py-3 px-4 block w-full border-gray-200 border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Κινητό">
            </div>
            <!-- Internal Phone -->
            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Εσωτ. τηλέφωνο</label>
              <input v-model="formInternalPhone" type="number" class="py-3 px-4 block w-full border-gray-200  border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Εσωτ. τηλέφωνο">
            </div>
            <!-- Department -->
<!--            <div class="max-w-sm">
              <label class="block text-sm font-bold mb-2 text-black dark:text-white">Γκρουπ</label>
              <input v-model="formDepartment" type="text" class="py-3 px-4 block w-full border-gray-200  border rounded-lg transition-all hover:border-gray-400 dark:hover:border-neutral-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400" placeholder="Γκρουπ">
            </div>-->
            <select multiple="" data-hs-select='{
  "placeholder": "Select option...",
  "dropdownClasses": "mt-2 z-50 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700",
  "optionClasses": "py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 hs-select-disabled:pointer-events-none hs-select-disabled:opacity-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800",
  "mode": "tags",
  "wrapperClasses": "relative ps-0.5 pe-9 min-h-[46px] flex items-center flex-wrap text-nowrap w-full border border-gray-200 rounded-lg text-start text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400",
  "tagsItemTemplate": "<div class=\"flex flex-nowrap items-center relative z-10 bg-white border border-gray-200 rounded-full p-1 m-1 dark:bg-neutral-900 dark:border-neutral-700 \"><div class=\"size-6 me-1\" data-icon></div><div class=\"whitespace-nowrap text-gray-800 dark:text-neutral-200 \" data-title></div><div class=\"inline-flex shrink-0 justify-center items-center size-5 ms-2 rounded-full text-gray-800 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm dark:bg-neutral-700/50 dark:hover:bg-neutral-700 dark:text-neutral-400 cursor-pointer\" data-remove><svg class=\"shrink-0 size-3\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/></svg></div></div>",
  "tagsInputClasses": "py-3 px-2 rounded-lg order-1 text-sm outline-none dark:bg-neutral-900 dark:placeholder-neutral-500 dark:text-neutral-400",
  "optionTemplate": "<div class=\"flex items-center\"><div class=\"size-8 me-2\" data-icon></div><div><div class=\"text-sm font-semibold text-gray-800 dark:text-neutral-200 \" data-title></div><div class=\"text-xs text-gray-500 dark:text-neutral-500 \" data-description></div></div><div class=\"ms-auto\"><span class=\"hidden hs-selected:block\"><svg class=\"shrink-0 size-4 text-blue-600\" xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" viewBox=\"0 0 16 16\"><path d=\"M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z\"/></svg></span></div></div>",
  "extraMarkup": "<div class=\"absolute top-1/2 end-3 -translate-y-1/2\"><svg class=\"shrink-0 size-3.5 text-gray-500 dark:text-neutral-500 \" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m7 15 5 5 5-5\"/><path d=\"m7 9 5-5 5 5\"/></svg></div>"
}' class="hidden">
              <option value="">Choose</option>
              <option v-for="department in formDepartment" :data-hs-select-option="JSON.stringify({ description: department.name })" :key="department.id" :value="department.id">{{department.name}}
              </option>
            </select>
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
import { ref, computed, watch } from "vue";
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';

const router = useRouter();
const { authStore, userStore, departmentsStore } = useCentralStore();

// Loading state
const loading = computed(() => userStore && userStore.loading);

// Reactive variables for form fields
const formFirstName = ref('');
const formLastName = ref('');
const formEmail = ref('');
const formTitle = ref('');
const formPhone = ref('');
const formInternalPhone = ref('');
const formDepartment = ref('');
const formTitleDescription = ref('');

// Initialize form fields when userStore.userInfo is available
watch(() => userStore.userInfo, (newUserInfo) => {
  if (newUserInfo) {
    const userName = newUserInfo.name || '';
    formFirstName.value = userName.split(' ')[0] || '';
    formLastName.value = userName.split(' ')[1] || '';
    formEmail.value = newUserInfo.email || '';
    formTitle.value = newUserInfo.profile?.job_title || '';
    formPhone.value = newUserInfo.profile?.phone || '';
    formInternalPhone.value = newUserInfo.profile?.internal_phone || '';
    formTitleDescription.value = newUserInfo.profile?.title_description || '';
  }
}, { immediate: true });
watch(() => departmentsStore.departmentsData, (departmentData) => {
  if (departmentData) {
    formDepartment.value = departmentData ?? '';
  }
}, { immediate: true });

// Computed properties for avatar initials
const firstNameInitial = computed(() => formFirstName.value.charAt(0) || '');
const lastNameInitial = computed(() => formLastName.value.charAt(0) || '');
const userPhoto = computed(() => userStore.userInfo?.profile?.userPhoto);

// Submit form method
const submitForm = async () => {
  const userId = userStore.userId;
  const userName = `${formFirstName.value} ${formLastName.value}`.trim();
  const userEmail = formEmail.value;
  const userDepartment = formDepartment.value;
  const userRole = userStore.userInfo?.role; // Assuming role is not editable by the user
  const userPhone = formPhone.value;
  const userInternalPhone = formInternalPhone.value;
  const userTitle = formTitle.value;
  const userTitleDescription = formTitleDescription.value || formTitle.value;

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
  } catch (error) {
    // Handle errors, e.g., show an error message
    console.error('Error updating user:', error);
  }
};
</script>

<style scoped>
/* Additional styles if needed */
</style>
