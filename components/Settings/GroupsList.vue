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
      <div
        v-if="permissionsStore.can('group', 'modify')"
        class="info-actions pb-5 flex gap-4 col-span-2"
      >
        <button
          class="py-3 inline-flex justify-center rounded-3xl border border-transparent bg-red-600 px-4 text-md font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          @click="newGroup"
        >
          {{ $t('settings.addGroup') }}
        </button>
      </div>
      <SharedSettingsFilterBar
        v-model="filters"
        class="hidden lg:block"
        :filter-fields="[
          { key: 'firstName', placeholder: $t('settings.firstName') },
          { key: 'lastName', placeholder: $t('settings.lastName') },
          { key: 'job_title', placeholder: $t('settings.jobTitle') },
          { key: 'department', placeholder: $t('settings.group') },
        ]"
        :sort-fields="[
          { key: 'firstName', label: $t('settings.firstName') },
          { key: 'lastName', label: $t('settings.lastName') },
          { key: 'job_title', label: $t('settings.jobTitle') },
          { key: 'department', label: $t('settings.group') },
        ]"
        :sort-key="currentSortKey"
        :sort-asc="sortDirection"
        @sort="sortBy"
      />
      <div class="-m-4 p-4 mt-0">
        <div
          ref="scrollContainer"
          class="overflow-y-auto max-h-[50vh] pr-[15px] flex flex-col gap-[50px] -mr-[5px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
          <div
            v-for="group in filteredGroups"
            :key="group.id"
            :class="group.users.length === 0 ? 'hidden' : ''"
          >
            <div v-if="group.users.length" class="grid grid-cols-2 gap-[10px]">
              <div class="h-7 translate-x-[-20px] justify-start items-center gap-5 flex">
                <div class="w-1 h-7 bg-[#ea021a] rounded-lg"></div>
                <div class="text-black dark:text-white text-xl font-bold">{{ group.name }}</div>
              </div>

              <div class="justify-self-end flex gap-[25px] items-center">
                <a
                  v-if="permissionsStore.can('group', 'modify')"
                  class="cursor-pointer text-[#EA021A] font-bold underline"
                  @click="editGroup(group.id)"
                  >{{ $t('settings.editGroup') }}</a
                >
                <svg
                  v-if="permissionsStore.can('group', 'modify')"
                  class="cursor-pointer text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="19"
                  viewBox="0 0 16 19"
                  fill="none"
                  @click="deleteGroup(group.id)"
                >
                  <path
                    d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div
                v-for="user in group.users"
                :key="user.id"
                class="col-span-2 grid gap-x-[10px] gap-y-1 grid-cols-[auto_1fr] lg:grid-cols-12 items-center border border-gray-200 dark:border-neutral-700 rounded-lg pl-[20px] pr-[30px] py-[10px] hover:bg-neutral-100 dark:hover:bg-neutral-700/50 text-gray-500 dark:text-neutral-300"
              >
                <div
                  class="row-span-3 lg:row-span-1 mr-4 flex items-center justify-start self-center col-span-1 lg:col-span-1"
                >
                  <SharedUserAvatar :user="user" :size="50" />
                </div>
                <div class="col-span-1 lg:col-span-2">
                  {{ user.firstName || '' }}
                </div>
                <div class="col-span-1 lg:col-span-2">
                  {{ user.lastName || '' }}
                </div>
                <div class="col-span-1 lg:col-span-2">
                  {{ user?.profile?.job_title || '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filter/Sort Drawer -->
    <SharedFilterSortDrawer
      v-model="filters"
      :filter-fields="[
        { key: 'firstName', placeholder: $t('settings.firstName') },
        { key: 'lastName', placeholder: $t('settings.lastName') },
        { key: 'job_title', placeholder: $t('settings.jobTitle') },
        { key: 'department', placeholder: $t('settings.group') },
      ]"
      :sort-fields="[
        { key: 'firstName', label: $t('settings.firstName') },
        { key: 'lastName', label: $t('settings.lastName') },
        { key: 'job_title', label: $t('settings.jobTitle') },
        { key: 'department', label: $t('settings.group') },
      ]"
      :sort-key="currentSortKey"
      :sort-asc="sortDirection"
      @sort="sortBy"
    />
  </template>

  <SharedBaseModal v-model="showModal">
    <!-- Conditionally render EditGroup component for edit mode -->
    <component
      :is="modalComponent"
      v-if="modalType === 'edit'"
      :group-id="bridgedGroupId"
      :as-modal="true"
      @saved="closeModal"
    />
  </SharedBaseModal>

  <!-- Delete Group Confirmation Modal -->
  <Teleport to="body">
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center"
      @click.self="showDeleteConfirm = false"
    >
      <div class="sm:max-w-sm w-full m-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
        <div class="px-6 pt-6 pb-4">
          <h3 class="text-[18px] font-bold text-black dark:text-white mb-2">
            {{ $t('settings.deleteGroupTitle') }}
          </h3>
          <p class="text-[14px] text-gray-600 dark:text-neutral-400 mb-4">
            {{ $t('settings.deleteGroupConfirm', { name: deleteTargetGroupName }) }}
          </p>
          <p class="text-[12px] text-amber-600 dark:text-amber-400">
            {{ $t('common.irreversibleAction') }}
          </p>
        </div>
        <div class="flex justify-end gap-[10px] px-6 pb-6">
          <button
            type="button"
            class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
            @click="showDeleteConfirm = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            :disabled="deleting"
            class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            @click="confirmDeleteGroup"
          >
            {{ deleting ? $t('common.loading') : $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCentralStore } from '~/stores/centralStore';
import EditGroup from '@/components/Settings/EditGroup.vue';
import SharedUserAvatar from '@/components/shared/UserAvatar.vue';
import SharedBaseModal from '@/components/shared/BaseModal.vue';
import { useAllDepartments } from '@/composables/departmentsApiComposable';
import { useAllUsers } from '@/composables/userApiComposable';
import type { User, Department } from '~/types';

const centralStore = useCentralStore();
const { $toast } = useNuxtApp() as any;
const { t } = useI18n();
const userStore = centralStore.userStore;
const departmentsStore = centralStore.departmentsStore;
const permissionsStore = centralStore.permissionsStore;

// Reactive variables for modal management
const showModal = ref(false);
const modalType = ref<'edit' | 'delete' | ''>('');
const selectedGroupId = ref<string | number | null>(null);

// Delete confirmation state
const showDeleteConfirm = ref(false);
const deleting = ref(false);
const deleteTargetGroupId = ref<string | number | null>(null);
const deleteTargetGroupName = ref('');

// Use reactive fetching
const {
  data: remoteDepartments,
  pending: departmentsPending,
  refresh: refreshDepartments,
} = useAllDepartments();
const { data: remoteUsers, pending: usersPending } = useAllUsers();

// No unused vars
// const theme = computed(() => {
//   const { $colorMode } = useNuxtApp() as unknown as { $colorMode: { value: string } };
//   return $colorMode?.value || 'light';
// });

// Loading state combined
const loading = computed(
  () => departmentsPending.value || usersPending.value || centralStore.loading,
);

interface LocalUser extends User {
  firstName: string;
  lastName: string;
}

// Reactive variable to store all processed users
const allUsers = ref<LocalUser[]>([]);

// Mixin remote users from composable AND store
const usersToProcess = computed(() => remoteUsers.value || userStore.allUsers || []);

// Process users to extract firstName and lastName
watch(
  usersToProcess,
  (users) => {
    if (!users) return;
    allUsers.value = users.map((user: User) => {
      const name = user.name || '';
      const nameSplit = name.trim().split(' ');
      const firstName = nameSplit.slice(0, -1).join(' ') || nameSplit[0] || '';
      const lastName = nameSplit.slice(-1).join(' ') || '';

      return {
        ...user,
        firstName,
        lastName,
      } as LocalUser;
    });
    // Also sync back to store if needed
    userStore.allUsers = users;
  },
  { immediate: true },
);

// Reactive variables for sorting
const sortDirection = ref(true); // true for ascending, false for descending
const currentSortKey = ref<string>('firstName'); // The key currently being sorted by

// Function to handle sorting when a sort button is clicked
const sortBy = (sortingKey: string) => {
  if (currentSortKey.value === sortingKey) {
    sortDirection.value = !sortDirection.value;
  } else {
    currentSortKey.value = sortingKey;
    sortDirection.value = true;
  }
};

// Define sorting functions
const sortByFunctions: Record<
  string,
  (a: LocalUser | Department, b: LocalUser | Department) => number
> = {
  firstName: (a, b) => (a as LocalUser).firstName.localeCompare((b as LocalUser).firstName),
  lastName: (a, b) => (a as LocalUser).lastName.localeCompare((b as LocalUser).lastName),
  job_title: (a, b) =>
    ((a as LocalUser).profile?.job_title || '').localeCompare(
      (b as LocalUser).profile?.job_title || '',
    ),
  department: (a, b) => (a as Department).name.localeCompare((b as Department).name),
};

// Define filters
const filters = ref({
  firstName: '',
  lastName: '',
  department: '',
  job_title: '',
});

// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
  let users = allUsers.value.filter(
    (user) =>
      (filters.value.firstName !== ''
        ? user.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase())
        : true) &&
      (filters.value.lastName !== ''
        ? user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
        : true) &&
      (filters.value.department !== ''
        ? (user.department?.name || '')
            .toLowerCase()
            .includes(filters.value.department.toLowerCase())
        : true) &&
      (filters.value.job_title !== ''
        ? (user.profile?.job_title || '')
            .toLowerCase()
            .includes(filters.value.job_title.toLowerCase())
        : true),
  );

  if (
    currentSortKey.value &&
    currentSortKey.value !== 'department' &&
    sortByFunctions[currentSortKey.value]
  ) {
    users = [...users].sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return users;
});

