export const getNotificationsComposable = (userId: string | number) => {

    return retryFetch('/api/notifications/getNotifications', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
};
export const markNotificationReadComposable = (notificationId: string | number) => {

    return retryFetch('/api/notifications/markedRead', {
        method: 'POST',
        body: {
            notificationId: notificationId
        },
    });
};
export const markNotificationUnreadComposable = (notificationId: string | number) => {

    return retryFetch('/api/notifications/markedUnread', {
        method: 'POST',
        body: {
            notificationId: notificationId
        },
    });
};