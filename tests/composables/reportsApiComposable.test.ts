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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2026'),
        { method: 'GET' },
      );
    });

    it('appends dept_ids query params for each department', async () => {
      await getReportSummaryComposable(2026, [1, 2, 3]);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('dept_ids=1'), { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('dept_ids=2'), { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('dept_ids=3'), { method: 'GET' });
    });

    it('appends leave_type_ids query params for each leave type', async () => {
      await getReportSummaryComposable(2026, [], [10, 20]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('leave_type_ids=10'),
        { method: 'GET' },
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('leave_type_ids=20'),
        { method: 'GET' },
      );
    });

    it('works with no optional filters — URL has year but no dept or type ids', async () => {
      await getReportSummaryComposable(2025);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2025'),
        { method: 'GET' },
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('dept_ids'),
        expect.anything(),
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('leave_type_ids'),
        expect.anything(),
      );
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
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2026'),
        { method: 'GET' },
      );
    });

    it('appends user_ids for each user', async () => {
      await getLeaveBalancesComposable(2026, [1, 2]);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('user_ids=1'), { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('user_ids=2'), { method: 'GET' });
    });

    it('appends leave_type_ids for each leave type', async () => {
      await getLeaveBalancesComposable(2026, [], [5, 6]);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('leave_type_ids=5'), { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('leave_type_ids=6'), { method: 'GET' });
    });

    it('accepts string user ids (mixed types)', async () => {
      await getLeaveBalancesComposable(2026, ['10', 11]);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('user_ids=10'), { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('user_ids=11'), { method: 'GET' });
    });

    it('works with no optional filters', async () => {
      await getLeaveBalancesComposable(2025);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2025'),
        { method: 'GET' },
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('user_ids'),
        expect.anything(),
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('leave_type_ids'),
        expect.anything(),
      );
    });

    it('returns the result from retryFetch', async () => {
      const balances = { year: 2026, users: [], leave_types: [], rows: [] };
      mockFetch.mockResolvedValueOnce(balances as any);

      const result = await getLeaveBalancesComposable(2026);

      expect(result).toEqual(balances);
    });
  });
});
