import { useApiData } from './useApiData';
import type {
  EditUserPayload,
  AddUserPayload,
  UpdatePasswordPayload,
  User,
  UserResponse,
  BaseMessageResponse,
  DashboardPreferences,
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

export const deleteUserComposable = (userId: number | string) => {
  return retryFetch(`/api/user/delete/${userId}`, { method: 'DELETE' });
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

export const getDashboardPreferencesComposable = (): Promise<DashboardPreferences> => {
  return retryFetch<DashboardPreferences>('/api/user/dashboardPreferences', {
    method: 'GET',
  });
};

export const updateDashboardPreferencesComposable = (
  body: DashboardPreferences,
): Promise<DashboardPreferences> => {
  return retryFetch<DashboardPreferences>('/api/user/dashboardPreferences', {
    method: 'PUT',
    body: { ...body },
  });
};

export default getUserProfileComposable;
