export const getAllDepartmentsComposable = () => {
    const config = useRuntimeConfig()

    return $fetch('/api/departments/getAll', {
        method: 'POST',
    });
};

export const newDepartmentComposable = (name, related_departments) => {
    const config = useRuntimeConfig()

    return $fetch('/api/departments/newDepartment', {
        method: 'POST',
        body: {
            name: name,
            related_departments: related_departments,
        }
    });
};
export const editDepartmentComposable = (body) => {
    const config = useRuntimeConfig()

    return $fetch('/api/departments/editDepartment', {
        method: 'POST',
        body: {
            ...body,
        }
    });
};

export const deleteDepartmentComposable = (department_id) => {
    const config = useRuntimeConfig()

    return $fetch('/api/departments/deleteDepartment', {
        method: 'POST',
        body: {
            department_id: department_id,
        }
    });
};