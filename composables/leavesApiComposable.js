export const getUserLeavesComposable = (userId) => {
    return retryFetch('/api/leaves/getLeavesByUser', {
        method: 'POST',
        body: {userId: userId},
    });
};

export const newLeaveComposable = (body) => {
    return retryFetch('/api/leaves/newLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const cancelLeaveComposable = (body) => {
    return retryFetch('/api/leaves/cancelLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const getLeavesTypesComposable = () => {
    return retryFetch('/api/leaves/getLeavesTypes', {
        method: 'POST',
    });
};
export const getLeavesStatusesComposable = () => {
    return retryFetch('/api/leaves/getLeavesStatuses', {
        method: 'POST',
    });
};
export const getLeavesAvailableDaysComposable = (userId) => {
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