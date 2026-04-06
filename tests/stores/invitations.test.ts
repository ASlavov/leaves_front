import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import {
  getInvitationsComposable,
  createInvitationComposable,
  updateInvitationStatusComposable,
  deleteInvitationComposable,
} from '~/composables/invitationsApiComposable';
import { useInvitationsStore } from '~/stores/invitations';

// Mock composable module BEFORE importing the store
vi.mock('~/composables/invitationsApiComposable', () => ({
  getInvitationsComposable: vi.fn(),
  createInvitationComposable: vi.fn(),
  updateInvitationStatusComposable: vi.fn(),
  deleteInvitationComposable: vi.fn(),
}));

const mockGet = vi.mocked(getInvitationsComposable);
const mockCreate = vi.mocked(createInvitationComposable);
const mockUpdate = vi.mocked(updateInvitationStatusComposable);
const mockDelete = vi.mocked(deleteInvitationComposable);

const mockInvitation = (overrides = {}) => ({
  id: 1,
  status: 'pending' as const,
  user_id_from: 1,
  user_id_to: 2,
  sender: { id: 1, name: 'Alice', email: 'a@a.com' },
  receiver: { id: 2, name: 'Bob', email: 'b@b.com' },
  ...overrides,
});

describe('useInvitationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchInvitations', () => {
    it('populates sent and received on success', async () => {
      const sent = [mockInvitation({ id: 1 })];
      const received = [mockInvitation({ id: 2 })];
      mockGet.mockResolvedValueOnce({ sent, received } as any);

      const store = useInvitationsStore();
      await store.fetchInvitations();

      expect(store.sent).toEqual(sent);
      expect(store.received).toEqual(received);
      expect(store.error).toBeNull();
    });

    it('sets loading to true during fetch, false after', async () => {
      let capturedLoading = false;
      mockGet.mockImplementationOnce(async () => {
        capturedLoading = useInvitationsStore().loading;
        return { sent: [], received: [] } as any;
      });

      const store = useInvitationsStore();
      await store.fetchInvitations();

      expect(capturedLoading).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets error key and re-throws on failure', async () => {
      const err = new Error('network');
      mockGet.mockRejectedValueOnce(err);

      const store = useInvitationsStore();
      await expect(store.fetchInvitations()).rejects.toThrow('network');
      expect(store.error).toBe('errors.invitations.fetchFailed');
      expect(store.loading).toBe(false);
    });
  });

  describe('sendInvitation', () => {
    it('prepends new invitations to sent list', async () => {
      const newInv = mockInvitation({ id: 99 });
      mockCreate.mockResolvedValueOnce({ message: 'ok', invitations: [newInv] } as any);

      const store = useInvitationsStore();
      store.sent = [mockInvitation({ id: 1 })] as any;
      await store.sendInvitation(1, [2]);

      expect(store.sent[0].id).toBe(99);
      expect(store.sent.length).toBe(2);
    });

    it('does not add duplicate invitations', async () => {
      const existing = mockInvitation({ id: 1 });
      mockCreate.mockResolvedValueOnce({ message: 'ok', invitations: [existing] } as any);

      const store = useInvitationsStore();
      store.sent = [existing] as any;
      await store.sendInvitation(1, [2]);

      expect(store.sent.length).toBe(1);
    });

    it('sets error key and re-throws on failure', async () => {
      mockCreate.mockRejectedValueOnce(new Error('fail'));

      const store = useInvitationsStore();
      await expect(store.sendInvitation(1, [2])).rejects.toBeDefined();
      expect(store.error).toBe('errors.invitations.sendFailed');
    });
  });

  describe('respondToInvitation', () => {
    it('updates status of the matching received invitation', async () => {
      const inv = mockInvitation({ id: 5, status: 'pending' });
      mockUpdate.mockResolvedValueOnce({
        message: 'ok',
        invitation: { ...inv, status: 'accepted' },
      } as any);

      const store = useInvitationsStore();
      store.received = [inv] as any;
      await store.respondToInvitation(5, 2, 'accepted');

      expect(store.received[0].status).toBe('accepted');
    });

    it('leaves list unchanged if id not found', async () => {
      mockUpdate.mockResolvedValueOnce({ message: 'ok', invitation: {} } as any);

      const store = useInvitationsStore();
      const inv = mockInvitation({ id: 1 });
      store.received = [inv] as any;
      await store.respondToInvitation(999, 2, 'declined');

      expect(store.received[0].status).toBe('pending');
    });

    it('sets error key and re-throws on failure', async () => {
      mockUpdate.mockRejectedValueOnce(new Error('fail'));

      const store = useInvitationsStore();
      await expect(store.respondToInvitation(1, 1, 'accepted')).rejects.toBeDefined();
      expect(store.error).toBe('errors.invitations.respondFailed');
    });
  });

  describe('revokeInvitation', () => {
    it('removes invitation from sent list by id', async () => {
      mockDelete.mockResolvedValueOnce({ message: 'ok' } as any);

      const store = useInvitationsStore();
      store.sent = [mockInvitation({ id: 5 }), mockInvitation({ id: 6 })] as any;
      await store.revokeInvitation(5);

      expect(store.sent.find((s: any) => s.id === 5)).toBeUndefined();
      expect(store.sent.length).toBe(1);
    });

    it('removes invitation from received list too', async () => {
      mockDelete.mockResolvedValueOnce({ message: 'ok' } as any);

      const store = useInvitationsStore();
      store.received = [mockInvitation({ id: 7 })] as any;
      await store.revokeInvitation(7);

      expect(store.received.length).toBe(0);
    });

    it('sets error key and re-throws on failure', async () => {
      mockDelete.mockRejectedValueOnce(new Error('fail'));

      const store = useInvitationsStore();
      await expect(store.revokeInvitation(1)).rejects.toBeDefined();
      expect(store.error).toBe('errors.invitations.revokeFailed');
    });
  });

  describe('reset', () => {
    it('clears sent, received, and error', () => {
      const store = useInvitationsStore();
      store.sent = [mockInvitation()] as any;
      store.received = [mockInvitation()] as any;
      store.error = 'some error';

      store.reset();

      expect(store.sent).toEqual([]);
      expect(store.received).toEqual([]);
      expect(store.error).toBeNull();
    });
  });
});
