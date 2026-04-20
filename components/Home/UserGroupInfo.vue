<template>
  <div class="h-full flex flex-col group-info-container">
    <h3 class="py-4 font-bold text-[16px] text-[#212121] dark:text-gray-100">
      {{ $t('settings.group') }}
    </h3>
    <div
      class="bg-white border rounded-lg hover:shadow-md transition-shadow duration-300 py-[25px] px-[35px] gap-y-[25px] flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100"
    >
      <!-- Center Content -->
      <div
        class="flex-1 flex items-start xl:items-center gap-[15px] justify-start xl:justify-center w-full"
      >
        <template v-if="loading">
          <div class="h-6 bg-gray-200 rounded w-1/2 animate-pulse dark:bg-neutral-700"></div>
        </template>
        <template v-else>
          <p
            class="text-[20px] font-bold text-black dark:text-gray-100 text-left xl:text-center leading-tight"
          >
            {{ departmentName }}
          </p>
        </template>
      </div>

      <!-- Actions Footer -->
      <div
        v-if="permissionsStore.can('group', 'modify')"
        class="flex justify-center gap-[25px] w-full 2xl:flex-row flex-col items-start xl:items-center"
      >
        <button
          class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[15px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none"
          @click="openEditModal"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          class="text-[14px] font-bold text-black dark:text-white underline decoration-1 underline-offset-4 hover:text-[#EA021A] hover:dark:text-[#EA021A] transition-colors"
          @click="confirmDelete"
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
      <div
        class="bg-white dark:bg-neutral-800 p-6 rounded-xl w-full max-w-[900px] relative shadow-2xl mx-4"
      >
        <button
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          @click="closeEditModal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <EditGroup :group-id="departmentId" @saved="handleGroupSaved" />
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
