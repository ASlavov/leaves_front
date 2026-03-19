<template>
  <div class="user-list-container p-4">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <h2 class="text-2xl font-bold dark:text-gray-100">{{ $t('settings.permissions') }}</h2>
    </div>

    <!-- Permissions Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden border dark:border-neutral-700 dark:bg-neutral-800">
      <div class="grid grid-cols-1 md:grid-cols-5 bg-gray-100 p-4 font-bold text-sm uppercase dark:bg-neutral-900 border-b dark:border-neutral-700 text-center">
        <div class="md:col-span-1 text-left">{{ $t('settings.permissions') }}</div>
        <div v-for="role in roles" :key="role" class="md:col-span-1">{{ role }}</div>
      </div>

      <div class="divide-y divide-gray-200 dark:divide-neutral-700">
        <div v-for="(category, categoryKey) in permissionCategories" :key="categoryKey" class="contents">
          <!-- Category Header -->
          <div class="bg-gray-50 px-4 py-2 font-bold text-xs uppercase text-gray-500 dark:bg-neutral-800/50 dark:text-neutral-400 border-b dark:border-neutral-700">
            {{ category.label }}
          </div>
          
          <!-- Actions within category -->
          <div v-for="(action, actionKey) in category.actions" :key="actionKey" class="grid grid-cols-1 md:grid-cols-5 p-4 items-center hover:bg-gray-50 transition-colors dark:hover:bg-neutral-700">
            <div class="md:col-span-1 font-medium text-sm dark:text-gray-200">
              {{ action.label }}
            </div>
            <div v-for="role in roles" :key="role" class="md:col-span-1 flex justify-center py-2 md:py-0">
              <div class="w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-inner"
                   :class="hasPermission(role, categoryKey, actionKey) ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-50 text-red-300 dark:bg-red-900/20 dark:text-red-800'">
                <svg v-if="hasPermission(role, categoryKey, actionKey)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const roles = ['Admin', 'HR', 'Department Head', 'User'];

const permissionCategories = computed(() => ({
  leaves: {
    label: t('settings.permissionsLeaves'),
    actions: {
      view: { label: t('common.view') },
      request: { label: t('leaves.requestLeave') },
      cancel: { label: t('leaves.cancelLeave') },
      approve: { label: t('leaves.approveLeave') },
      reject: { label: t('leaves.rejectLeave') }
    }
  },
  profile: {
    label: t('settings.userProfile'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') },
      change_password: { label: t('settings.changePassword') }
    }
  },
  all_users: {
    label: t('settings.allUsers'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') }
    }
  },
  entitlements: {
    label: t('settings.entitledDays'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') }
    }
  },
  departments: {
    label: t('settings.departments'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') }
    }
  },
  leave_types: {
    label: t('settings.leaveTypes'),
    actions: {
      view: { label: t('common.view') },
      modify: { label: t('common.modify') }
    }
  }
}));

// Mock permission checker (since permissions store logic might be complex)
const hasPermission = (role, category, action) => {
  // Logic based on the permissions table provided in the audited file
  const matrix = {
    Admin: { '*': true },
    HR: {
      leaves: { view: true, request: true, cancel: true, approve: true, reject: true },
      profile: { view: true, modify: true, change_password: true },
      all_users: { view: true, modify: true },
      entitlements: { view: true, modify: true },
      departments: { view: true, modify: true },
      leave_types: { view: true, modify: true }
    },
    'Department Head': {
      leaves: { view: true, request: true, cancel: true, approve: true, reject: true },
      profile: { view: true, modify: true, change_password: true },
      all_users: { view: true, modify: false },
      entitlements: { view: true, modify: false },
      departments: { view: true, modify: false },
      leave_types: { view: true, modify: false }
    },
    User: {
      leaves: { view: true, request: true, cancel: true, approve: false, reject: false },
      profile: { view: true, modify: true, change_password: true },
      all_users: { view: false, modify: false },
      entitlements: { view: false, modify: false },
      departments: { view: false, modify: false },
      leave_types: { view: false, modify: false }
    }
  };

  if (matrix[role]?.['*']) return true;
  return matrix[role]?.[category]?.[action] || false;
};
</script>
