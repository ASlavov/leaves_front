import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useUserStore } from '~/stores/user';
import {
  authUserComposable,
  logoutUserComposable,
  meComposable,
  refreshSessionComposable,
  updateUserPasswordComposable,
} from '~/composables/authApiComposable';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

export const useAuthStore = defineStore('authStore', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = computed(() => !!useCookie('auth_token').value);
  const userStore = useUserStore();
  const { t } = useI18n();

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };

  async function hasSession() {
    loading.value = true;

    try {
      const authToken = useCookie('auth_token');
      // Check for the existence of the cookie
      return !!authToken.value;
    } catch (err) {
      setError(t('errors.auth.noSession'));
    } finally {
      loading.value = false;
    }
  }

  async function authUserWrapper(userName: string, userPass: string) {
    loading.value = true;

    try {
      const result = await authUserComposable({ email: userName, password: userPass });
      if (result && result.userId) {
        userStore.setUserId(result.userId);
        return true; // Return true on success
      }
      return false; // Return false on failure
    } catch (err) {
      setError(t('errors.auth.invalidCredentials'));
      //throw new Error('Authentication failed');
    } finally {
      loading.value = false;
    }
  }

  async function restoreSession() {
    try {
      const result = await refreshSessionComposable();
      if (result && result.userId) {
        userStore.setUserId(result.userId);
      } else {
        const router = useRouter();
        await router.push('/auth/login');
      }
    } catch (err) {
      setError(t('errors.auth.sessionNotFound'));
    }
  }

  async function updatePassword(userId: string | number, oldPass: string, newPass: string) {
    try {
      const result = await updateUserPasswordComposable({
        userId,
        oldPass,
        newPass,
      });
      if (result) {
        return result;
      }
    } catch (err) {
      setError(t('errors.auth.sessionNotFound'));
    }
  }

  async function logout() {
    try {
      await logoutUserComposable();
    } catch (err) {
      setError(t('errors.auth.logoutFailed'));
    }
  }

  async function me() {
    try {
      const response = await meComposable();
      if (response && response.userId) {
        userStore.setUserId(response.userId);
      }
    } catch (err) {
      setError(t('errors.auth.fetchDataFailed'));
    }
  }

  return {
    loading,
    error,
    isAuthenticated,
    authUser: authUserWrapper,
    me,
    updatePassword,
    restoreSession,
    hasSession,
    logout,
  };
});
