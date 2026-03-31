import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getNotificationsComposable,
  markNotificationReadComposable,
  markNotificationUnreadComposable,
} from '@/composables/notificationsApiComposable';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '~/stores/user';
import type { Notification } from '~/types';

export const useNotificationsStore = defineStore('notificationsStore', () => {
  const notificationsData = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let notificationsActive = false;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const userStore = useUserStore();
  const { t } = useI18n();

  function reset() {
    notificationsData.value = [];
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };
  async function init() {
    try {
      if (!notificationsData.value.length) {
        await getNotifications();
      }
      notificationsActive = true;
      beginPolling(); // Assuming polling happens after initial data load
    } catch (err) {
      setError(err ? String(err) : t('errors.common.unknownError'));
    }
  }

  async function getNotifications() {
    try {
      // Call the composable with the necessary parameters
      const result = await getNotificationsComposable(userStore.userId as string | number);

      if (result) {
        // Process the result and store it in notificationsData
        notificationsData.value = result;
      }
    } catch (err) {
      // Handle errors and set the error state
      setError(err ? String(err) : t('errors.common.unknownError'));
    } finally {
      // Ensure loading is set to false and any post-processing is done
      loading.value = false;
    }
  }

  async function changeNotificationStatus(notificationId: string | number) {
    try {
      // Call the composable with the necessary parameters
      const notificationStatus = notificationsData.value.find(
        (notif: Notification) => notif.id === notificationId,
      )?.is_read;

      let result: Notification[];
      if (notificationStatus) {
        result = await markNotificationUnreadComposable(notificationId);
      } else {
        result = await markNotificationReadComposable(notificationId);
      }

      if (result) {
        // Process the result and store it in notificationsData
        notificationsData.value = result;
      }
    } catch (err) {
      // Handle errors and set the error state
      setError(err ? String(err) : t('errors.common.unknownError'));
    } finally {
      // Ensure loading is set to false and any post-processing is done
      loading.value = false;
    }
  }

  function beginPolling() {
    if (notificationsActive) {
      // Set an interval to fetch notifications every 10 seconds
      intervalId = setInterval(async () => {
        await getNotifications();
      }, 10000);

      // Optional: Return a way to stop the polling (clear the interval)
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }

  function stopPollingNotifications() {
    if (notificationsActive) {
      notificationsActive = false;
      if (intervalId) clearInterval(intervalId);
    }
  }

  return {
    notificationsData,
    loading,
    error,
    getNotifications,
    beginPolling,
    init,
    reset,
    stopPollingNotifications,
    notificationsActive,
    changeNotificationStatus,
  };
});
