import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getReportSummaryComposable,
  getLeaveBalancesComposable,
} from '~/composables/reportsApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('reportsApiComposable', () => {
  beforeEach(() => mockFetch.mockResolvedValue({} as any));
  afterEach(() => vi.clearAllMocks());

  // ─── getReportSummaryComposable ───────────────────────────────────────────────

  describe('getReportSummaryComposable', () => {
    it('calls GET /api/reports/summary with the year param', async () => {
      await getReportSummaryComposable(2026);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/summary'),
        { method: 'GET' },
      );
      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('year=2026');
    });

    it('appends dept_ids query params for each department', async () => {
      await getReportSummaryComposable(2026, [1, 2, 3]);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('dept_ids=1');
      expect(url).toContain('dept_ids=2');
      expect(url).toContain('dept_ids=3');
    });

    it('appends leave_type_ids query params for each leave type', async () => {
      await getReportSummaryComposable(2026, [], [10, 20]);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('leave_type_ids=10');
      expect(url).toContain('leave_type_ids=20');
    });

    it('works with no optional filters (empty arrays)', async () => {
      await getReportSummaryComposable(2025);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('year=2025');
      expect(url).not.toContain('dept_ids');
      expect(url).not.toContain('leave_type_ids');
    });

    it('returns the result from retryFetch', async () => {
      const summary = { year: 2026, pending_count: 3, headcount: 12 };
      mockFetch.mockResolvedValueOnce(summary as any);

      const result = await getReportSummaryComposable(2026);

      expect(result).toEqual(summary);
    });
  });

  // ─── getLeaveBalancesComposable ───────────────────────────────────────────────

  describe('getLeaveBalancesComposable', () => {
    it('calls GET /api/reports/leave-balances with the year param', async () => {
      await getLeaveBalancesComposable(2026);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/leave-balances'),
        { method: 'GET' },
      );
      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('year=2026');
    });

    it('appends user_ids for each user', async () => {
      await getLeaveBalancesComposable(2026, [1, 2]);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('user_ids=1');
      expect(url).toContain('user_ids=2');
    });

    it('appends leave_type_ids for each leave type', async () => {
      await getLeaveBalancesComposable(2026, [], [5, 6]);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('leave_type_ids=5');
      expect(url).toContain('leave_type_ids=6');
    });

    it('accepts string user ids (mixed types)', async () => {
      await getLeaveBalancesComposable(2026, ['10', 11]);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('user_ids=10');
      expect(url).toContain('user_ids=11');
    });

    it('works with no optional filters', async () => {
      await getLeaveBalancesComposable(2025);

      const url: string = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('year=2025');
      expect(url).not.toContain('user_ids');
      expect(url).not.toContain('leave_type_ids');
    });

    it('returns the result from retryFetch', async () => {
      const balances = { year: 2026, users: [], leave_types: [], rows: [] };
      mockFetch.mockResolvedValueOnce(balances as any);

      const result = await getLeaveBalancesComposable(2026);

      expect(result).toEqual(balances);
    });
  });
});
