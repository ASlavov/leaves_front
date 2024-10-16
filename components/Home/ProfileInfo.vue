<template>
    <h3 class="py-4 font-semibold text-lg dark:text-gray-100">Πληροφορίες</h3>
    <div class="bg-white border rounded-lg hover:shadow-md transition-shadow duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100">
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
                <div class="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                    <span class="text-white font-bold">
                        {{ firstNameInitial }}{{ lastNameInitial }}
                    </span>
                </div>
                <!-- Info Details -->
                <div class="pt-4 space-y-2">
                    <p><span class="font-bold">Όνομα: </span><span class="text-gray-500 dark:text-gray-100">{{ firstName }}</span></p>
                    <p><span class="font-bold">Επώνυμο: </span><span class="text-gray-500 dark:text-gray-100"> {{ lastName }}</span></p>
                    <p><span class="font-bold">Τίτλος: </span><span class="text-gray-500 dark:text-gray-100"> {{ userTitle }}</span></p>
                    <p><span class="font-bold">Email: </span><span class="text-gray-500 dark:text-gray-100"> {{ userEmail }}</span></p>
                    <p><span class="font-bold">Κινητό: </span><span class="text-gray-500 dark:text-gray-100"> {{ userphone }}</span></p>
                    <p><span class="font-bold">Εσωτ. Τηλέφωνο: </span><span class="text-gray-500 dark:text-gray-100"> {{ user_internal_phone }}</span></p>
                    <p><span class="font-bold">Γκρουπ: </span><span class="text-gray-500 dark:text-gray-100"> {{ user_department }}</span></p>
                </div>
            </template>
        </div>
        <div class="info-actions pt-10 pb-5 flex gap-4">
            <button
                v-if="permissionsStore.can('profile_info','modify')"
                class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Επεξεργασία
            </button>
            <button
                v-if="permissionsStore.can('profile_info','change_password')"
                class="font-bold text-gray-800 dark:text-white mx-auto text-md">
                Αλλαγή κωδικού
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';

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

// Simulate loading duration (replace this with actual data fetch logic)
</script>

<script>
export default {
    name: 'ProfileInfo'
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
