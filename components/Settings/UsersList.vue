<template>
  <template v-if="loading">

    <!-- Loading Skeletons -->
    <div class="grid grid-cols-12 pt-[30px] max-w-[947px]">
      <div class="w-12 h-12 bg-gray-200 rounded-full col-span-2 mr-4 animate-pulse"></div>
      <!-- Info Details Skeleton -->
      <div class="pt-4 space-y-2 col-span-10 animate-pulse">
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
        <p class="h-6 bg-gray-100 rounded w-full animate-pulse dark:bg-neutral-600"></p>
        <p class="h-6 bg-gray-200 rounded w-full animate-pulse dark:bg-neutral-700"></p>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-col gap-[10px]">
      <div class="grid grid-cols-2 lg:grid-cols-12 items-center pl-[20px] pr-[30px] py-[10px] font-bold">
        <div class="col-span-1">

        </div>
        <div class="col-span-2 text-black dark:text-white">
          Όνομα
        </div>
        <div class="col-span-2 text-black dark:text-white">
          Επώνυμο
        </div>
        <div class="col-span-2 text-black dark:text-white">
          Τίτλος
        </div>
        <div class="col-span-2 text-black dark:text-white">
          Γκρούπ
        </div>
      </div>
      <div v-for="user in allUsers" :key="user.id" class="grid grid-cols-2 lg:grid-cols-12 items-center border border-[#DFEAF2] rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-600 text-[#808080]">
        <div class="w-[50px] h-[50px] bg-gray-300 rounded-full mr-4 flex items-center justify-center col-span-1 ">
          <img v-if="user.profile.profile_image" :src="user.profile.profile_image" />
          <span v-else class="text-white font-bold">
              {{ (user.name.split(' ')[0])?.charAt(0) || '' }}{{ (user.name.split(' ')[1])?.charAt(0) || '' }}
          </span>
        </div>
        <div class="col-span-2">
          {{ user.name.split(' ')[0] || '' }}
        </div>
        <div class="col-span-2">
          {{ user.name.split(' ')[1] || '' }}
        </div>
        <div class="col-span-2">
          {{ user?.profile?.job_title || '' }}
        </div>
        <div class="col-span-2">
          {{ user?.department?.name || '' }}
        </div>
        <div class="col-span-3 justify-self-end flex gap-[25px] items-center">
          <a @click="editUser(user.id)" class="cursor-pointer text-[#EA021A] font-bold underline">Επεξεργασία Προφίλ</a>
          <svg @click="deleteUser(user.id)" class="cursor-pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
            <path d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z" :fill="theme === 'light' ? 'black' : 'white'"/>
          </svg>
        </div>
      </div>
    </div>
  </template>

  <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="closeModal"
  >
    <div class="bg-white p-6 rounded-lg w-full max-w-[900px] relative">
      <button
          @click="closeModal"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <!-- Conditionally render EditUser or DeleteUser component -->
      <component :is="modalComponent" :userId="selectedUserId" />
    </div>
  </div>

</template>

<script setup>
import {useCentralStore} from "~/stores/centralStore.js";
import {computed, ref, watch} from "vue";

import EditUser from '@/components/Settings/EditUser.vue';
//import DeleteUser from '@/components/Settings/DeleteUser.vue';

const {
  userStore,
  departmentsStore,
} = useCentralStore();


const showModal = ref(false);
const modalType = ref(''); // 'edit' or 'delete'
const selectedUserId = ref(null);

//const theme = computed(() => useNuxtApp().vueApp.config.globalProperties.$colorMode?.value || 'light');
const theme = computed(() => {
  const { $colorMode } = useNuxtApp();
  return $colorMode?.value || 'light';
});
const loading = computed(() => userStore.loading);
const allUsers = ref([]);
watch(
    () => userStore.allUsers,
    (users) => {
      console.log('users:', users)
      allUsers.value = users;
    },{
      immediate: true,
    }
);

const editUser = (userId) => {
  selectedUserId.value = userId;
  modalType.value = 'edit';
  showModal.value = true;
};

const deleteUser = (userId) => {
  selectedUserId.value = userId;
  modalType.value = 'delete';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedUserId.value = null;
  modalType.value = '';
};

const modalComponent = computed(() => {
  return modalType.value === 'edit' ? EditUser : DeleteUser;
});

</script>
<script>
</script>