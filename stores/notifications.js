import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getNotificationsComposable} from '@/composables/notificationsApiComposable';
import {useUserStore} from "~/stores/user.js";

export const useNotificationsStore = defineStore('notificationsStore', () => {
    const notificationsData = ref({});
    const loading = ref(false);
    const error = ref(null);
    const userStore = useUserStore();

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
            error.value = err;
            console.error('Error fetching response:', err);
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


    return { notificationsData, loading, error, getNotifications, beginPolling };
});