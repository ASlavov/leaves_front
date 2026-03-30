import type { EditUserPayload, AddUserPayload, UpdatePasswordPayload, User, UserResponse, MessageResponse } from '~/types';

const getUserProfileComposable = (userId: string | number): Promise<User> => {
    return retryFetch<User>('/api/user/getProfile', {
        method: 'POST',
        body: { userId },
    });
};

export const getAllUsersComposable = (): Promise<User[]> => {
    return retryFetch<User[]>('/api/user/getAllUsers', {
        method: 'POST',
    });
};

export const editUserComposable = (body: EditUserPayload): Promise<UserResponse> => {
    return retryFetch<UserResponse>('/api/user/editUser', {
        method: 'POST',
        body: { ...body },
    });
};

export const addUserComposable = (body: AddUserPayload): Promise<UserResponse> => {
    return retryFetch<UserResponse>('/api/user/addUser', {
        method: 'POST',
        body: { ...body },
    });
};

export const updatePasswordComposable = (body: UpdatePasswordPayload): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/user/updatePassword', {
        method: 'POST',
        body: { ...body },
    });
};

export default getUserProfileComposable;
