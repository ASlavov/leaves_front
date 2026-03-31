<template>
  <div class="user-list-container p-4">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 class="text-2xl font-bold dark:text-gray-100">{{ $t('settings.permissions') }}</h2>
    </div>

    <!-- Permissions Table -->
    <div
      class="bg-white rounded-lg shadow overflow-hidden border dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div
        class="grid grid-cols-1 md:grid-cols-5 bg-gray-100 p-4 font-bold text-sm uppercase dark:bg-neutral-900 border-b dark:border-neutral-700 text-center"
      >
        <div class="md:col-span-1 text-left">{{ $t('settings.permissions') }}</div>
        <div v-for="role in roles" :key="role.key" class="md:col-span-1">{{ role.name }}</div>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-neutral-700">
        <div
          v-for="(category, categoryKey) in permissionCategories"
          :key="categoryKey"
          class="contents"
        >
          <!-- Category Header -->
          <div
            class="bg-gray-50 px-4 py-2 font-bold text-xs uppercase text-gray-500 dark:bg-neutral-800/50 dark:text-neutral-400 border-b dark:border-neutral-700"
          >
            {{ category.label }}
          </div>

          <!-- Actions within category -->
          <div
            v-for="(action, actionKey) in category.actions"
            :key="actionKey"
            class="grid grid-cols-1 md:grid-cols-5 p-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-neutral-700"
          >
            <div class="md:col-span-1 font-medium text-sm dark:text-gray-200">
              {{ action.label }}
            </div>
            <div
              v-for="role in roles"
              :key="role.key"
              class="md:col-span-1 flex justify-center py-2 md:py-0"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-inner"
                :class="
                  hasPermission(role.key, categoryKey, actionKey)
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'
                "
              >
                <svg
                  v-if="hasPermission(role.key, categoryKey, actionKey)"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';

const { t } = useI18n();
const centralStore = useCentralStore();
const permissionsStore = centralStore.permissionsStore;

const roles = computed(() => permissionsStore.allRoles);

interface PermissionAction {
  label: string;
}

interface PermissionCategory {
  label: string;
  actions: Record<string, PermissionAction>;
}

const permissionCategories = computed<Record<string, PermissionCategory>>(() => ({
  profile_leave_balance: {
    label: t('settings.permissionsLeaves'),
    actions: {
      view: { label: t('common.view') },
      request_leave: { label: t('leaves.requestLeave') },
      cancel_leave: { label: t('leaves.cancelLeave') },
      accept_leave: { label: t('leaves.approveLeave') },
      decline_leave: { label: t('leaves.rejectLeave') },
    },
  },
  profile_info: {
    label: t('settings.userProfile'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
      change_password: { label: t('settings.changePassword') },
    },
  },
  all_users: {
    label: t('settings.allUsers'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  entitlement: {
    label: t('settings.entitledDays'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  group: {
    label: t('settings.departments'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  leave_types: {
    label: t('settings.leaveTypes'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  work_week: {
    label: t('settings.workWeek'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  public_holidays: {
    label: t('settings.publicHolidays'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
  invitations: {
    label: t('settings.invitations'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
    },
  },
}));

const hasPermission = (roleKey: string, category: string, action: string) => {
  const storePermissions = permissionsStore.permissions as Record<string, Record<string, string[]>>;
  const categoryPermissions = storePermissions[category];
  if (!categoryPermissions) return false;

  const allowedRoles = categoryPermissions[action];
  if (!allowedRoles) return false;

  return allowedRoles.includes(roleKey);
};
</script>
