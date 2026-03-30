import type { NewDepartmentPayload, EditDepartmentPayload, Department, DepartmentResponse, MessageResponse } from '~/types';

export const getAllDepartmentsComposable = (): Promise<Department[]> => {
    return retryFetch<Department[]>('/api/departments/getAll', {
        method: 'POST',
    });
};

export const newDepartmentComposable = (body: NewDepartmentPayload): Promise<DepartmentResponse> => {
    return retryFetch<DepartmentResponse>('/api/departments/newDepartment', {
        method: 'POST',
        body,
    });
};

export const editDepartmentComposable = (body: EditDepartmentPayload): Promise<DepartmentResponse> => {
    return retryFetch<DepartmentResponse>('/api/departments/editDepartment', {
        method: 'POST',
        body,
    });
};

export const deleteDepartmentComposable = (department_id: string | number): Promise<MessageResponse> => {
    return retryFetch<MessageResponse>('/api/departments/deleteDepartment', {
        method: 'POST',
        body: { department_id },
    });
};
