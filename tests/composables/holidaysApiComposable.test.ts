import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getHolidaysComposable,
  createHolidayComposable,
  updateHolidayComposable,
  deleteHolidayComposable,
  createHolidayBatchComposable,
  deleteHolidayBatchComposable,
} from '~/composables/holidaysApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('holidaysApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getHolidaysComposable — GET /api/holidays with optional year', async () => {
    await getHolidaysComposable(2024);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays?year=2024', { method: 'GET' });

    await getHolidaysComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays', { method: 'GET' });
  });

  it('createHolidayComposable — POST /api/holidays', async () => {
    await createHolidayComposable('2024-12-25', 'Christmas', true);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays', {
      method: 'POST',
      body: { date: '2024-12-25', name: 'Christmas', is_recurring: true },
    });
  });

  it('updateHolidayComposable — PUT /api/holidays/:id', async () => {
    await updateHolidayComposable(1, '2024-12-26', 'Boxing Day', false);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays/1', {
      method: 'PUT',
      body: { date: '2024-12-26', name: 'Boxing Day', is_recurring: false },
    });
  });

  it('deleteHolidayComposable — DELETE /api/holidays/:id', async () => {
    await deleteHolidayComposable(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays/5', { method: 'DELETE' });
  });

  it('createHolidayBatchComposable — POST /api/holidays/batch', async () => {
    const dates = ['2024-01-01', '2024-01-02'];
    await createHolidayBatchComposable(dates, 'Test', false);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays/batch', {
      method: 'POST',
      body: { dates, name: 'Test', is_recurring: false },
    });
  });

  it('deleteHolidayBatchComposable — DELETE /api/holidays/batchDelete', async () => {
    const ids = [1, 2, 3];
    await deleteHolidayBatchComposable(ids);
    expect(mockFetch).toHaveBeenCalledWith('/api/holidays/batchDelete', {
      method: 'DELETE',
      body: { ids },
    });
  });
});
