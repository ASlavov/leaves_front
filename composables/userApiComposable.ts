import type { EditUserPayload, UpdatePasswordPayload } from '~/types';

const getUserProfileComposable = async (userId: string | number) => {
    return retryFetch('/api/user/getProfile', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
}

export const getAllUsersComposable = async () => {
    return retryFetch('/api/user/getAllUsers', {
        method: 'POST',
    });
}

export const editUserComposable = async (body: EditUserPayload) => {
    return retryFetch('/api/user/editUser', {
        method: 'POST',
        body: {
            ...body
        },
    });
}

export const updatePasswordComposable = async (body: UpdatePasswordPayload) => {
    return retryFetch('/api/user/updatePassword', {
        method: 'POST',
        body: {
            ...body
        },
    });
}

export default getUserProfileComposable;
