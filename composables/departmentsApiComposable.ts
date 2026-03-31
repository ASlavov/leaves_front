import { useApiData } from './useApiData';
import type {
  NewDepartmentPayload,
  EditDepartmentPayload,
  Department,
  DepartmentResponse,
  BaseMessageResponse,
} from '~/types';

export const getAllDepartmentsComposable = (): Promise<Department[]> => {
  return retryFetch<Department[]>('/api/departments/getAll', {
    method: 'POST',
  });
};

export const newDepartmentComposable = (
  body: NewDepartmentPayload,
): Promise<DepartmentResponse> => {
  return retryFetch<DepartmentResponse>('/api/departments/newDepartment', {
    method: 'POST',
    body,
  });
};

export const editDepartmentComposable = (
  body: EditDepartmentPayload,
): Promise<DepartmentResponse> => {
  return retryFetch<DepartmentResponse>('/api/departments/editDepartment', {
    method: 'POST',
    body,
  });
};

export const deleteDepartmentComposable = (
  department_id: string | number,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/departments/deleteDepartment', {
    method: 'POST',
    body: { department_id },
  });
};

// ─── Reactive Variants ────────────────────────────────────────────────────────

export const useAllDepartments = () => {
  return useApiData<Department[]>(
    'all-departments',
    '/api/departments/getAll',
    { method: 'POST' },
    { lazy: true, server: true },
  );
};
