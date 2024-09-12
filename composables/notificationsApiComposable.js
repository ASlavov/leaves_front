export const getNotificationsComposable = (userId) => {
    const config = useRuntimeConfig()

    return $fetch('/api/notifications/getNotifications', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
};