import type { AuthUserPayload, AuthResponse, MessageResponse, User } from '~/types';

export const authUserComposable = async (params: AuthUserPayload): Promise<AuthResponse> => {
    try {
        const response = await retryFetch<AuthResponse>('/api/auth/login', {
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

export const refreshSessionComposable = async (): Promise<AuthResponse> => {
    try {
        return await retryFetch<AuthResponse>('/api/auth/refreshSession', {
            method: 'GET',
        });
    } catch (error) {
        throw new Error('Failed to restore session');
    }
};

export const logoutUserComposable = async (): Promise<MessageResponse> => {
    try {
        return await retryFetch<MessageResponse>('/api/auth/logout', {
            method: 'GET',
        });
    } catch (error) {
        throw new Error('Failed to delete session');
    }
};

export const updateUserPasswordComposable = async (body: AuthUserPayload): Promise<MessageResponse> => {
    try {
        return await retryFetch<MessageResponse>('/api/auth/updatePassword', {
            method: 'POST',
            body,
        });
    } catch (error) {
        throw new Error('Failed to update password');
    }
};

export const meComposable = async (): Promise<User> => {
    try {
        return await retryFetch<User>('/api/me', {
            method: 'POST',
        });
    } catch (error) {
        throw new Error('Failed to get self data');
    }
};
