import { defineStore } from 'pinia';
import { computed } from "vue";
import { useAuthStore } from '~/stores/auth.js';   // Import the auth store
import { useUserStore } from '~/stores/user.js';   // Import the user store
import { useLeavesStore } from '~/stores/leaves.js';   // Import the leaves store

export const useCentralStore = defineStore('centralStore', () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const leavesStore = useLeavesStore();

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
    // Centralized function to handle login, profile loading, and leaves loading
    async function loginAndLoadData() {
        try {
            const result = await userStore.refreshAndRestoreToken();
        } catch (err) {
            console.error('Error during login and loading data:', err);
        }
    }

    return {
        authStore: proxiedAuthStore,
        userStore: proxiedUserStore,
        leavesStore: proxiedLeavesStore,
    };
});
