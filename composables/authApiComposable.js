// Authenticate user
export const authUserComposable = async (params) => {
    try {
        const response = await retryFetch('/api/auth/login', {
            method: 'POST',
            body: {
                email: params.email,
                password: params.password,
            },
        });

        if (response.userId) {
            return response;
        }

        throw new Error('Invalid credentials');
    } catch (error) {
        throw new Error('Invalid credentials');
    }
};

// Restore session
export const refreshSessionComposable = async () => {
    try {
        const result = await retryFetch('/api/auth/refreshSession', {
            method: 'GET',
        });

        return result;
    } catch (error) {
        throw new Error('Failed to restore session');
    }
};

// Logout user
export const logoutUserComposable = async () => {
    try {
        const result = await retryFetch('/api/auth/logout', {
            method: 'GET',
        });

        return result;
    } catch (error) {
        throw new Error('Failed to delete session');
    }
};

export const updateUserPasswordComposable = async ( body ) => {
    try {
        return await retryFetch('/api/auth/updatePassword', {
            method: 'POST',
            body
        });
    } catch (error) {
        throw new Error('Failed to update password');
    }
}