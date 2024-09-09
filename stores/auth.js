import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';  // Import user store
import authUserComposable from '~/composables/authApiComposable.js';

export const useAuthStore = defineStore('authStore', () => {
    const loading = ref(false);
    const error = ref(null);

    const userStore = useUserStore();  // Access the user store

    async function authUser(userName, userPass) {
        loading.value = true;

        try {
            // Call the composable to handle the authentication
            const result = await authUserComposable({
                email: userName,
                password: userPass,
            });

            if (result && result.userId) {
                // Save userId in the user store
                userStore.setUserId(result.userId);  // Use user store to set userId
            }
        } catch (err) {
            error.value = err;
            console.error('Error during authentication:', err);
        } finally {
            loading.value = false;
        }
    }

    // Restore session from the cookie (auto-called on page load)
    async function restoreSession() {
        try {
            const result = await $fetch('/api/session', {
                method: 'GET',
            });

            if (result && result.userId) {
                // maybe do things? reset the clock at the top if any?
                userStore.setUserId(result.userId);
            }
        } catch (err) {
            console.error('Failed to restore session:', err);
            error.value = err;
        }
    }

    return { loading, error, authUser, restoreSession };
});
