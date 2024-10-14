// permissions.js
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useUserStore } from '~/stores/user.js';

export const usePermissionsStore = defineStore('permissionsStore', () => {
    const userStore = useUserStore();
    const permissions = {
        profile_leave_balance: {
            view: ['admin', 'hr', 'head', 'user'],
            request_leave: ['hr', 'head', 'user'],
            cancel_leave: ['hr', 'head', 'user'],
            accept_leave: ['admin', 'hr', 'head'],
            decline_leave: ['admin', 'hr', 'head'],
        },
        profile_info: {
            view: ['admin', 'hr', 'head', 'user'],
            modify: ['admin', 'hr', 'head', 'user'],
            change_password: ['admin', 'hr', 'head', 'user'],
        },
        all_users: {
            view: ['admin', 'hr', 'head', 'user'],
            modify: ['admin', 'hr', 'head'],
        },
        group: {
            view: ['admin', 'hr', 'head', 'user'],
            modify: ['admin', 'hr'],
        },
        leave_types: {
            view: ['admin', 'hr', 'head'],
            modify: ['admin', 'hr'],
        }
    };

    const userRoles = computed(() => {
        const roles = userStore.userInfo.value?.roles || [];
        console.log('roles:', roles);
        return roles.map((role) => role.name);
    });

    const hasRole = (roleName) => {
        return userRoles.value.includes(roleName);
    };

    const can = (category, action) => {
        const categoryPermissions = permissions[category];
        if (!categoryPermissions) {
            console.log('#1 wtf is ', categoryPermissions);
            return false;
        }
        const allowedRoles = categoryPermissions[action];
        if (!allowedRoles) {
            console.log('#2 wtf is ', action);
            return false;
        }
        console.log('#3 wtf is ', userRoles.value);
        return userRoles.value.some((role) => allowedRoles.includes(role));
    };

    return {
        hasRole,
        can,
        permissions,
    };
});
