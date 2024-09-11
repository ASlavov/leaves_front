<template>
    <h3 class="py-4 font-semibold text-lg">Πληροφορίες</h3>
    <div class="bg-white border rounded-lg shadow-md p-4 flex-1 flex flex-col">
        <div class="flex-1">
            <!-- Avatar -->
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                <span class="text-white font-bold">
                    {{ firstNameInitial }}{{ lastNameInitial }}
                </span> <!-- Placeholder for initials -->
            </div>
            <!-- Info Details -->
            <div class="pt-4 space-y-2">
                <p><span class="font-bold">Όνομα: </span><span class="text-gray-500">{{ firstName }}</span></p>
                <p><span class="font-bold">Επώνυμο: </span><span class="text-gray-500"> {{ lastName }}</span></p>
                <p><span class="font-bold">Τίτλος: </span><span class="text-gray-500"> {{ userTitle }}</span></p>
                <p><span class="font-bold">Email: </span><span class="text-gray-500"> {{ userEmail }}</span></p>
                <p><span class="font-bold">Κινητό: </span><span class="text-gray-500"> {{ userphone }}</span></p>
                <p><span class="font-bold">Εσωτ. Τηλέφωνο: </span><span class="text-gray-500"> {{ user_internal_phone }}</span></p>
                <p><span class="font-bold">Γκρουπ: </span><span class="text-gray-500"> {{ user_department }}</span></p>
            </div>
        </div>
        <div class="info-actions pt-10 pb-5 flex gap-4">
            <button
                class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 py-2 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none">
                Επεξεργασία
            </button>
            <button class="font-bold text-gray-800 dark:text-white mx-auto text-md">
                Αλλαγή κωδικού
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';
import { computed } from "vue";

const router = useRouter();
const { authStore, userStore } = useCentralStore();

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

console.log(userStore.userInfo);
</script>

<script>
export default {
    name: 'ProfileInfo'
}
</script>
