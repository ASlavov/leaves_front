<template>
    <h3 class="py-4 font-semibold text-lg">Γκρουπ</h3>

    <!-- Use a single container and conditional rendering for loading and data -->
    <div v-if="loading" class="bg-gray-200 border rounded-lg shadow-md p-4 flex-1 flex items-center justify-center">
        <!-- Skeleton Loader -->
        <div class="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
    </div>

    <div v-else class="bg-white border rounded-lg shadow-md p-4 flex-1 flex items-center justify-center">
        <!-- Group Info when data is available -->
        <div class="group-info text-center text-red-600">{{ user_department }}</div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';

const router = useRouter();
const { authStore, userStore } = useCentralStore();
const user_department = computed(() => userStore.userInfo?.department?.name);

// Loading state
const loading = ref(true);

// Simulate a data fetch delay
setTimeout(() => {
    loading.value = false;
}, 2000); // Simulated loading time (adjust as needed)
</script>

<script>
export default {
    name: 'UserGroupInfo'
}
</script>