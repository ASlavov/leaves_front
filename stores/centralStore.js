import { defineStore } from 'pinia';
import { computed,ref } from "vue";
import { useAuthStore } from '~/stores/auth.js';   // Import the auth store
import { useUserStore } from '~/stores/user.js';   // Import the user store
import { useLeavesStore } from '~/stores/leaves.js'; // Import the leaves store
import { useDepartmentsStore } from "~/stores/departments.js"; // Import the departments store
import { useNotificationsStore } from "~/stores/notifications.js";   // Import the notifications store

export const useCentralStore = defineStore('centralStore', () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const leavesStore = useLeavesStore();
    const departmentsStore = useDepartmentsStore();
    const notificationsStore = useNotificationsStore();
    
    const error = ref(null);
    const loading = ref(false);

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
            loading.value = true;

            if(userStore.userId) {
                // Run all store initialization in parallel
                await Promise.all([
                    userStore.init(),
                    departmentsStore.init(),
                    notificationsStore.init(),
                ]);
                await leavesStore.init(userStore.userId);
            }
        }
        catch (err) {
            // Handle errors and set the error state
            setError('Δεν μπορέσαμε να αρικοποιήσουμε τα δεδομένα σας');
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
            //notificationsStore.beginPolling();
        }
    }

    // Proxy to safely expose stores without direct access
    const proxyHandler = {
        get(target, prop) {
            if (prop in target) {
                const value = target[prop];
                // Prevent exposing entire reactive objects, return serializable properties only
                if (typeof value === 'function') {
                    return value.bind(target);
                } else {
                    return value;
                }
            } else {
                return undefined;
            }
        }
    };

    // Return proxied versions of the stores
    const proxiedAuthStore = new Proxy(authStore, proxyHandler);
    const proxiedUserStore = new Proxy(userStore, proxyHandler);
    const proxiedLeavesStore = new Proxy(leavesStore, proxyHandler);
    const proxiedDepartmentsStore = new Proxy(departmentsStore, proxyHandler);
    const proxiedNotificationsStore = new Proxy(notificationsStore, proxyHandler);

    return {
        init,
        error,
        loading,
        authStore: proxiedAuthStore,
        userStore: proxiedUserStore,
        leavesStore: proxiedLeavesStore,
        departmentsStore: proxiedDepartmentsStore,
        notificationsStore: proxiedNotificationsStore,
    };
});
