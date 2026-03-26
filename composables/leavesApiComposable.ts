import type { LeaveActionPayload } from '~/types';
export const getUserLeavesComposable = (userId: string | number) => {
    return retryFetch('/api/leaves/getLeavesByUser', {
        method: 'POST',
        body: { userId: userId },
    });
};

export const newLeaveComposable = (body: LeaveActionPayload) => {
    return retryFetch('/api/leaves/newLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const cancelLeaveComposable = (body: LeaveActionPayload) => {
    return retryFetch('/api/leaves/processLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const adminLeaveActionComposable = (body: LeaveActionPayload) => {
    return retryFetch('/api/leaves/processLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const getLeavesTypesComposable = (includeArchived = false) => {
    return retryFetch('/api/leaves/getLeavesTypes', {
        method: 'POST',
        body: includeArchived ? { includeArchived: true } : {},
    });
};

export const deleteLeaveTypeComposable = (leaveTypeId: string | number) => {
    return retryFetch('/api/leaves/deleteLeaveType', {
        method: 'POST',
        body: { leaveTypeId },
    });
};

export const restoreLeaveTypeComposable = (leaveTypeId: string | number) => {
    return retryFetch('/api/leaves/restoreLeaveType', {
        method: 'POST',
        body: { leaveTypeId },
    });
};

export const newLeaveTypeComposable = (name: string) => {
    return retryFetch('/api/leaves/newLeaveType', {
        method: 'POST',
        body: { name },
    });
};

export const updateLeaveTypeComposable = (body: { id: string | number; name: string }) => {
    return retryFetch('/api/leaves/updateLeaveType', {
        method: 'POST',
        body,
    });
};

export const getLeavesStatusesComposable = () => {
    return retryFetch('/api/leaves/getLeavesStatuses', {
        method: 'POST',
    });
};
export const getLeavesAvailableDaysComposable = (userId: string | number) => {
    return retryFetch('/api/leaves/getLeavesAvailableDays', {
        method: 'POST',
        body: {
            userId: userId,
        }
    });
};

export const getAllUserLeavesComposable = () => {
    return retryFetch('/api/leaves/getAllForAllUsers', {
        method: 'POST',
    });
};