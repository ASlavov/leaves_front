<template>
  <div class="h-full flex flex-col group-info-container">
    <h3 class="py-4 font-bold text-[16px] text-[#212121] dark:text-gray-100">
      {{ $t('settings.group') }}
    </h3>

    <div
      class="bg-white border border-gray-100 dark:border-neutral-700 rounded-xl hover:shadow-md transition-shadow duration-300 flex-1 flex flex-col overflow-hidden dark:bg-neutral-800"
    >
      <!-- Department header -->
      <div
        class="px-5 py-4 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between gap-3"
      >
        <template v-if="loading">
          <div class="h-5 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-neutral-700"></div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-1 h-6 rounded-full bg-red-500 shrink-0"></div>
            <p class="text-base font-bold text-gray-800 dark:text-gray-100 truncate">
              {{ departmentName }}
            </p>
            <span
              v-if="members.length"
              class="shrink-0 text-xs font-semibold bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400 rounded-full px-2 py-0.5"
            >
              {{ members.length }}
            </span>
          </div>
          <div
            v-if="permissionsStore.can('group', 'modify')"
            class="flex items-center gap-3 shrink-0"
          >
            <button
              class="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
              @click="openEditModal"
            >
              {{ $t('common.edit') }}
            </button>
            <button
              class="text-xs font-semibold text-gray-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors"
              @click="confirmDelete"
            >
              {{ $t('common.delete') }}
            </button>
          </div>
        </template>
      </div>

      <!-- Member list: max 6 visible rows, custom scrollbar below -->
      <div
        class="overflow-y-auto divide-y divide-gray-50 dark:divide-neutral-700/60 max-h-[354px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        style="scrollbar-width: thin; scrollbar-color: #e5e7eb transparent"
      >
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-5 py-3">
            <div
              class="w-9 h-9 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse shrink-0"
            ></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-2/3 animate-pulse"></div>
              <div class="h-2.5 bg-gray-100 dark:bg-neutral-600 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </template>
        <template v-else-if="members.length">
          <button
            v-for="user in members"
            :key="user.id"
            class="w-full flex items-center gap-3 py-3 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors text-left relative"
            :class="isHead(user) ? 'pr-5 pl-5' : 'pr-5'"
            @click="openUserInfo(user)"
          >
            <!-- Indent strip for non-head members -->
            <template v-if="!isHead(user)">
              <div
                class="absolute left-0 top-0 bottom-0 w-[5px] bg-gray-50 dark:bg-neutral-700/40 shrink-0"
              ></div>
              <div class="w-[5px] shrink-0"></div>
            </template>

            <SharedUserAvatar :user="user" :size="36" class="shrink-0" />
            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate flex items-center gap-1.5"
              >
                {{ user.name }}
                <span
                  v-if="isHead(user)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 shrink-0"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"></span>
                  {{ $t('settings.head') }}
                </span>
              </p>
              <p
                v-if="user.profile?.job_title"
                class="text-xs text-gray-400 dark:text-neutral-500 truncate"
              >
                {{ user.profile.job_title }}
              </p>
            </div>
            <svg
              class="w-4 h-4 text-gray-300 dark:text-neutral-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </template>
        <div
          v-else
          class="flex items-center justify-center h-24 text-sm text-gray-400 dark:text-neutral-500"
        >
          {{ $t('settings.noMembers') }}
        </div>
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

    <!-- User info modal (same as search bar) -->
    <SharedUserInfoModal v-if="selectedUser" :user="selectedUser" @close="selectedUser = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCentralStore } from '@/stores/centralStore';
import EditGroup from '@/components/Settings/EditGroup.vue';

const centralStore = useCentralStore();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;

const loading = computed(() => centralStore.loading);
const departmentName = computed(() => userStore.userInfo?.department?.name || 'N/A');
const departmentId = computed(() => userStore.userInfo?.department?.id);

// API returns the head user's id as `head` (not `head_id`) on the department object.
// Fall back to role-based detection if the field is missing.
const headId = computed(() => {
  if (!departmentId.value) return null;
  const dept = departmentsStore.departmentsData?.find(
    (d) => String(d.id) === String(departmentId.value),
  );
  // Try the API field first, then the type field, then userInfo
  return (
    dept?.head ??
    dept?.head_id ??
    userStore.userInfo?.department?.head ??
    userStore.userInfo?.department?.head_id ??
    null
  );
});

onMounted(() => {
  if (!departmentsStore.departmentsData?.length) departmentsStore.getAll();
});

const isHead = (user) => {
  // Primary: compare against the known head id
  if (headId.value) return String(user.id) === String(headId.value);
  // Fallback: check if user has the 'head' role (role_id 3 or name 'head')
  return user.roles?.some((r) => r.name === 'head' || r.id === 3) ?? false;
};

const members = computed(() => {
  if (!departmentId.value) return [];
  const raw = (userStore.allUsers || []).filter(
    (u) => u.department?.id === departmentId.value || u.department_id === departmentId.value,
  );
  const head = raw.find((u) => isHead(u));
  const rest = raw.filter((u) => !isHead(u));
  return head ? [head, ...rest] : raw;
});

const showEditModal = ref(false);
const selectedUser = ref(null);

const openUserInfo = (user) => {
  selectedUser.value = user;
};
const openEditModal = () => {
  if (departmentId.value) showEditModal.value = true;
};
const closeEditModal = () => {
  showEditModal.value = false;
};

const handleGroupSaved = () => {
  closeEditModal();
  departmentsStore.getAll();
};

const confirmDelete = async () => {
  if (!departmentId.value) return;
  if (confirm('Are you sure you want to delete this group?')) {
    try {
      await departmentsStore.deleteDepartment(departmentId.value);
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
