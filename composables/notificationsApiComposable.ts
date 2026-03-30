import type { Notification, MessageResponse } from '~/types';

export const getNotificationsComposable = (userId: string | number): Promise<Notification[]> => {
    return retryFetch<Notification[]>('/api/notifications/getNotifications', {
        method: 'POST',
        body: { userId },
    });
};

export const markNotificationReadComposable = (notificationId: string | number): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/notifications/markedRead', {
        method: 'POST',
        body: { notificationId },
    });
};

export const markNotificationUnreadComposable = (notificationId: string | number): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/notifications/markedUnread', {
        method: 'POST',
        body: { notificationId },
    });
};
