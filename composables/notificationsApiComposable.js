export const getNotificationsComposable = (userId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/notifications/getNotifications', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
};
export const markNotificationReadComposable = (notificationId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/notifications/markedRead', {
        method: 'POST',
        body: {
            notificationId: notificationId
        },
    });
};
export const markNotificationUnreadComposable = (notificationId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/notifications/markedUnread', {
        method: 'POST',
        body: {
            notificationId: notificationId
        },
    });
};