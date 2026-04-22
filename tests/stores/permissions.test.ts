import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { usePermissionsStore } from '~/stores/permissions';
import type { PermissionMatrix, FullPermissionMatrix } from '~/types/permissions';

// The permissions store calls $fetch directly (no composable wrapper).
// We stub it globally; the stub is in place before any store action runs.
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// userStore is accessed synchronously inside the store for role checks
vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    userInfo: {
      roles: [{ name: 'admin' }],
    },
  }),
}));

const sampleMatrix: PermissionMatrix = {
  profile_leave_balance: { view: true, accept_leave: false, request_leave: true },
  reports: { view: true, export: true },
};

const sampleFullMatrix: FullPermissionMatrix = {
  profile_leave_balance: {
    view: ['admin', 'hr-manager', 'head', 'user'],
    accept_leave: ['admin'],
  },
};

describe('usePermissionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => vi.clearAllMocks());

  // ─── init ────────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('fetches from /api/permissions/me and stores result', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });

      const store = usePermissionsStore();
      await store.init();

      expect(mockFetch).toHaveBeenCalledWith('/api/permissions/me');
      expect(store.permissionsMatrix).toEqual(sampleMatrix);
    });

    it('sets permissionsMatrix to empty object when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));

      const store = usePermissionsStore();
      await store.init();

      expect(store.permissionsMatrix).toEqual({});
    });

    it('does not throw when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));
      const store = usePermissionsStore();
      await expect(store.init()).resolves.not.toThrow();
    });
  });

  // ─── can ─────────────────────────────────────────────────────────────────────

  describe('can', () => {
    it('returns true when the action is allowed in the matrix', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();

      expect(store.can('profile_leave_balance', 'view')).toBe(true);
    });

    it('returns false when the action is not allowed', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();

      expect(store.can('profile_leave_balance', 'accept_leave')).toBe(false);
    });

    it('returns false for an unknown category', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();

      expect(store.can('non_existent_category', 'view')).toBe(false);
    });

    it('returns false for an unknown action within a known category', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();

      expect(store.can('profile_leave_balance', 'non_existent_action')).toBe(false);
    });

    it('returns false before init is called (empty matrix)', () => {
      const store = usePermissionsStore();
      // No init() called — permissionsMatrix is {}
      expect(store.can('profile_leave_balance', 'view')).toBe(false);
    });
  });

  // ─── hasRole ─────────────────────────────────────────────────────────────────

  describe('hasRole', () => {
    it('returns true when the user has the role', () => {
      const store = usePermissionsStore();
      expect(store.hasRole('admin')).toBe(true);
    });

    it('returns false when the user does not have the role', () => {
      const store = usePermissionsStore();
      expect(store.hasRole('hr-manager')).toBe(false);
    });
  });

  // ─── isAdmin ─────────────────────────────────────────────────────────────────

  describe('isAdmin', () => {
    it('returns true when user has admin role', () => {
      const store = usePermissionsStore();
      expect(store.isAdmin()).toBe(true);
    });
  });

  // ─── fetchFullMatrix ─────────────────────────────────────────────────────────

  describe('fetchFullMatrix', () => {
    it('fetches from /api/permissions and stores full matrix', async () => {
      mockFetch.mockResolvedValueOnce({ matrix: sampleFullMatrix });

      const store = usePermissionsStore();
      await store.fetchFullMatrix();

      expect(mockFetch).toHaveBeenCalledWith('/api/permissions');
      expect(store.fullMatrix).toEqual(sampleFullMatrix);
    });

    it('does not throw when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      const store = usePermissionsStore();
      await expect(store.fetchFullMatrix()).resolves.not.toThrow();
    });
  });

  // ─── updateMatrix ─────────────────────────────────────────────────────────────

  describe('updateMatrix', () => {
    it('PUTs the new matrix and then re-fetches both /permissions and /permissions/me', async () => {
      // PUT response
      mockFetch.mockResolvedValueOnce({});
      // fetchFullMatrix GET
      mockFetch.mockResolvedValueOnce({ matrix: sampleFullMatrix });
      // init() GET /me
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });

      const store = usePermissionsStore();
      await store.updateMatrix(sampleFullMatrix);

      // First call is the PUT
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/permissions', {
        method: 'PUT',
        body: { matrix: sampleFullMatrix },
      });
      // Second call is fetchFullMatrix
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/permissions');
      // Third call is init() re-fetching /me
      expect(mockFetch).toHaveBeenNthCalledWith(3, '/api/permissions/me');
    });

    it('throws when the PUT fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('forbidden'));
      const store = usePermissionsStore();
      await expect(store.updateMatrix(sampleFullMatrix)).rejects.toThrow();
    });
  });

  // ─── reset ───────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears permissionsMatrix and fullMatrix', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();
      expect(store.permissionsMatrix).not.toEqual({});

      store.reset();

      expect(store.permissionsMatrix).toEqual({});
      expect(store.fullMatrix).toEqual({});
    });

    it('can() returns false after reset', async () => {
      mockFetch.mockResolvedValueOnce({ permissions: sampleMatrix });
      const store = usePermissionsStore();
      await store.init();

      store.reset();

      expect(store.can('profile_leave_balance', 'view')).toBe(false);
    });
  });
});
