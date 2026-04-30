import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';

// $fetch and server globals are stubbed BEFORE handler modules are imported.
// useRuntimeConfig is provided by the Nuxt test environment but config.public.apiBase
// may be empty, so URL assertions use stringContaining rather than exact URLs.
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

const mockRequireRole = vi.fn().mockResolvedValue(undefined);
vi.stubGlobal('requireRole', mockRequireRole);

import meHandler from '~/server/api/permissions/me.get';
import getHandler from '~/server/api/permissions/index.get';
import putHandler from '~/server/api/permissions/index.put';

// withToken events include node.req.headers so that getHeader() (h3) does not
// throw when the handler reads the Cookie header for forwarding.
const withToken = { context: { token: 'bearer-test' }, node: { req: { headers: {} } } } as any;
const withoutToken = { context: {} } as any;

describe('Server: GET /api/permissions/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue(undefined);
  });

  it('throws 403 when token is absent', async () => {
    await expect(meHandler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('calls $fetch with the permissions/me path and Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ permissions: {} });

    await meHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/permissions/me'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer bearer-test' }),
      }),
    );
  });

  it('returns the data from $fetch unchanged', async () => {
    const expected = { permissions: { profile_leave_balance: { view: true } } };
    mockFetch.mockResolvedValueOnce(expected);

    const result = await meHandler(withToken);

    expect(result).toEqual(expected);
  });

  it('propagates $fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('upstream'));
    await expect(meHandler(withToken)).rejects.toThrow('upstream');
  });
});

describe('Server: GET /api/permissions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 403 when token is absent', async () => {
    await expect(getHandler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('calls $fetch with the permissions path and Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ matrix: {} });

    await getHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/permissions'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer bearer-test' }),
      }),
    );
  });

  it('returns the data from $fetch unchanged', async () => {
    const expected = { matrix: { profile_leave_balance: { view: ['admin'] } } };
    mockFetch.mockResolvedValueOnce(expected);

    const result = await getHandler(withToken);

    expect(result).toEqual(expected);
  });
});

describe('Server: PUT /api/permissions', () => {
  beforeAll(() => {
    vi.stubGlobal('readBody', vi.fn());
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue(undefined);
    (globalThis as any).readBody = vi.fn().mockResolvedValue({ matrix: {} });
  });

  it('throws 403 when token is absent', async () => {
    await expect(putHandler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('calls requireRole with admin before proxying', async () => {
    mockFetch.mockResolvedValueOnce({});

    await putHandler(withToken);

    expect(mockRequireRole).toHaveBeenCalledWith(withToken, ['admin']);
  });

  it('proxies the body to $fetch as a PUT to the permissions path', async () => {
    const body = { matrix: { reports: { view: ['admin'] } } };
    (globalThis as any).readBody = vi.fn().mockResolvedValue(body);
    mockFetch.mockResolvedValueOnce({});

    await putHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/permissions'),
      expect.objectContaining({ method: 'PUT', body }),
    );
  });

  it('returns the response from $fetch', async () => {
    const response = { updated: true };
    mockFetch.mockResolvedValueOnce(response);

    const result = await putHandler(withToken);

    expect(result).toEqual(response);
  });
});
