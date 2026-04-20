import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  recordAdminLeaveComposable,
  previewTerminationComposable,
  terminateUserComposable,
} from '~/composables/adminApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('adminApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  // ── recordAdminLeaveComposable ────────────────────────────────────────────

  describe('recordAdminLeaveComposable', () => {
    it('POSTs to /api/admin/leave with all required fields', async () => {
      const payload = {
        userId: 3,
        leaveTypeId: 1,
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        administrativeReason: 'Correcting historical records',
      };

      await recordAdminLeaveComposable(payload as any);

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/leave', {
        method: 'POST',
        body: payload,
      });
    });

    it('includes optional fields when provided', async () => {
      const payload = {
        userId: 3,
        leaveTypeId: 2,
        startDate: '2026-06-01',
        endDate: '2026-06-03',
        reason: 'Sick',
        administrativeReason: 'Paper form submitted',
        status: 'approved',
        skipWalletDeduction: false,
      };

      await recordAdminLeaveComposable(payload as any);

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/leave', {
        method: 'POST',
        body: payload,
      });
    });

    it('forwards skipWalletDeduction as true when set', async () => {
      const payload = {
        userId: 5,
        leaveTypeId: 3,
        startDate: '2026-07-01',
        endDate: '2026-07-01',
        administrativeReason: 'Record-keeping entry only',
        skipWalletDeduction: true,
      };

      await recordAdminLeaveComposable(payload as any);

      const calledBody = (mockFetch.mock.calls[0][1] as any).body;
      expect(calledBody.skipWalletDeduction).toBe(true);
    });

    it('returns the response from retryFetch', async () => {
      const mockResponse = { message: 'Administrative leave recorded successfully.', leave: { id: 99 } };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await recordAdminLeaveComposable({
        userId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-01',
        endDate: '2026-01-01',
        administrativeReason: 'Test reason here',
      } as any);

      expect(result).toEqual(mockResponse);
    });

    it('propagates errors from retryFetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        recordAdminLeaveComposable({
          userId: 1,
          leaveTypeId: 1,
          startDate: '2026-01-01',
          endDate: '2026-01-01',
          administrativeReason: 'Test reason here',
        } as any),
      ).rejects.toThrow('Network error');
    });
  });

  // ── previewTerminationComposable ─────────────────────────────────────────

  describe('previewTerminationComposable', () => {
    it('POSTs to /api/admin/terminatePreview with userId and terminationDate', async () => {
      await previewTerminationComposable(7, '2026-08-31');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/terminatePreview', {
        method: 'POST',
        body: { userId: 7, terminationDate: '2026-08-31' },
      });
    });

    it('returns preview response including future and spanning leaves', async () => {
      const mockPreview = {
        user: { id: 7, name: 'Jane Doe' },
        termination_date: '2026-08-31',
        future_leaves: [
          { id: 10, leave_type: 'Annual Leave', start_date: '2026-09-01', end_date: '2026-09-05', status: 'approved', action: 'cancel' },
        ],
        spanning_leaves: [
          { id: 8, leave_type: 'Sick Leave', start_date: '2026-08-28', end_date: '2026-09-02', status: 'approved', action: 'truncate', new_end_date: '2026-08-31' },
        ],
        total_affected: 2,
      };

      mockFetch.mockResolvedValueOnce(mockPreview as any);

      const result = await previewTerminationComposable(7, '2026-08-31');

      expect(result).toEqual(mockPreview);
    });

    it('accepts string userId', async () => {
      await previewTerminationComposable('7', '2026-08-31');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/terminatePreview', {
        method: 'POST',
        body: { userId: '7', terminationDate: '2026-08-31' },
      });
    });

    it('propagates errors from retryFetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('User not found'));

      await expect(previewTerminationComposable(999, '2026-01-01')).rejects.toThrow('User not found');
    });
  });

  // ── terminateUserComposable ───────────────────────────────────────────────

  describe('terminateUserComposable', () => {
    it('POSTs to /api/admin/terminate with userId and terminationDate', async () => {
      await terminateUserComposable(7, '2026-08-31');

      expect(mockFetch).toHaveBeenCalledWith('/api/admin/terminate', {
        method: 'POST',
        body: { userId: 7, terminationDate: '2026-08-31' },
      });
    });

    it('returns termination summary with cancelled and truncated counts', async () => {
      const mockResult = {
        message: 'User terminated. 2 leave(s) cancelled, 1 leave(s) truncated.',
        user_id: 7,
        termination_date: '2026-08-31',
        cancelled_leaves: 2,
        truncated_leaves: 1,
      };

      mockFetch.mockResolvedValueOnce(mockResult as any);

      const result = await terminateUserComposable(7, '2026-08-31');

      expect(result).toEqual(mockResult);
    });

    it('accepts string userId', async () => {
      await terminateUserComposable('7', '2026-08-31');

      const calledBody = (mockFetch.mock.calls[0][1] as any).body;
      expect(calledBody.userId).toBe('7');
    });

    it('propagates errors from retryFetch', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(terminateUserComposable(1, '2026-01-01')).rejects.toThrow('Unauthorized');
    });
  });
});
