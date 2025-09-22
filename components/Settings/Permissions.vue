<template>
  <div class="p-4">
    <!-- Permissions List -->
    <div>
      <!-- Group by Category Label -->
      <div v-for="(group, index) in groupedPermissions" :key="index" class="mb-6">
        <h3 class="border-l-4 dark:text-white border-red-500 pl-[20px] ml-[-25px] text-black font-bold text-[18px] mb-4">
          {{ group.categoryLabel }}
        </h3>
        <div v-for="action in group.actions" :key="action.actionKey" class="mb-4 ml-2">
          <h4 class="font-medium mb-2 dark:text-neutral-200 underline">
            {{ action.actionLabel }}
          </h4>
          <ul class="space-y-1 ml-2 flex gap-10">
            <li
                v-for="rolePerm in action.rolePermissions"
                :key="rolePerm.role"
                class="flex items-center"
            >
              <span class="mr-2">
                <component
                    :is="rolePerm.roleHasPermission ? CheckIcon : XMarkIcon"
                    class="w-5 h-5"
                    :class="rolePerm.roleHasPermission ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'"
                />
              </span>
              <span class="text-neutral-500 dark:text-neutral-300">{{ rolePerm.roleLabel }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissionsStore } from '~/stores/permissions';

// Import icons from Heroicons v2
import { CheckIcon } from '@heroicons/vue/24/outline';
import { XMarkIcon } from '@heroicons/vue/24/outline';

// Define all roles
const allRoles = ['admin', 'hr-manager', 'head', 'user'];

// Map roles to labels
const roleLabels = {
  admin: 'Admin',
  'hr-manager': 'HR',
  head: 'Department Head',
  user: 'User',
};

// Define permission labels
const permissionLabels = {
  profile_leave_balance: {
    label: 'Άδειες',
    actions: {
      view: 'Προβολή',
      request_leave: 'Αίτηση Άδειας',
      cancel_leave: 'Ακύρωση Άδειας',
      accept_leave: 'Αποδοχή Άδειας',
      decline_leave: 'Απόρριψη Άδειας',
    },
  },
  profile_info: {
    label: 'Προφίλ Χρήστη',
    actions: {
      view: 'Προβολή',
      modify: 'Τροποποίηση',
      change_password: 'Αλλαγή Κωδικού',
    },
  },
  all_users: {
    label: 'Όλοι οι Χρήστες',
    actions: {
      view: 'Προβολή',
      modify: 'Τροποποίηση',
    },
  },
  entitlement: {
    label: 'Δικαιούμενες Ημέρες Άδειας',
    actions: {
      view: 'Προβολή',
      modify: 'Τροποποίηση',
    }
  },
  group: {
    label: 'Τμήματα',
    actions: {
      view: 'Προβολή',
      modify: 'Τροποποίηση',
    },
  },
  leave_types: {
    label: 'Τύποι Αδειών',
    actions: {
      view: 'Προβολή',
      modify: 'Τροποποίηση',
    },
  },
  // Exclude 'permissions' category as per your request
};

// Access permissions store
const permissionsStore = usePermissionsStore();

// Compute permissions for all roles
const groupedPermissions = computed(() => {
  const groups = {};

  // Iterate over each permission category
  for (const [categoryKey, actions] of Object.entries(permissionsStore.permissions)) {
    // Skip 'permissions' category
    if (categoryKey === 'permissions') continue;

    const categoryLabel = permissionLabels[categoryKey]?.label || categoryKey;

    // Initialize group if not exists
    if (!groups[categoryKey]) {
      groups[categoryKey] = {
        categoryLabel,
        actions: [],
      };
    }

    // Iterate over each action
    for (const [actionKey, allowedRoles] of Object.entries(actions)) {
      const actionLabel = permissionLabels[categoryKey]?.actions[actionKey] || actionKey;

      // For each role in allRoles, check if the role grants permission
      const rolePermissions = allRoles.map((role) => {
        const roleLabel = roleLabels[role] || role;
        const roleHasPermission = allowedRoles.includes(role);
        return {
          role,
          roleLabel,
          roleHasPermission,
        };
      });

      groups[categoryKey].actions.push({
        actionKey,
        actionLabel,
        rolePermissions,
      });
    }
  }

  // Convert groups object to array
  return Object.values(groups);
});
</script>

<style>
/* Tailwind CSS styles are applied directly in the class attributes */
</style>
