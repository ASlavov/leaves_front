import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import {
  recordAdminLeaveComposable,
  previewTerminationComposable,
  terminateUserComposable,
} from '~/composables/adminApiComposable';
import { useAdminStore } from '~/stores/admin';

vi.mock('~/composables/adminApiComposable', () => ({
  recordAdminLeaveComposable: vi.fn(),
  previewTerminationComposable: vi.fn(),
  terminateUserComposable: vi.fn(),
}));

const mockRecord = vi.mocked(recordAdminLeaveComposable);
const mockPreview = vi.mocked(previewTerminationComposable);
const mockTerminate = vi.mocked(terminateUserComposable);

describe('useAdminStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  // ── recordAdministrativeLeave ─────────────────────────────────────────────

  describe('recordAdministrativeLeave', () => {
    it('calls recordAdminLeaveComposable with the provided payload', async () => {
      mockRecord.mockResolvedValueOnce({
        message: 'Administrative leave recorded successfully.',
        leave: { id: 42 },
        warning: null,
      } as any);

      const store = useAdminStore();
      const payload = {
        userId: 3,
        leaveTypeId: 1,
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        administrativeReason: 'Correcting historical record',
      };

      await store.recordAdministrativeLeave(payload as any);

      expect(mockRecord).toHaveBeenCalledWith(payload);
    });

    it('sets loading to false after success', async () => {
      mockRecord.mockResolvedValueOnce({ message: 'ok', leave: { id: 1 }, warning: null } as any);

      const store = useAdminStore();
      await store.recordAdministrativeLeave({ userId: 1, leaveTypeId: 1, startDate: '2026-01-01', endDate: '2026-01-01', administrativeReason: 'Test reason here' } as any);

      expect(store.loading).toBe(false);
    });

    it('sets error key on failure', async () => {
      mockRecord.mockRejectedValueOnce(new Error('Unauthorized'));

      const store = useAdminStore();
      await store.recordAdministrativeLeave({ userId: 1, leaveTypeId: 1, startDate: '2026-01-01', endDate: '2026-01-01', administrativeReason: 'Test reason' } as any).catch(() => {});

      expect(store.error).not.toBeNull();
    });

    it('sets loading to false after failure', async () => {
      mockRecord.mockRejectedValueOnce(new Error('fail'));

      const store = useAdminStore();
      await store.recordAdministrativeLeave({ userId: 1, leaveTypeId: 1, startDate: '2026-01-01', endDate: '2026-01-01', administrativeReason: 'Test reason' } as any).catch(() => {});

      expect(store.loading).toBe(false);
    });

    it('clears error before each call', async () => {
      mockRecord.mockRejectedValueOnce(new Error('first error'));
      const store = useAdminStore();
      await store.recordAdministrativeLeave({ userId: 1, leaveTypeId: 1, startDate: '2026-01-01', endDate: '2026-01-01', administrativeReason: 'Test reason' } as any).catch(() => {});
      expect(store.error).not.toBeNull();

      mockRecord.mockResolvedValueOnce({ message: 'ok', leave: { id: 2 }, warning: null } as any);
      await store.recordAdministrativeLeave({ userId: 1, leaveTypeId: 1, startDate: '2026-02-01', endDate: '2026-02-01', administrativeReason: 'Second entry' } as any);
      expect(store.error).toBeNull();
    });
  });

  // ── previewTermination ────────────────────────────────────────────────────

  describe('previewTermination', () => {
    it('calls previewTerminationComposable with userId and date', async () => {
      const mockData = {
        user: { id: 7, name: 'Jane Doe' },
        termination_date: '2026-08-31',
        future_leaves: [],
        spanning_leaves: [],
        total_affected: 0,
      };
      mockPreview.mockResolvedValueOnce(mockData as any);

      const store = useAdminStore();
      const result = await store.previewTermination(7, '2026-08-31');

      expect(mockPreview).toHaveBeenCalledWith(7, '2026-08-31');
      expect(result).toEqual(mockData);
    });

    it('returns preview data including future_leaves and spanning_leaves', async () => {
      const mockData = {
        user: { id: 5, name: 'John Smith' },
        termination_date: '2026-06-15',
        future_leaves: [
          { id: 10, leave_type: 'Annual Leave', start_date: '2026-07-01', end_date: '2026-07-05', status: 'approved', action: 'cancel' },
        ],
        spanning_leaves: [
          { id: 9, leave_type: 'Sick Leave', start_date: '2026-06-10', end_date: '2026-06-20', status: 'approved', action: 'truncate', new_end_date: '2026-06-15' },
        ],
        total_affected: 2,
      };
      mockPreview.mockResolvedValueOnce(mockData as any);

      const store = useAdminStore();
      const result = await store.previewTermination(5, '2026-06-15');

      expect(result?.future_leaves).toHaveLength(1);
      expect(result?.spanning_leaves).toHaveLength(1);
      expect(result?.total_affected).toBe(2);
    });

    it('sets error on failure', async () => {
      mockPreview.mockRejectedValueOnce(new Error('User not found'));

      const store = useAdminStore();
      await store.previewTermination(999, '2026-01-01').catch(() => {});

      expect(store.error).not.toBeNull();
    });

    it('sets loading to false after success', async () => {
      mockPreview.mockResolvedValueOnce({ user: { id: 1, name: 'A' }, future_leaves: [], spanning_leaves: [], total_affected: 0, termination_date: '2026-01-01' } as any);

      const store = useAdminStore();
      await store.previewTermination(1, '2026-01-01');

      expect(store.loading).toBe(false);
    });

    it('sets loading to false after failure', async () => {
      mockPreview.mockRejectedValueOnce(new Error('fail'));

      const store = useAdminStore();
      await store.previewTermination(1, '2026-01-01').catch(() => {});

      expect(store.loading).toBe(false);
    });
  });

  // ── terminateUser ─────────────────────────────────────────────────────────

  describe('terminateUser', () => {
    it('calls terminateUserComposable with userId and date', async () => {
      mockTerminate.mockResolvedValueOnce({
        message: 'User terminated. 1 leave(s) cancelled, 0 leave(s) truncated.',
        user_id: 7,
        termination_date: '2026-08-31',
        cancelled_leaves: 1,
        truncated_leaves: 0,
      } as any);

      const store = useAdminStore();
      await store.terminateUser(7, '2026-08-31');

      expect(mockTerminate).toHaveBeenCalledWith(7, '2026-08-31');
    });

    it('sets loading to false after success', async () => {
      mockTerminate.mockResolvedValueOnce({ message: 'ok', user_id: 1, termination_date: '2026-01-01', cancelled_leaves: 0, truncated_leaves: 0 } as any);

      const store = useAdminStore();
      await store.terminateUser(1, '2026-01-01');

      expect(store.loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockTerminate.mockRejectedValueOnce(new Error('Unauthorized'));

      const store = useAdminStore();
      await store.terminateUser(1, '2026-01-01').catch(() => {});

      expect(store.error).not.toBeNull();
    });

    it('sets loading to false after failure', async () => {
      mockTerminate.mockRejectedValueOnce(new Error('fail'));

      const store = useAdminStore();
      await store.terminateUser(1, '2026-01-01').catch(() => {});

      expect(store.loading).toBe(false);
    });
  });

  // ── initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with loading false and error null', () => {
      const store = useAdminStore();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });
});
