import type {
  LeaveActionPayload,
  UserLeavesResponse,
  UserWithLeaves,
  LeaveResponse,
  LeaveType,
  LeaveTypeResponse,
  AvailableDaysEntry,
  BaseMessageResponse,
  LeaveStatus,
  UpdateLeaveTypePayload,
} from '~/types';

export const getUserLeavesComposable = (userId: string | number): Promise<UserLeavesResponse> => {
  return retryFetch<UserLeavesResponse>('/api/leaves/getLeavesByUser', {
    method: 'POST',
    body: { userId },
  });
};

export const newLeaveComposable = (body: LeaveActionPayload): Promise<LeaveResponse> => {
  return retryFetch<LeaveResponse>('/api/leaves/newLeave', {
    method: 'POST',
    body: { ...body },
  });
};

export const cancelLeaveComposable = (body: LeaveActionPayload): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/leaves/processLeave', {
    method: 'POST',
    body: { ...body },
  });
};

export const adminLeaveActionComposable = (
  body: LeaveActionPayload,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/leaves/processLeave', {
    method: 'POST',
    body: { ...body },
  });
};

export const getLeavesTypesComposable = (includeArchived = false): Promise<LeaveType[]> => {
  return retryFetch<LeaveType[]>('/api/leaves/getLeavesTypes', {
    method: 'POST',
    body: includeArchived ? { includeArchived: true } : {},
  });
};

export const deleteLeaveTypeComposable = (
  leaveTypeId: string | number,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/leaves/deleteLeaveType', {
    method: 'POST',
    body: { leaveTypeId },
  });
};

export const restoreLeaveTypeComposable = (
  leaveTypeId: string | number,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/leaves/restoreLeaveType', {
    method: 'POST',
    body: { leaveTypeId },
  });
};

export const newLeaveTypeComposable = (
  body: Omit<UpdateLeaveTypePayload, 'id'>,
): Promise<LeaveTypeResponse> => {
  return retryFetch<LeaveTypeResponse>('/api/leaves/newLeaveType', {
    method: 'POST',
    body,
  });
};

export const updateLeaveTypeComposable = (
  body: UpdateLeaveTypePayload,
): Promise<LeaveTypeResponse> => {
  return retryFetch<LeaveTypeResponse>('/api/leaves/updateLeaveType', {
    method: 'POST',
    body,
  });
};

export const getLeavesStatusesComposable = (): Promise<LeaveStatus[]> => {
  return retryFetch<LeaveStatus[]>('/api/leaves/getLeavesStatuses', {
    method: 'POST',
  });
};

export const getLeavesAvailableDaysComposable = (
  userId: string | number,
): Promise<AvailableDaysEntry[]> => {
  return retryFetch<AvailableDaysEntry[]>('/api/leaves/getLeavesAvailableDays', {
    method: 'POST',
    body: { userId },
  });
};

export const getAllUserLeavesComposable = (): Promise<UserWithLeaves[]> => {
  return retryFetch<UserWithLeaves[]>('/api/leaves/getAllForAllUsers', {
    method: 'POST',
  });
};

// ─── Reactive Variants (for use in components/SSR) ────────────────────────────

export const useUserLeaves = (userId: string | number) => {
  return useApiData<UserLeavesResponse>(
    `user-leaves-${userId}`,
    '/api/leaves/getLeavesByUser',
    { method: 'POST', body: { userId } },
    { lazy: true, server: true },
  );
};

export const useAllUserLeavesReactive = () => {
  return useApiData<UserWithLeaves[]>(
    'all-user-leaves',
    '/api/leaves/getAllForAllUsers',
    { method: 'POST' },
    { lazy: true, server: true },
  );
};

export const useLeavesTypesReactive = (includeArchived = false) => {
  return useApiData<LeaveType[]>(
    `leave-types-${includeArchived}`,
    '/api/leaves/getLeavesTypes',
    {
      method: 'POST',
      body: includeArchived ? { includeArchived: true } : {},
    },
    { lazy: true, server: true },
  );
};

export const useLeavesStatusesReactive = () => {
  return useApiData<LeaveStatus[]>(
    'leave-statuses',
    '/api/leaves/getLeavesStatuses',
    { method: 'POST' },
    { lazy: true, server: true },
  );
};

export const useLeavesAvailableDaysReactive = (userId: string | number) => {
  return useApiData<AvailableDaysEntry[]>(
    `available-days-${userId}`,
    '/api/leaves/getLeavesAvailableDays',
    { method: 'POST', body: { userId } },
    { lazy: true, server: true },
  );
};
