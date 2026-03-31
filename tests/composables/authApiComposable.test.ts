import { describe, it, expect, vi, beforeEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  authUserComposable,
  refreshSessionComposable,
  logoutUserComposable,
  updateUserPasswordComposable,
  meComposable,
} from '~/composables/authApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('authApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('authUserComposable', () => {
    it('calls POST /api/auth/login with email and password', async () => {
      mockFetch.mockResolvedValueOnce({ userId: 1 } as any);
      await authUserComposable({ email: 'a@b.com', password: 'pass' });
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'a@b.com', password: 'pass' },
      });
    });

    it('returns the response when userId is present', async () => {
      mockFetch.mockResolvedValueOnce({ userId: 5, message: 'ok' } as any);
      const result = await authUserComposable({ email: 'a@b.com', password: 'pass' });
      expect(result.userId).toBe(5);
    });

    it('throws when userId is missing in response', async () => {
      mockFetch.mockResolvedValueOnce({ message: 'ok' } as any);
      await expect(authUserComposable({ email: 'a@b.com', password: 'pass' })).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('throws when retryFetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(authUserComposable({ email: 'a@b.com', password: 'pass' })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('refreshSessionComposable', () => {
    it('calls GET /api/auth/refreshSession', async () => {
      mockFetch.mockResolvedValueOnce({ userId: 1 } as any);
      await refreshSessionComposable();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refreshSession', {
        method: 'GET',
      });
    });

    it('throws on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('expired'));
      await expect(refreshSessionComposable()).rejects.toThrow('Failed to restore session');
    });
  });

  describe('logoutUserComposable', () => {
    it('calls GET /api/auth/logout', async () => {
      mockFetch.mockResolvedValueOnce({ message: 'ok' } as any);
      await logoutUserComposable();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'GET' });
    });

    it('throws on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      await expect(logoutUserComposable()).rejects.toThrow('Failed to delete session');
    });
  });

  describe('updateUserPasswordComposable', () => {
    it('calls POST /api/auth/updatePassword with body', async () => {
      mockFetch.mockResolvedValueOnce({ message: 'updated' } as any);
      const body = { userId: 1, oldPass: 'old', newPass: 'new' };
      await updateUserPasswordComposable(body as any);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/updatePassword', {
        method: 'POST',
        body,
      });
    });

    it('throws on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      await expect(updateUserPasswordComposable({} as any)).rejects.toThrow(
        'Failed to update password',
      );
    });
  });

  describe('meComposable', () => {
    it('calls POST /api/me', async () => {
      mockFetch.mockResolvedValueOnce({ id: 1, name: 'Alice' } as any);
      await meComposable();
      expect(mockFetch).toHaveBeenCalledWith('/api/me', { method: 'POST' });
    });

    it('throws on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      await expect(meComposable()).rejects.toThrow('Failed to get self data');
    });
  });
});