const filteredGroups = computed(() => {
  const departmentsData = remoteDepartments.value || departmentsStore.departmentsData || [];

  let groups = departmentsData.map((department: Department) => {
    return {
      ...department,
      users: [...filteredUsers.value.filter((user) => user?.department?.id === department.id)],
    };
  });

  if (
    currentSortKey.value &&
    currentSortKey.value === 'department' &&
    sortByFunctions[currentSortKey.value]
  ) {
    groups = [...groups].sort((a, b) => {
      const result = sortByFunctions[currentSortKey.value](a, b);
      return sortDirection.value ? result : -result;
    });
  }

  return groups;
});

const newGroup = () => {
  selectedGroupId.value = null;
  modalType.value = 'edit';
  showModal.value = true;
};

const editGroup = (groupId: string | number) => {
  selectedGroupId.value = groupId;
  modalType.value = 'edit';
  showModal.value = true;
};

const deleteGroup = (groupId: string | number) => {
  // Show proper confirmation dialog instead of broken BaseModal with null component
  const group = (remoteDepartments.value || departmentsStore.departmentsData || []).find(
    (d: Department) => d.id === groupId,
  );
  deleteTargetGroupId.value = groupId;
  deleteTargetGroupName.value = group?.name || String(groupId);
  showDeleteConfirm.value = true;
};

const confirmDeleteGroup = async () => {
  if (!deleteTargetGroupId.value) return;
  deleting.value = true;
  try {
    await departmentsStore.deleteDepartment(deleteTargetGroupId.value);
    $toast.success(t('settings.groupDeleted'));
    showDeleteConfirm.value = false;
    deleteTargetGroupId.value = null;
    deleteTargetGroupName.value = '';
    await refreshDepartments();
  } catch {
    $toast.error(t('settings.deleteGroupError'));
  } finally {
    deleting.value = false;
  }
};

const closeModal = async () => {
  showModal.value = false;
  selectedGroupId.value = null;
  modalType.value = '';
  await refreshDepartments();
};

const modalComponent = computed(() => {
  return modalType.value === 'edit' ? EditGroup : null;
});

// Cast selectedGroupId for the component
const bridgedGroupId = computed(() => selectedGroupId.value ?? undefined);
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-enter-to {
  transform: translateX(0);
}
.slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
