import type { AuthUserPayload, AuthResponse, BaseMessageResponse, User } from '~/types';

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
  } catch {
    throw new Error('Invalid credentials');
  }
};

export const refreshSessionComposable = async (): Promise<AuthResponse> => {
  try {
    return await retryFetch<AuthResponse>('/api/auth/refreshSession', {
      method: 'GET',
    });
  } catch {
    throw new Error('Failed to restore session');
  }
};

export const logoutUserComposable = async (): Promise<BaseMessageResponse> => {
  try {
    return await retryFetch<BaseMessageResponse>('/api/auth/logout', {
      method: 'GET',
    });
  } catch {
    throw new Error('Failed to delete session');
  }
};

export const updateUserPasswordComposable = async (
  body: AuthUserPayload,
): Promise<BaseMessageResponse> => {
  try {
    return await retryFetch<BaseMessageResponse>('/api/auth/updatePassword', {
      method: 'POST',
      body,
    });
  } catch {
    throw new Error('Failed to update password');
  }
};

export const meComposable = async (): Promise<User> => {
  try {
    return await retryFetch<User>('/api/me', {
      method: 'POST',
    });
  } catch {
    throw new Error('Failed to get self data');
  }
};
