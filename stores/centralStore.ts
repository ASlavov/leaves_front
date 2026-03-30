import { defineStore } from 'pinia';
import { computed, ref } from "vue";
import { useAuthStore } from '~/stores/auth';   // Import the auth store
import { useUserStore } from '~/stores/user';   // Import the user store
import { useLeavesStore } from '~/stores/leaves'; // Import the leaves store
import { useEntitlementStore } from '~/stores/entitlement'; // Import the leaves store
import { useDepartmentsStore } from "~/stores/departments"; // Import the departments store
import { useNotificationsStore } from "~/stores/notifications";
import { usePermissionsStore } from "~/stores/permissions";   // Import the notifications store
import { useHolidaysStore } from "~/stores/holidays";
import { useWorkWeekStore } from "~/stores/workWeek";
import { useInvitationsStore } from "~/stores/invitations";

export const useCentralStore = defineStore('centralStore', () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const leavesStore = useLeavesStore();
    const entitlementStore = useEntitlementStore();
    const departmentsStore = useDepartmentsStore();
    const notificationsStore = useNotificationsStore();
    const permissionsStore = usePermissionsStore();
    const holidaysStore = useHolidaysStore();
    const workWeekStore = useWorkWeekStore();
    const invitationsStore = useInvitationsStore();

    const error = ref<string | null>(null);
    const loading = computed(() =>
        authStore.loading
        || userStore.loading
        || leavesStore.loading
        || departmentsStore.loading
        || notificationsStore.loading
    );
    const initialized = ref(false);
    const setError = (errorMessage: string | null) => {
        error.value = errorMessage;
    };

    const { $toast } = useNuxtApp();
    async function init() {
        // we're assuming user is authed
        try {
            if (userStore.userId) {
                // Run all store initialization in parallel
                await Promise.all([
                    userStore.init(),
                    departmentsStore.init(),
                    notificationsStore.init(),
                ]);

                await Promise.all([
                    userStore.getAllUsers(),
                    leavesStore.init(userStore.userId),
                    entitlementStore.init(),
                    holidaysStore.fetchHolidays(),
                    workWeekStore.fetchWorkWeek(),
                    invitationsStore.fetchInvitations(),
                ]);

                initialized.value = true
            } else {
                throw new Error('No user id');
            }
        }
        catch (err) {
            //console.log('initialization error');
            // Handle errors and set the error state
            setError((err as Error).message || String(err));
            initialized.value = false;
        }
    }

    async function logout() {
        try {
            notificationsStore.stopPollingNotifications();
            userStore.reset();
            leavesStore.reset();
            departmentsStore.reset();
            notificationsStore.reset();
            entitlementStore.reset();
            holidaysStore.reset();
            workWeekStore.reset();
            invitationsStore.reset();
            initialized.value = false;
            await authStore.logout();
        } catch (e) {
        } finally {
        }
    }

    const dynamicProxyHandler = {
        get(target: Record<string | symbol, any>, prop: string | symbol) {
            // Check if the property exists directly on the store
            if (prop in target) {
                const value = target[prop];
                // If it's a function, bind it to the store instance
                if (typeof value === 'function') {
                    return value.bind(target);
                } else {
                    return value; // Return the value as is
                }
            }
            // If property doesn't exist, return undefined
            return undefined;
        }
    };


    // Return proxied versions of the stores
    const proxiedAuthStore = new Proxy(authStore, dynamicProxyHandler);
    const proxiedUserStore = new Proxy(userStore, dynamicProxyHandler);
    const proxiedLeavesStore = new Proxy(leavesStore, dynamicProxyHandler);
    const proxiedDepartmentsStore = new Proxy(departmentsStore, dynamicProxyHandler);
    const proxiedNotificationsStore = new Proxy(notificationsStore, dynamicProxyHandler);
    const proxiedPermissionsStore = new Proxy(permissionsStore, dynamicProxyHandler);
    const proxiedEntitlementStore = new Proxy(entitlementStore, dynamicProxyHandler);
    const proxiedHolidaysStore = new Proxy(holidaysStore, dynamicProxyHandler);
    const proxiedWorkWeekStore = new Proxy(workWeekStore, dynamicProxyHandler);
    const proxiedInvitationsStore = new Proxy(invitationsStore, dynamicProxyHandler);

    return {
        error,
        loading,
        initialized,
        init,
        logout,
        authStore: proxiedAuthStore,
        userStore: proxiedUserStore,
        leavesStore: proxiedLeavesStore,
        departmentsStore: proxiedDepartmentsStore,
        notificationsStore: proxiedNotificationsStore,
        permissionsStore: proxiedPermissionsStore,
        entitlementStore: proxiedEntitlementStore,
        holidaysStore: proxiedHolidaysStore,
        workWeekStore: proxiedWorkWeekStore,
        invitationsStore: proxiedInvitationsStore,
    };
});
