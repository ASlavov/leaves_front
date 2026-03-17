// permissions.js
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from '~/stores/user';
import type { Role } from '~/types';

export const usePermissionsStore = defineStore('permissionsStore', () => {
    const userStore = useUserStore();
    const permissions = {
        profile_leave_balance: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            request_leave: ['hr-manager', 'head', 'user'],
            cancel_leave: ['hr-manager', 'head', 'user'],
            accept_leave: ['admin', 'hr-manager', 'head'],
            decline_leave: ['admin', 'hr-manager', 'head'],
        },
        profile_info: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager', 'head', 'user'],
            change_password: ['admin', 'hr-manager', 'head', 'user'],
        },
        all_users: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager'],
        },
        group: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager'],
        },
        entitlement: {
            view: ['admin', 'hr-manager', 'head'],
            modify: ['admin', 'hr-manager'],
        },
        leave_types: {
            view: ['admin', 'hr-manager', 'head'],
            modify: ['admin', 'hr-manager'],
        },
        permissions: {
            view: ['admin'],
            modify: ['admin'],
        }
    };

    const userRoles = computed(() => {
        const roles = userStore.userInfo?.roles || [];
        return roles.map((role: Role) => role.name);
    });

    const hasRole = (roleName: string) => {
        return userRoles.value.includes(roleName);
    };

    const isAdmin = () => {
        return userStore.userInfo?.roles?.some((role: Role) => role.name === 'admin') ?? false;
    }

    const can = (category: string, action: string) => {
        const categoryPermissions: Record<string, string[]> = permissions[category as keyof typeof permissions];
        if (!categoryPermissions) {
            return false;
        }
        const allowedRoles = categoryPermissions[action];
        if (!allowedRoles) {
            return false;
        }
        return userRoles.value.some((role: string) => allowedRoles.includes(role));
    };

    return {
        hasRole,
        can,
        userRoles,
        isAdmin,
        permissions,
    };
});
