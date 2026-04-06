import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getWorkWeekComposable,
  updateWorkWeekComposable,
} from '~/composables/settingsApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('settingsApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getWorkWeekComposable — GET /api/settings/workWeek', async () => {
    await getWorkWeekComposable();
    expect(mockFetch).toHaveBeenCalledWith('/api/settings/workWeek', { method: 'GET' });
  });

  it('updateWorkWeekComposable — PUT /api/settings/workWeek', async () => {
    const days = [1, 2, 3, 4, 5];
    await updateWorkWeekComposable(days);
    expect(mockFetch).toHaveBeenCalledWith('/api/settings/workWeek', {
      method: 'PUT',
      body: { days },
    });
  });
});
