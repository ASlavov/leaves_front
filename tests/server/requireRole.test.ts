import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useRuntimeConfig', () => ({
  apiBase: 'http://test-api',
  public: { apiBase: 'http://test-api' },
}));

import { requireRole } from '~/server/utils/requireRole';

const makeEvent = (token: string | undefined) =>
  ({ context: { token } }) as any;

describe('requireRole', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 403 when token is absent', async () => {
    await expect(requireRole(makeEvent(undefined), ['admin'])).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('passes when user has one of the allowed roles', async () => {
    mockFetch.mockResolvedValueOnce({ roles: [{ name: 'admin' }, { name: 'hr-manager' }] });

    await expect(requireRole(makeEvent('token'), ['admin'])).resolves.not.toThrow();
  });

  it('passes with any of multiple allowed roles', async () => {
    mockFetch.mockResolvedValueOnce({ roles: [{ name: 'hr-manager' }] });

    await expect(requireRole(makeEvent('token'), ['admin', 'hr-manager'])).resolves.not.toThrow();
  });

  it('throws 403 when user does not have any allowed role', async () => {
    mockFetch.mockResolvedValueOnce({ roles: [{ name: 'user' }] });

    await expect(requireRole(makeEvent('token'), ['admin'])).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('throws 403 when user profile has no roles array', async () => {
    mockFetch.mockResolvedValueOnce({ id: 1 }); // no roles field

    await expect(requireRole(makeEvent('token'), ['admin'])).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('throws 403 when the $fetch call itself fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));

    await expect(requireRole(makeEvent('token'), ['admin'])).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('calls $fetch with the correct URL and Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ roles: [{ name: 'admin' }] });

    await requireRole(makeEvent('my-token'), ['admin']);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api/api/me',
      { headers: { Authorization: 'Bearer my-token' } },
    );
  });
});
