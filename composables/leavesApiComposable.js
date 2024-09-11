export const getUserLeavesComposable = (userId) => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/getLeavesByUser', {
        method: 'POST',
        body: {userId: userId},
    });
};

export const newLeaveComposable = (body) => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/newLeave', {
        method: 'POST',
        body: {
            ...body
        },
    });
};

export const getLeavesTypesComposable = () => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/getLeavesTypes', {
        method: 'POST',
    });
};
export const getLeavesStatusesComposable = () => {
    const config = useRuntimeConfig()

    return $fetch('/api/leaves/getLeavesStatuses', {
        method: 'POST',
    });
};