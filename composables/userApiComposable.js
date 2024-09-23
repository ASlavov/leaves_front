
const getUserProfileComposable = async (userId) => {
    return $fetch('/api/user/getProfile', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
}

export const getAllUsersComposable = async () => {
    return $fetch('/api/user/getAllUsers', {
        method: 'POST',
    });
}

export const editUserComposable = async (body) => {
    return $fetch('/api/user/editUser', {
        method: 'POST',
        body: {
            ...body
        },
    });
}

export default getUserProfileComposable;
