import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '~/stores/user';
import {
  getNotificationsComposable,
  markNotificationReadComposable,
  markNotificationUnreadComposable,
  markAllNotificationsReadComposable,
} from '@/composables/notificationsApiComposable';
import type { Notification } from '~/types';

export const useNotificationsStore = defineStore('notificationsStore', () => {
  const userStore = useUserStore();
  const { t } = useI18n();

  const notificationsData = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const connected = ref(false);
  // Track whether we are already subscribed to avoid duplicate listeners
  let _subscribed = false;

  // ─── Computed ────────────────────────────────────────────────────────────────

  const unreadCount = computed(() => notificationsData.value.filter((n) => !n.is_read).length);

  const unreadNotifications = computed(() =>
    notificationsData.value
      .filter((n) => !n.is_read)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  );

  const readNotifications = computed(() =>
    notificationsData.value
      .filter((n) => n.is_read)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function init() {
    try {
      await getNotifications();
      subscribeToChannel();
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  function subscribeToChannel() {
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$echo) return;
    // Guard: leave and re-subscribe to prevent duplicate listeners if init() is called again
    if (_subscribed) {
      nuxtApp.$echo.leave(`App.Models.User.${userStore.userId}`);
      _subscribed = false;
    }

    const userId = userStore.userId;

    nuxtApp.$echo
      .private(`App.Models.User.${userId}`)
      .notification((notification: Notification) => {
        // Prepend new notification only if not already present (dedup by id)
        const alreadyExists = notificationsData.value.some(
          (n) => n.id === (notification as any).id,
        );
        if (!alreadyExists) {
          notificationsData.value.unshift(notification);
        }
      });

    _subscribed = true;

    const pusherConn = (nuxtApp.$echo as any).connector?.pusher?.connection;
    if (pusherConn) {
      // Unbind first to avoid stacking handlers on every re-subscribe
      pusherConn.unbind('connected');
      pusherConn.unbind('disconnected');
      pusherConn.unbind('connecting');

      pusherConn.bind('connected', () => {
        connected.value = true;
        getNotifications();
      });
      pusherConn.bind('disconnected', () => {
        connected.value = false;
      });
      pusherConn.bind('connecting', () => {
        connected.value = false;
      });
    }
  }

  function unsubscribeFromChannel() {
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$echo) return;
    nuxtApp.$echo.leave(`App.Models.User.${userStore.userId}`);
  }

  async function getNotifications() {
    loading.value = true;
    try {
      const result = await getNotificationsComposable(userStore.userId as string | number);
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    } finally {
      loading.value = false;
    }
  }

  async function changeNotificationStatus(notificationId: string | number) {
    const notification = notificationsData.value.find((n) => n.id === notificationId);
    if (!notification) return;

    try {
      let result: Notification[];
      if (notification.is_read) {
        result = await markNotificationUnreadComposable(notificationId);
      } else {
        result = await markNotificationReadComposable(notificationId);
      }
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  async function markAllRead() {
    try {
      const result = await markAllNotificationsReadComposable();
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  function reset() {
    unsubscribeFromChannel();
    notificationsData.value = [];
    connected.value = false;
    error.value = null;
  }

  return {
    notificationsData,
    loading,
    error,
    connected,
    unreadCount,
    unreadNotifications,
    readNotifications,
    init,
    getNotifications,
    changeNotificationStatus,
    markAllRead,
    reset,
  };
});
