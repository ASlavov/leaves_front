export const getAllDepartmentsComposable = () => {
    const config = useRuntimeConfig()

    return retryFetch('/api/departments/getAll', {
        method: 'POST',
    });
};

export const newDepartmentComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/departments/newDepartment', {
        method: 'POST',
        body
    });
};
export const editDepartmentComposable = (body) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/departments/editDepartment', {
        method: 'POST',
        body,
    });
};

export const deleteDepartmentComposable = (department_id) => {
    const config = useRuntimeConfig()

    return retryFetch('/api/departments/deleteDepartment', {
        method: 'POST',
        body: {
            department_id: department_id,
        }
    });
};