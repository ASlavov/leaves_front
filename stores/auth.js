import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { checkSessionExistsComposable, authUserComposable, refreshSessionComposable, logoutUserComposable } from '~/composables/authApiComposable.js';
import {useNuxtApp} from "#app";

export const useAuthStore = defineStore('authStore', () => {
    const loading = ref(false);
    const error = ref(null);
    const isAuthenticated = computed(() => !!token.value);
    const userStore = useUserStore();

    const setError = (errorMessage) => {
        // Reset error to force reactivity
        error.value = null;
        setTimeout(() => {
            error.value = errorMessage; // Set the actual error message
        });
    };

    async function hasSession() {
        loading.value = true;

        try {
            const result = await checkSessionExistsComposable();
            return result;
        } catch (err) {
            setError('No session found for user');
        } finally {
            loading.value = false;
        }
    }

    async function authUserWrapper(userName, userPass) {
        loading.value = true;
        
        try {
            const result = await authUserComposable({ email: userName, password: userPass });
            if (result && result.userId) {
                userStore.setUserId(result.userId);
            }
        } catch (err) {
            setError('Μη έγκυρος e-mail ή κωδικός');
        } finally {
            loading.value = false;
        }
    }

    async function restoreSession() {
        try {
            const result = await refreshSessionComposable();
            if (result && result.userId) {
                userStore.setUserId(result.userId);
            }
        } catch (err) {
            setError('Δεν βρήκαμε υπάρχουσα συνεδρίαση');
        }
    }

    async function logout() {
        try {
            await logoutUserComposable();
        } catch (err) {
            setError('Δεν μπορέσαμε να σας αποσυνδέσουμε');
        }
    }

    return { loading, error, authUser: authUserWrapper, restoreSession, hasSession, logout };
});
