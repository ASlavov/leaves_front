import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useRuntimeConfig', () => ({
  apiBase: 'http://test-api',
  public: { apiBase: 'http://test-api' },
}));
vi.stubGlobal('readBody', vi.fn());

import handler from '~/server/api/broadcasting/auth.post';

const withToken = { context: { token: 'ws-auth-token' } } as any;
const withoutToken = { context: {} } as any;

describe('Server: POST /api/broadcasting/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).readBody = vi.fn().mockResolvedValue({
      socket_id: '123.456',
      channel_name: 'private-App.Models.User.42',
    });
  });

  it('throws 403 when token is absent', async () => {
    await expect(handler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('reads the request body', async () => {
    mockFetch.mockResolvedValueOnce({ auth: 'signed-token' });

    await handler(withToken);

    expect((globalThis as any).readBody).toHaveBeenCalledWith(withToken);
  });

  it('proxies to the broadcasting/auth path with Authorization and JSON headers', async () => {
    const body = { socket_id: '123.456', channel_name: 'private-App.Models.User.42' };
    (globalThis as any).readBody = vi.fn().mockResolvedValue(body);
    mockFetch.mockResolvedValueOnce({ auth: 'signed' });

    await handler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/broadcasting/auth'),
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ws-auth-token',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
      },
    );
  });

  it('returns the signed auth response from Laravel', async () => {
    const authResponse = { auth: 'app-key:signature-hash' };
    mockFetch.mockResolvedValueOnce(authResponse);

    const result = await handler(withToken);

    expect(result).toEqual(authResponse);
  });

  it('propagates errors from the Laravel broadcasting/auth endpoint', async () => {
    mockFetch.mockRejectedValueOnce(new Error('auth failed'));
    await expect(handler(withToken)).rejects.toThrow('auth failed');
  });
});
