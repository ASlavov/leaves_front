import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getInvitationsComposable,
  createInvitationComposable,
  updateInvitationStatusComposable,
  deleteInvitationComposable,
} from '~/composables/invitationsApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('invitationsApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInvitationsComposable', () => {
    it('calls GET /api/invitations', async () => {
      mockFetch.mockResolvedValueOnce({ sent: [], received: [] } as any);
      await getInvitationsComposable();
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations', { method: 'GET' });
    });

    it('returns the sent and received arrays from retryFetch', async () => {
      const data = { sent: [{ id: 1 }], received: [{ id: 2 }] };
      mockFetch.mockResolvedValueOnce(data as any);
      const result = await getInvitationsComposable();
      expect(result).toEqual(data);
    });
  });

  describe('createInvitationComposable', () => {
    it('calls POST /api/invitations with correct body', async () => {
      await createInvitationComposable(1, [2, 3]);
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations', {
        method: 'POST',
        body: { user_id_from: 1, user_id_to: [2, 3] },
      });
    });

    it('accepts string ids', async () => {
      await createInvitationComposable('1', ['2', '3']);
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations', {
        method: 'POST',
        body: { user_id_from: '1', user_id_to: ['2', '3'] },
      });
    });
  });

  describe('updateInvitationStatusComposable', () => {
    it('calls PATCH /api/invitations/:id with user_id and status', async () => {
      await updateInvitationStatusComposable(42, 7, 'accepted');
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations/42', {
        method: 'PATCH',
        body: { user_id: 7, status: 'accepted' },
      });
    });

    it('supports declined status', async () => {
      await updateInvitationStatusComposable(1, 1, 'declined');
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations/1', {
        method: 'PATCH',
        body: { user_id: 1, status: 'declined' },
      });
    });
  });

  describe('deleteInvitationComposable', () => {
    it('calls DELETE /api/invitations/:id', async () => {
      await deleteInvitationComposable(7);
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations/7', {
        method: 'DELETE',
      });
    });

    it('works with string id', async () => {
      await deleteInvitationComposable('99');
      expect(mockFetch).toHaveBeenCalledWith('/api/invitations/99', {
        method: 'DELETE',
      });
    });
  });
});
