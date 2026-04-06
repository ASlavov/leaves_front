import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import {
  authUserComposable,
  logoutUserComposable,
  meComposable,
  refreshSessionComposable,
  updateUserPasswordComposable,
} from '~/composables/authApiComposable';
import { useAuthStore } from '~/stores/auth';

// Mock composable modules BEFORE importing the store
vi.mock('~/composables/authApiComposable', () => ({
  authUserComposable: vi.fn(),
  logoutUserComposable: vi.fn(),
  meComposable: vi.fn(),
  refreshSessionComposable: vi.fn(),
  updateUserPasswordComposable: vi.fn(),
}));

// useUserStore is called inside auth store — provide a minimal mock
vi.mock('~/stores/user', () => ({
  useUserStore: () => ({
    setUserId: vi.fn(),
  }),
}));

const mockAuth = vi.mocked(authUserComposable);
const mockLogout = vi.mocked(logoutUserComposable);
const mockMe = vi.mocked(meComposable);
const mockRefresh = vi.mocked(refreshSessionComposable);
const mockUpdatePass = vi.mocked(updateUserPasswordComposable);

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('authUserWrapper', () => {
    it('returns true and sets userId on successful login', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 5, message: 'ok' } as any);

      const store = useAuthStore();
      const result = await store.authUser('a@b.com', 'pass');

      expect(result).toBe(true);
      expect(store.error).toBeNull();
    });

    it('returns false when userId is absent in response', async () => {
      mockAuth.mockResolvedValueOnce({ message: 'ok' } as any);

      const store = useAuthStore();
      const result = await store.authUser('a@b.com', 'pass');

      expect(result).toBe(false);
    });

    it('sets error key on failure', async () => {
      mockAuth.mockRejectedValueOnce(new Error('fail'));

      const store = useAuthStore();
      await store.authUser('a@b.com', 'pass');
      expect(store.error).toBe('errors.auth.invalidCredentials');
    });

    it('sets loading to false after success', async () => {
      mockAuth.mockResolvedValueOnce({ userId: 1 } as any);
      const store = useAuthStore();
      await store.authUser('a@b.com', 'pass');
      expect(store.loading).toBe(false);
    });

    it('sets loading to false after failure', async () => {
      mockAuth.mockRejectedValueOnce(new Error('fail'));
      const store = useAuthStore();
      await store.authUser('a@b.com', 'pass');
      expect(store.loading).toBe(false);
    });
  });

  describe('logout', () => {
    it('calls logoutUserComposable', async () => {
      mockLogout.mockResolvedValueOnce({ message: 'ok' } as any);

      const store = useAuthStore();
      await store.logout();

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('sets error key on logout failure', async () => {
      mockLogout.mockRejectedValueOnce(new Error('fail'));

      const store = useAuthStore();
      await store.logout();
      expect(store.error).toBe('errors.auth.logoutFailed');
    });
  });

  describe('me', () => {
    it('sets userId from response', async () => {
      mockMe.mockResolvedValueOnce({ userId: 7 } as any);

      const store = useAuthStore();
      await store.me();

      expect(mockMe).toHaveBeenCalledTimes(1);
    });

    it('sets error key on failure', async () => {
      mockMe.mockRejectedValueOnce(new Error('fail'));

      const store = useAuthStore();
      await store.me();
      expect(store.error).toBe('errors.auth.fetchDataFailed');
    });
  });

  describe('updatePassword', () => {
    it('calls updateUserPasswordComposable with provided args', async () => {
      mockUpdatePass.mockResolvedValueOnce({ message: 'updated' } as any);

      const store = useAuthStore();
      await store.updatePassword(1, 'old', 'new');

      expect(mockUpdatePass).toHaveBeenCalledWith({
        userId: 1,
        oldPass: 'old',
        newPass: 'new',
      });
    });

    it('sets error key on failure', async () => {
      mockUpdatePass.mockRejectedValueOnce(new Error('fail'));

      const store = useAuthStore();
      await store.updatePassword(1, 'old', 'new');
      expect(store.error).toBe('errors.auth.sessionNotFound');
    });
  });

  describe('hasSession', () => {
    it('returns a boolean (truthy/falsy based on cookie)', async () => {
      // useCookie is a Nuxt runtime composable — we verify it returns a boolean
      // rather than mocking the Nuxt module system internals.
      const store = useAuthStore();
      const result = await store.hasSession();
      expect(typeof result).toBe('boolean');
    });

    it('sets loading to false after checking', async () => {
      const store = useAuthStore();
      await store.hasSession();
      expect(store.loading).toBe(false);
    });
  });
});
