<template>
    <h3 class="py-4 font-semibold text-lg">Γκρουπ</h3>
    <div class="bg-white border rounded-lg shadow-md p-4 flex-1 flex items-center justify-center">
        <div class="group-info text-center text-red-600">{{ user_department }}</div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore.js';
import {computed} from "vue";

const router = useRouter();
const { authStore, userStore } = useCentralStore();
const user_department = computed(() => userStore.userInfo?.department?.name);

console.log(userStore.userInfo);
</script>

<script>
export default {
    name: ' UserGroupInfo'
}
</script>