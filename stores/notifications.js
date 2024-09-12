import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getNotificationsComposable} from '@/composables/notificationsApiComposable';
import {useUserStore} from "~/stores/user.js";

export const useNotificationsStore = defineStore('notificationsStore', () => {
    const notificationsData = ref({});
    const loading = ref(false);
    const error = ref(null);
    const userStore = useUserStore();

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };
    async function init() {
        try {
            if (!notificationsData.value.length) {
                await getNotifications();
            }
            beginPolling();  // Assuming polling happens after initial data load
        } catch (err) {
            setError(err);
        }
    }

    async function getNotifications() {
        try {
            // Call the composable with the necessary parameters
            const result = await getNotificationsComposable(userStore.userId);

            if (result) {
                // Process the result and store it in userData
                notificationsData.value = result;
            }
        } catch (err) {
            // Handle errors and set the error state
            setError(err);
        } finally {
            // Ensure loading is set to false and any post-processing is done
            loading.value = false;
        }
    }

    function beginPolling() {
        // Set an interval to fetch notifications every 10 seconds
        const intervalId = setInterval(async () => {
            await getNotifications();
        }, 10000);

        // Optional: Return a way to stop the polling (clear the interval)
        return () => clearInterval(intervalId);
    }


    return { notificationsData, loading, error, getNotifications, beginPolling, init };
});