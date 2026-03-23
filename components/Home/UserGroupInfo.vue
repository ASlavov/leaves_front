<template>
    <div class="h-full flex flex-col group-info-container">
        <h3 class="py-4 font-bold text-[16px] text-black dark:text-gray-100">
            {{ $t('settings.group') }}
        </h3>
        <div class="bg-white border border-[#dfeaf2] rounded-[8px] hover:shadow-md transition-all duration-300 h-[392px] dark:bg-neutral-800 dark:border-neutral-700 p-6 flex flex-col items-center justify-between relative shadow-sm">
            <!-- Center Content -->
            <div class="flex-1 flex items-center justify-center w-full">
                <template v-if="loading">
                    <div class="h-6 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></div>
                </template>
                <template v-else>
                    <p class="text-[20px] font-bold text-black dark:text-gray-100 text-center leading-tight">
                        {{ departmentName }}
                    </p>
                </template>
            </div>

            <!-- Actions Footer -->
            <div v-if="permissionsStore.can('group', 'modify')" class="flex flex-col items-center gap-4 w-full pb-4">
                <button
                    @click="openEditModal"
                    class="bg-[#ea021a] hover:bg-red-700 text-white font-bold text-[14px] px-[30px] py-[15px] rounded-[70px] w-auto transition-colors shadow-sm active:scale-95"
                >
                    {{ $t('common.edit') }}
                </button>
                <button
                    @click="confirmDelete"
                    class="text-[14px] font-bold text-black dark:text-gray-300 underline decoration-1 underline-offset-4 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    {{ $t('common.delete') }}
                </button>
            </div>
        </div>

        <!-- Edit Modal -->
        <div
            v-if="showEditModal"
            class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            @click.self="closeEditModal"
        >
            <div class="bg-white dark:bg-neutral-800 p-6 rounded-xl w-full max-w-[900px] relative shadow-2xl mx-4">
                <button
                    @click="closeEditModal"
                    class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <EditGroup :groupId="departmentId" @saved="handleGroupSaved" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import EditGroup from '@/components/Settings/EditGroup.vue';

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;

const loading = computed(() => centralStore.loading);
const departmentName = computed(() => userStore.userInfo?.department?.name || 'N/A');
const departmentId = computed(() => userStore.userInfo?.department?.id);

const showEditModal = ref(false);

const openEditModal = () => {
    if (departmentId.value) {
        showEditModal.value = true;
    }
};

const closeEditModal = () => {
    showEditModal.value = false;
};

const handleGroupSaved = () => {
    closeEditModal();
    // userInfo is updated in the store after editGroup call inside EditGroup.vue if it's the same user's department
    // However, we might want to refresh all departments just in case
    departmentsStore.getAll();
};

const confirmDelete = async () => {
    if (!departmentId.value) return;
    
    const confirmed = confirm('Are you sure you want to delete this group?');
    if (confirmed) {
        try {
            await departmentsStore.deleteDepartment(departmentId.value);
            // After deletion, we should probably refresh the user profile to reflect they have no department
            await userStore.loadUserProfile();
        } catch (error) {
            console.error('Failed to delete department:', error);
        }
    }
};
</script>

<style scoped>
.group-info-container {
    font-family: 'Roboto', sans-serif;
}
</style>