import { defineStore } from 'pinia';
import { computed } from "vue";
import { useAuthStore } from '~/stores/auth.js';   // Import the auth store
import { useUserStore } from '~/stores/user.js';   // Import the user store
import { useLeavesStore } from '~/stores/leaves.js'; // Import the leaves store
import { useDepartmentsStore } from "~/stores/departments.js";   // Import the departments store

export const useCentralStore = defineStore('centralStore', () => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const leavesStore = useLeavesStore();
    const departmentsStore = useDepartmentsStore();

    const loading = ref(false);
    async function init(){
        // we're assuming user is authed
        try {
            loading.value = true;
            if (userStore.userId) {
                if(!Object.keys(userStore.userInfo).length) {
                    await userStore.loadUserProfile();
                }
                if(!Object.keys(leavesStore.leavesData.currentUser).length) {
                    await leavesStore.getAll(userStore.userId);
                }
                if(!Object.keys(leavesStore.leavesData.leavesTypes).length) {
                    await leavesStore.getLeavesTypes();
                }
                if(!Object.keys(departmentsStore.departmentsData).length) {
                    await departmentsStore.getAll();
                }
                if(!Object.keys(leavesStore.leavesData.leavesStatuses).length) {
                    await leavesStore.getLeavesStatuses();
                }
            }
        }
        catch (err) {
            // Handle errors and set the error state
            console.error('Error initializing response:', err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
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

    return {
        authStore: proxiedAuthStore,
        userStore: proxiedUserStore,
        leavesStore: proxiedLeavesStore,
        departmentsStore: proxiedDepartmentsStore,
        init,
    };
});
