
const getUserProfileComposable = async (userId) => {
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

export const editUserComposable = async (body) => {
    return retryFetch('/api/user/editUser', {
        method: 'POST',
        body: {
            ...body
        },
    });
}

export const updatePasswordComposable = async (body) => {
    return retryFetch('/api/user/updatePassword', {
        method: 'POST',
        body: {
            ...body
        },
    });
}

export default getUserProfileComposable;
