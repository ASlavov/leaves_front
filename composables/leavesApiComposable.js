export const getUserLeavesComposable = (userId) => {
    return $fetch('/api/leaves/getLeavesByUser', {
        method: 'POST',
        body: {userId: userId},
    });
};

export const newLeaveComposable = (body) => {
    return $fetch('/api/leaves/newLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const cancelLeaveComposable = (body) => {
    return $fetch('/api/leaves/cancelLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const getLeavesTypesComposable = () => {
    return $fetch('/api/leaves/getLeavesTypes', {
        method: 'POST',
    });
};
export const getLeavesStatusesComposable = () => {
    return $fetch('/api/leaves/getLeavesStatuses', {
        method: 'POST',
    });
};
export const getLeavesAvailableDaysComposable = (userId) => {
    return $fetch('/api/leaves/getLeavesAvailableDays', {
        method: 'POST',
        body: {
            userId: userId,
        }
    });
};

export const getAllUserLeavesComposable = () => {
    return $fetch('/api/leaves/getAllForAllUsers', {
        method: 'POST',
    });
};