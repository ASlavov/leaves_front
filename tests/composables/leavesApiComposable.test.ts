import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getUserLeavesComposable,
  newLeaveComposable,
  cancelLeaveComposable,
  adminLeaveActionComposable,
  getLeavesTypesComposable,
  deleteLeaveTypeComposable,
  restoreLeaveTypeComposable,
  newLeaveTypeComposable,
  updateLeaveTypeComposable,
  getLeavesStatusesComposable,
  getLeavesAvailableDaysComposable,
  getAllUserLeavesComposable,
} from '~/composables/leavesApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('leavesApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getUserLeavesComposable — POST with userId in body', async () => {
    await getUserLeavesComposable(42);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getLeavesByUser', {
      method: 'POST',
      body: { userId: 42 },
    });
  });

  it('newLeaveComposable — POST with spread body', async () => {
    const body = { id: 1, leave_type_id: 2, start_date: '2024-01-01', end_date: '2024-01-05' };
    await newLeaveComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/newLeave', {
      method: 'POST',
      body,
    });
  });

  it('cancelLeaveComposable — POST to processLeave', async () => {
    const body = { leave_id: 1, user_editor: 2, status: 'cancelled' };
    await cancelLeaveComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/processLeave', {
      method: 'POST',
      body,
    });
  });

  it('adminLeaveActionComposable — POST to processLeave', async () => {
    const body = { leave_id: 1, user_editor: 1, status: 'approved' };
    await adminLeaveActionComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/processLeave', {
      method: 'POST',
      body,
    });
  });

  it('getLeavesTypesComposable — sends empty body by default', async () => {
    await getLeavesTypesComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getLeavesTypes', {
      method: 'POST',
      body: {},
    });
  });

  it('getLeavesTypesComposable — sends includeArchived flag when true', async () => {
    await getLeavesTypesComposable(true);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getLeavesTypes', {
      method: 'POST',
      body: { includeArchived: true },
    });
  });

  it('deleteLeaveTypeComposable — sends leaveTypeId in body', async () => {
    await deleteLeaveTypeComposable(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/deleteLeaveType', {
      method: 'POST',
      body: { leaveTypeId: 5 },
    });
  });

  it('restoreLeaveTypeComposable — sends leaveTypeId in body', async () => {
    await restoreLeaveTypeComposable(3);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/restoreLeaveType', {
      method: 'POST',
      body: { leaveTypeId: 3 },
    });
  });

  it('newLeaveTypeComposable — POST with body', async () => {
    const body = { name: 'Sick Leave', allowRollover: false };
    await newLeaveTypeComposable(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/newLeaveType', {
      method: 'POST',
      body,
    });
  });

  it('newLeaveTypeComposable — forwards all rules engine fields', async () => {
    const body = {
      name: 'Priority Sick Leave',
      allowRollover: false,
      priorityLevel: 1,
      allowWalletOverflow: false,
      overflowLeaveTypeId: null,
      accrualType: 'upfront' as const,
      allowNegativeBalance: false,
      maxNegativeBalance: 0,
      isHourly: false,
      hoursPerDay: 8,
      attachmentRequiredAfterDays: 3,
    };
    await newLeaveTypeComposable(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/newLeaveType', {
      method: 'POST',
      body,
    });
  });

  it('newLeaveTypeComposable — forwards is_hourly and hoursPerDay for hourly leave type', async () => {
    const body = {
      name: 'Half Day Leave',
      isHourly: true,
      hoursPerDay: 8,
    };
    await newLeaveTypeComposable(body);
    const calledBody = (mockFetch.mock.calls[0][1] as any).body;
    expect(calledBody.isHourly).toBe(true);
    expect(calledBody.hoursPerDay).toBe(8);
  });

  it('newLeaveTypeComposable — forwards wallet overflow fields', async () => {
    const body = {
      name: 'Annual Leave',
      allowWalletOverflow: true,
      overflowLeaveTypeId: 5,
    };
    await newLeaveTypeComposable(body);
    const calledBody = (mockFetch.mock.calls[0][1] as any).body;
    expect(calledBody.allowWalletOverflow).toBe(true);
    expect(calledBody.overflowLeaveTypeId).toBe(5);
  });

  it('newLeaveTypeComposable — forwards pro-rata accrual fields', async () => {
    const body = {
      name: 'First Year Leave',
      accrualType: 'pro_rata_monthly' as const,
      allowNegativeBalance: true,
      maxNegativeBalance: 3,
    };
    await newLeaveTypeComposable(body);
    const calledBody = (mockFetch.mock.calls[0][1] as any).body;
    expect(calledBody.accrualType).toBe('pro_rata_monthly');
    expect(calledBody.allowNegativeBalance).toBe(true);
    expect(calledBody.maxNegativeBalance).toBe(3);
  });

  it('updateLeaveTypeComposable — POST with body', async () => {
    const body = { id: 1, name: 'Updated Leave' };
    await updateLeaveTypeComposable(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/updateLeaveType', {
      method: 'POST',
      body,
    });
  });

  it('updateLeaveTypeComposable — forwards rules engine fields on update', async () => {
    const body = {
      id: 2,
      name: 'Updated Sick Leave',
      priorityLevel: 1,
      attachmentRequiredAfterDays: 2,
      isHourly: false,
    };
    await updateLeaveTypeComposable(body);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/updateLeaveType', {
      method: 'POST',
      body,
    });
  });

  it('getLeavesStatusesComposable — POST with no body', async () => {
    await getLeavesStatusesComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getLeavesStatuses', {
      method: 'POST',
    });
  });

  it('getLeavesAvailableDaysComposable — POST with userId in body', async () => {
    await getLeavesAvailableDaysComposable(7);
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getLeavesAvailableDays', {
      method: 'POST',
      body: { userId: 7 },
    });
  });

  it('getAllUserLeavesComposable — POST with no body', async () => {
    await getAllUserLeavesComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/leaves/getAllForAllUsers', {
      method: 'POST',
    });
  });
});
