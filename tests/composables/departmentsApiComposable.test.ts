import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getAllDepartmentsComposable,
  newDepartmentComposable,
  editDepartmentComposable,
  deleteDepartmentComposable,
} from '~/composables/departmentsApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('departmentsApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getAllDepartmentsComposable — POST with no body', async () => {
    await getAllDepartmentsComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/departments/getAll', {
      method: 'POST',
    });
  });

  it('newDepartmentComposable — POST with body', async () => {
    const body = { name: 'Engineering', head: 1, users: [2, 3] };
    await newDepartmentComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/departments/newDepartment', {
      method: 'POST',
      body,
    });
  });

  it('editDepartmentComposable — POST with body', async () => {
    const body = { department_id: 1, name: 'Engineering', head: 1 };
    await editDepartmentComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/departments/editDepartment', {
      method: 'POST',
      body,
    });
  });

  it('deleteDepartmentComposable — POST with department_id in body', async () => {
    await deleteDepartmentComposable(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/departments/deleteDepartment', {
      method: 'POST',
      body: { department_id: 5 },
    });
  });

  it('deleteDepartmentComposable — accepts string id', async () => {
    await deleteDepartmentComposable('10');
    expect(mockFetch).toHaveBeenCalledWith('/api/departments/deleteDepartment', {
      method: 'POST',
      body: { department_id: '10' },
    });
  });
});
