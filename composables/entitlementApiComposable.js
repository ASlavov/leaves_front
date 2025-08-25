export const getEntitledDaysForUserComposable = (userId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/get', {
        method: 'POST',
    });
}