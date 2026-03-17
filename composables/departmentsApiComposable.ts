import type { NewDepartmentPayload, EditDepartmentPayload } from '~/types';
export const getAllDepartmentsComposable = () => {

    return retryFetch('/api/departments/getAll', {
        method: 'POST',
    });
};

export const newDepartmentComposable = (body: NewDepartmentPayload) => {

    return retryFetch('/api/departments/newDepartment', {
        method: 'POST',
        body
    });
};
export const editDepartmentComposable = (body: EditDepartmentPayload) => {

    return retryFetch('/api/departments/editDepartment', {
        method: 'POST',
        body,
    });
};

export const deleteDepartmentComposable = (department_id: string | number) => {

    return retryFetch('/api/departments/deleteDepartment', {
        method: 'POST',
        body: {
            department_id: department_id,
        }
    });
};