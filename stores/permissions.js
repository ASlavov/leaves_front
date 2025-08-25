// permissions.js
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useUserStore } from '~/stores/user.js';

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
        return roles.map((role) => role.name);
    });

    const hasRole = (roleName) => {
        return userRoles.value.includes(roleName);
    };

    const can = (category, action) => {
        const categoryPermissions = permissions[category];
        if (!categoryPermissions) {
            return false;
        }
        const allowedRoles = categoryPermissions[action];
        if (!allowedRoles) {
            return false;
        }
        return userRoles.value.some((role) => allowedRoles.includes(role));
    };

    return {
        hasRole,
        can,
        userRoles,
        permissions,
    };
});
