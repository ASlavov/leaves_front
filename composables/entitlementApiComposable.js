export const getEntitledDaysForUserComposable = (userId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/get', {
        method: 'POST',
        body: {
            userId,
        }
    });
}

export const addEntitledDaysForUserComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/add', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}

export const addEntitledDaysForMultipleUsersComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/massLeaves', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const addEntitledRemoteDaysForMultipleUsersComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/massRemote', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const updateEntitledDaysForUserComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/update', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const deleteEntitledDaysForUserComposable = (entitlementId) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/entitlement/delete', {
        method: 'POST',
        body: {
            entitlementId,
        }
    });
}