import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getEntitledDaysForUserComposable,
  addEntitledDaysForUserComposable,
  addEntitledDaysForMultipleUsersComposable,
  addEntitledRemoteDaysForMultipleUsersComposable,
  updateEntitledDaysForUserComposable,
  deleteEntitledDaysForUserComposable,
  massDeleteEntitlementsComposable,
} from '~/composables/entitlementApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('entitlementApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getEntitledDaysForUserComposable — POST with userId in body', async () => {
    await getEntitledDaysForUserComposable(3);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/get', {
      method: 'POST',
      body: { userId: 3 },
    });
  });

  it('addEntitledDaysForUserComposable — POST to add endpoint', async () => {
    const body = {
      user_id: 1,
      leave_type_id: 2,
      entitled_days: 5,
      year: 2024,
      start_from: '2024-01-01',
      end_to: '2024-12-31',
    };
    await addEntitledDaysForUserComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/add', {
      method: 'POST',
      body,
    });
  });

  it('addEntitledDaysForMultipleUsersComposable — POST to massLeaves', async () => {
    const body = { userIds: [1, 2], leave_type_id: 1, entitled_days: 5, year: 2024 };
    await addEntitledDaysForMultipleUsersComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/massLeaves', {
      method: 'POST',
      body,
    });
  });

  it('addEntitledRemoteDaysForMultipleUsersComposable — POST to massRemote', async () => {
    const body = { userIds: [1], leave_type_id: 3, entitled_days: 2, year: 2024 };
    await addEntitledRemoteDaysForMultipleUsersComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/massRemote', {
      method: 'POST',
      body,
    });
  });

  it('updateEntitledDaysForUserComposable — POST to update', async () => {
    const body = { id: 1, entitled_days: 10, year: 2024 };
    await updateEntitledDaysForUserComposable(body as any);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/update', {
      method: 'POST',
      body,
    });
  });

  it('deleteEntitledDaysForUserComposable — POST with entitlementId in body', async () => {
    await deleteEntitledDaysForUserComposable(7);
    expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/delete', {
      method: 'POST',
      body: { entitlementId: 7 },
    });
  });

  describe('massDeleteEntitlementsComposable', () => {
    it('POST to massDelete with required fields', async () => {
      const body = { leaveTypeId: 2, year: 2024 };
      await massDeleteEntitlementsComposable(body);
      expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/massDelete', {
        method: 'POST',
        body,
      });
    });

    it('passes optional userIds, dryRun, force fields through', async () => {
      const body = {
        leaveTypeId: 1,
        year: 2024,
        userIds: [1, 2, 3],
        dryRun: true,
        force: false,
      };
      await massDeleteEntitlementsComposable(body);
      expect(mockFetch).toHaveBeenCalledWith('/api/entitlement/massDelete', {
        method: 'POST',
        body,
      });
    });
  });
});
