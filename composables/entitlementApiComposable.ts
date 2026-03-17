import type { AddEntitlementPayload, UpdateEntitlementPayload } from '~/types';
export const getEntitledDaysForUserComposable = (userId: string | number) => {

    return retryFetch('/api/entitlement/get', {
        method: 'POST',
        body: {
            userId,
        }
    });
}

export const addEntitledDaysForUserComposable = (body: AddEntitlementPayload) => {

    return retryFetch('/api/entitlement/add', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}

export const addEntitledDaysForMultipleUsersComposable = (body: AddEntitlementPayload) => {

    return retryFetch('/api/entitlement/massLeaves', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const addEntitledRemoteDaysForMultipleUsersComposable = (body: AddEntitlementPayload) => {

    return retryFetch('/api/entitlement/massRemote', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const updateEntitledDaysForUserComposable = (body: UpdateEntitlementPayload) => {

    return retryFetch('/api/entitlement/update', {
        method: 'POST',
        body: {
            ...body,
        }
    });
}
export const deleteEntitledDaysForUserComposable = (entitlementId: string | number) => {

    return retryFetch('/api/entitlement/delete', {
        method: 'POST',
        body: {
            entitlementId,
        }
    });
}