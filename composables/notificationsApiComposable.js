export const getNotificationsComposable = (userId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/notifications/getNotifications', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
};