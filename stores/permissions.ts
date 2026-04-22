import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '~/stores/user';
import type { Role } from '~/types';
import type { PermissionMatrix, FullPermissionMatrix } from '~/types/permissions';

export const usePermissionsStore = defineStore('permissionsStore', () => {
  const userStore = useUserStore();
  const { t } = useI18n();

  const permissionsMatrix = ref<PermissionMatrix>({});
  const fullMatrix = ref<FullPermissionMatrix>({});

  const allRoles = computed(() => [
    { id: 1, key: 'admin', name: t('roles.admin') },
    { id: 2, key: 'hr-manager', name: t('roles.hr_manager') },
    { id: 3, key: 'head', name: t('roles.head') },
    { id: 4, key: 'user', name: t('roles.user') },
  ]);

  const userRoles = computed(() => {
    const roles = userStore.userInfo?.roles || [];
    return roles.map((role: Role) => role.name);
  });

  const hasRole = (roleName: string) => {
    return userRoles.value.includes(roleName);
  };

  const isAdmin = () => {
    return userStore.userInfo?.roles?.some((role: Role) => role.name === 'admin') ?? false;
  };

  const can = (category: string, action: string) => {
    return permissionsMatrix.value?.[category]?.[action] ?? false;
  };

  async function init() {
    try {
      const data = await $fetch('/api/permissions/me') as { permissions: PermissionMatrix };
      permissionsMatrix.value = data.permissions;
    } catch (e) {
      console.error('Failed to load permissions', e);
      permissionsMatrix.value = {};
    }
  }

  async function fetchFullMatrix() {
    try {
      const data = await $fetch('/api/permissions') as { matrix: FullPermissionMatrix };
      fullMatrix.value = data.matrix;
    } catch (e) {
      console.error('Failed to load full matrix', e);
    }
  }

  async function updateMatrix(newMatrix: FullPermissionMatrix) {
    try {
      await $fetch('/api/permissions', {
        method: 'PUT',
        body: { matrix: newMatrix },
      });
      await fetchFullMatrix();
      await init();
    } catch (e) {
      console.error('Failed to update matrix', e);
      throw e;
    }
  }

  function reset() {
    permissionsMatrix.value = {};
    fullMatrix.value = {};
  }

  return {
    permissionsMatrix,
    fullMatrix,
    allRoles,
    userRoles,
    hasRole,
    isAdmin,
    can,
    init,
    fetchFullMatrix,
    updateMatrix,
    reset,
  };
});
