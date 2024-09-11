import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { checkSessionExists, authUser, refreshSession, logoutUser } from '~/composables/authApiComposable.js';

export const useAuthStore = defineStore('authStore', () => {
    const loading = ref(false);
    const error = ref(null);
    const isAuthenticated = computed(() => !!token.value);
    const userStore = useUserStore();

    async function hasSession() {
        loading.value = true;
        error.value = null;
        try {
            const result = await checkSessionExists();
            return result;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    async function authUserWrapper(userName, userPass) {
        loading.value = true;
        error.value = null;
        try {
            const result = await authUser({ email: userName, password: userPass });
            if (result && result.userId) {
                userStore.setUserId(result.userId);
            }
        } catch (err) {
            error.value = 'Invalid email or password';
            console.error('Error during authentication:', err);
        } finally {
            loading.value = false;
        }
    }

    async function restoreSession() {
        try {
            const result = await refreshSession();
            if (result && result.userId) {
                userStore.setUserId(result.userId);
            }
        } catch (err) {
            console.error('Failed to restore session:', err);
            error.value = err;
        }
    }

    async function logout() {
        try {
            await logoutUser();
        } catch (err) {
            console.error('Failed to delete session:', err);
            error.value = err;
        }
    }

    return { loading, error, authUser: authUserWrapper, restoreSession, hasSession, logout };
});
