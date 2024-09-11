// Check if session exists
export const checkSessionExists = async () => {
    try {
        const result = await $fetch('/api/auth/checkSessionExists', {
            method: 'GET',
        });

        return result && result.authenticated;
    } catch (error) {
        throw new Error('User has no session');
    }
};

// Authenticate user
export const authUser = async (params) => {
    try {
        const response = await $fetch('/api/auth/login', {
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
export const refreshSession = async () => {
    try {
        const result = await $fetch('/api/auth/refreshSession', {
            method: 'GET',
        });

        return result;
    } catch (error) {
        throw new Error('Failed to restore session');
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        const result = await $fetch('/api/auth/logout', {
            method: 'GET',
        });

        return result;
    } catch (error) {
        throw new Error('Failed to delete session');
    }
};
