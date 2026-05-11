import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useRuntimeConfig', () => ({
  apiBase: 'http://test-api',
  public: { apiBase: 'http://test-api' },
}));

// readRawBody is explicitly imported from h3 in the handler, so vi.stubGlobal
// cannot intercept it. We must mock the h3 module itself, preserving all other
// exports (getHeader, createError, defineEventHandler, etc.) via importOriginal.
// vi.hoisted() is required because vi.mock factories are hoisted above variable
// declarations — without it, mockReadRawBody would be uninitialized when the
// factory executes.
const mockReadRawBody = vi.hoisted(() => vi.fn());
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>();
  return { ...actual, readRawBody: mockReadRawBody };
});

import handler from '~/server/api/broadcasting/auth.post';

// withToken includes node.req.headers so that getHeader() does not throw when
// the handler reads the Cookie header after the auth check passes.
const withToken = { context: { token: 'ws-auth-token' }, node: { req: { headers: {} } } } as any;
const withoutToken = { context: {} } as any;

const RAW_BODY = 'socket_id=123.456&channel_name=private-App.Models.User.42';

describe('Server: POST /api/broadcasting/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadRawBody.mockResolvedValue(RAW_BODY);
  });

  it('throws 403 when token is absent', async () => {
    await expect(handler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('reads the raw request body', async () => {
    mockFetch.mockResolvedValueOnce({ auth: 'signed-token' });

    await handler(withToken);

    expect(mockReadRawBody).toHaveBeenCalledWith(withToken);
  });

  it('proxies to the broadcasting/auth path with correct headers and raw body', async () => {
    mockFetch.mockResolvedValueOnce({ auth: 'signed' });

    await handler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/broadcasting/auth'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer ws-auth-token',
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        }),
        body: RAW_BODY,
      }),
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
