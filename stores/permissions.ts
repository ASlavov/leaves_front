import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
        },
        work_week: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager'],
        },
        public_holidays: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager'],
        },
        invitations: {
            view: ['admin', 'hr-manager', 'head', 'user'],
            modify: ['admin', 'hr-manager', 'head', 'user'],
        },
    };

    const { t } = useI18n();

    const allRoles = computed(() => [
        { id: 1, key: 'admin', name: t('roles.admin') },
        { id: 2, key: 'hr-manager', name: t('roles.hr_manager') },
        { id: 3, key: 'head', name: t('roles.head') },
        { id: 4, key: 'user', name: t('roles.user') }
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
        allRoles,
    };
});
