import { defineStore } from 'pinia';
import { computed,ref } from "vue";
import { useAuthStore } from '~/stores/auth.js';   // Import the auth store
import { useUserStore } from '~/stores/user.js';   // Import the user store
import { useLeavesStore } from '~/stores/leaves.js'; // Import the leaves store
import { useEntitlementStore } from '~/stores/entitlement.js'; // Import the leaves store
import { useDepartmentsStore } from "~/stores/departments.js"; // Import the departments store
import { useNotificationsStore } from "~/stores/notifications.js";
import { usePermissionsStore } from "~/stores/permissions.js";   // Import the notifications store

export const useCentralStore = defineStore('centralStore', () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const leavesStore = useLeavesStore();
    const entitlementStore = useEntitlementStore();
    const departmentsStore = useDepartmentsStore();
    const notificationsStore = useNotificationsStore();
    const permissionsStore = usePermissionsStore();

    const error = ref(null);
    const loading = computed(() =>
        authStore.loading
        || userStore.loading
        || leavesStore.loading
        || departmentsStore.loading
        || notificationsStore.loading
    );
    const initialized = ref(false);
    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };

    const { $toast } = useNuxtApp();
    async function init(){
        // we're assuming user is authed
        try {
            if(userStore.userId) {
                console.log('initializing');
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
                ]);

                initialized.value = true
            }
        }
        catch (err) {
            console.log('initialization error');
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να αρχικοποιήσουμε τα δεδομένα σας');
            initialized.value = false;
        }
    }

    async function logout (){
        try {
            userStore.reset();
            leavesStore.reset();
            departmentsStore.reset();
            notificationsStore.reset();
            entitlementStore.reset();
            initialized.value = false;
            await authStore.logout();
        } catch (e) {
        } finally {
        }
    }

    const dynamicProxyHandler = {
        get(target, prop) {
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
    };
});
