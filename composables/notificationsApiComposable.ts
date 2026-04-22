import type { Notification, BaseMessageResponse } from '~/types';

export const getNotificationsComposable = (userId: string | number): Promise<Notification[]> => {
  return retryFetch<Notification[]>('/api/notifications/getNotifications', {
    method: 'POST',
    body: { userId },
  });
};

export const markNotificationReadComposable = (
  notificationId: string | number,
): Promise<Notification[]> => {
  return retryFetch<Notification[]>('/api/notifications/markedRead', {
    method: 'POST',
    body: { notificationId },
  });
};

export const markNotificationUnreadComposable = (
  notificationId: string | number,
): Promise<Notification[]> => {
  return retryFetch<Notification[]>('/api/notifications/markedUnread', {
    method: 'POST',
    body: { notificationId },
  });
};

export const markAllNotificationsReadComposable = (): Promise<Notification[]> => {
  return retryFetch<Notification[]>('/api/notifications/markAllRead', {
    method: 'POST',
  });
};
