<template>
    <div class="h-full flex flex-col">
        <h3 class="py-4 font-semibold text-lg dark:text-gray-100">{{ $t('common.groupInformation') }}</h3>
        <div class="border border-gray-100 rounded-lg p-4 h-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-100">
            <div class="flex flex-col space-y-2">
                <div class="mb-4">
                    <span class="font-bold border-b border-gray-200 dark:border-neutral-700 block pb-1">{{ $t('settings.group') }}</span>
                    <span class="text-gray-500 pt-2 block dark:text-gray-100">{{ departmentName }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';

const centralStore = useCentralStore();
const userStore = centralStore.userStore;

const departmentName = computed(() => userStore.userData?.department?.name || 'N/A');
</script>

<style scoped>
/* Add any additional styles here */
</style>