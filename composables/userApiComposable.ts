import { useApiData } from './useApiData';
import type {
  EditUserPayload,
  AddUserPayload,
  UpdatePasswordPayload,
  User,
  UserResponse,
  BaseMessageResponse,
} from '~/types';

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

export const updatePasswordComposable = (
  body: UpdatePasswordPayload,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/user/updatePassword', {
    method: 'POST',
    body: { ...body },
  });
};

// ─── Reactive Variants ────────────────────────────────────────────────────────

export const useAllUsers = () => {
  return useApiData<User[]>(
    'all-users',
    '/api/user/getAllUsers',
    { method: 'POST' },
    { lazy: true, server: true },
  );
};

export default getUserProfileComposable;
