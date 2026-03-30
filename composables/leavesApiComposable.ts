import type {
    LeaveActionPayload,
    UserLeavesResponse,
    UserWithLeaves,
    LeaveResponse,
    LeaveType,
    LeaveTypeResponse,
    AvailableDaysEntry,
    MessageResponse,
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

export const cancelLeaveComposable = (body: LeaveActionPayload): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/leaves/processLeave', {
        method: 'POST',
        body: { ...body },
    });
};

export const adminLeaveActionComposable = (body: LeaveActionPayload): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/leaves/processLeave', {
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

export const deleteLeaveTypeComposable = (leaveTypeId: string | number): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/leaves/deleteLeaveType', {
        method: 'POST',
        body: { leaveTypeId },
    });
};

export const restoreLeaveTypeComposable = (leaveTypeId: string | number): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/leaves/restoreLeaveType', {
        method: 'POST',
        body: { leaveTypeId },
    });
};

export const newLeaveTypeComposable = (body: {
    name: string;
    dependsOnTypeId?: string | number | null;
    allowRollover?: boolean;
}): Promise<LeaveTypeResponse> => {
    return retryFetch<LeaveTypeResponse>('/api/leaves/newLeaveType', {
        method: 'POST',
        body,
    });
};

export const updateLeaveTypeComposable = (body: {
    id: string | number;
    name: string;
    dependsOnTypeId?: string | number | null;
    allowRollover?: boolean;
}): Promise<LeaveTypeResponse> => {
    return retryFetch<LeaveTypeResponse>('/api/leaves/updateLeaveType', {
        method: 'POST',
        body,
    });
};

export const getLeavesStatusesComposable = (): Promise<{ id: number | string; name: string }[]> => {
    return retryFetch<{ id: number | string; name: string }[]>('/api/leaves/getLeavesStatuses', {
        method: 'POST',
    });
};

export const getLeavesAvailableDaysComposable = (userId: string | number): Promise<AvailableDaysEntry[]> => {
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
