<template>
    <h3 class="py-4 font-bold text-[16px] text-[#212121] dark:text-gray-100">{{ $t('common.profileInformation') }}</h3>
    <div class="bg-white border rounded-lg hover:shadow-md transition-shadow duration-300 py-[25px] px-[35px] flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
        <div class="flex-1">
            <template v-if="loading">
                <!-- Avatar Skeleton -->
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
                <!-- Avatar -->
                <div class="flex items-center justify-start">
                  <SharedUserAvatar :user="userStore.userInfo" :size="90" />
                </div>
                <!-- Info Details -->
                <div class="pt-[15px] space-y-2 text-[14px] leading-[16px]">
                    <p><span class="font-bold">{{ $t('settings.firstName') }}: </span><span class="text-[#808080] dark:text-gray-300">{{ firstName }}</span></p>
                    <p><span class="font-bold">{{ $t('settings.lastName') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ lastName }}</span></p>
                    <p><span class="font-bold">{{ $t('settings.jobTitle') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ userTitle }}</span></p>
                    <p><span class="font-bold">{{ $t('common.email') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ userEmail }}</span></p>
                    <p><span class="font-bold">{{ $t('common.phone') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ userphone }}</span></p>
                    <p><span class="font-bold">{{ $t('common.internalPhone') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ user_internal_phone }}</span></p>
                    <p><span class="font-bold">{{ $t('settings.group') }}: </span><span class="text-[#808080] dark:text-gray-300"> {{ user_department }}</span></p>
                </div>
            </template>
        </div>
        <div class="info-actions pt-[30px] flex gap-[25px]">
            <button
                @click="openModal"
                v-if="permissionsStore.can('profile_info','modify')"
                class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none">
                {{ $t('common.edit') }}
            </button>
            <button
                @click="redirectPassChange"
                v-if="permissionsStore.can('profile_info','change_password')"
                class="font-bold text-black dark:text-white mx-auto shrink-0 text-[14px] underline hover:text-[#EA021A] hover:dark:text-[#EA021A] transition-colors">
                {{ $t('settings.changePassword') }}
            </button>
        </div>
        <div
            v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            @click.self="closeModal"
        >
          <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative">
            <button
                @click="closeModal"
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <svg class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500"  xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="black">
                <path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <!-- Conditionally render EditUser or DeleteUser component -->
            <EditUser :userId="userId" />
          </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';
import EditUser from '@/components/Settings/EditUser.vue';
import UserAvatar from '@/components/shared/UserAvatar.vue';

const router = useRouter();
const { authStore, userStore, permissionsStore } = useCentralStore();

// Loading state
const loading = computed(() => (userStore && userStore.loading)); // Simulate loading state

const userEmail = computed(() => userStore.userInfo?.email);
const userName = computed(() => userStore.userInfo?.name || '');

// Split the full name into first and last names
const firstName = computed(() => userName.value.split(' ')[0] || '');
const lastName = computed(() => userName.value.split(' ')[1] || '');

// Optionally, create initials for the avatar
const firstNameInitial = computed(() => firstName.value.charAt(0) || '');
const lastNameInitial = computed(() => lastName.value.charAt(0) || '');

const userTitle = computed(() => userStore.userInfo?.profile?.job_title);
const userphone = computed(() => userStore.userInfo?.profile?.phone);
const user_internal_phone = computed(() => userStore.userInfo?.profile?.internal_phone);
const user_department = computed(() => userStore.userInfo?.department?.name);
const userPhoto = computed(() => userStore.userInfo?.profile?.profile_image_base64);
const userId = computed(() => userStore.userInfo?.id);

// Simulate loading duration (replace this with actual data fetch logic)

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
}
const closeModal = () => {
  showModal.value = false;
}
const redirectPassChange = () => {
  router.push('/settings#security');
}
</script>

<script>
export default {
    name: 'ProfileInfo'
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
