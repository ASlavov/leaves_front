import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest';

// Stub $fetch and Nuxt server globals BEFORE importing route handlers.
// These route files use H3 auto-imports (defineEventHandler, createError,
// useRuntimeConfig, readBody) which are available in the nuxt test environment.
const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useRuntimeConfig', () => ({
  apiBase: 'http://test-api',
  public: { apiBase: 'http://test-api' },
}));

// requireRole is an auto-imported server utility called in the PUT handler.
// We stub it globally so the PUT tests stay focused on proxy behavior.
const mockRequireRole = vi.fn().mockResolvedValue(undefined);
vi.stubGlobal('requireRole', mockRequireRole);

import meHandler from '~/server/api/permissions/me.get';
import getHandler from '~/server/api/permissions/index.get';
import putHandler from '~/server/api/permissions/index.put';

const withToken = { context: { token: 'bearer-test' } } as any;
const withoutToken = { context: {} } as any;

describe('Server: GET /api/permissions/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue(undefined);
  });

  it('throws 403 when token is absent', async () => {
    await expect(meHandler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('calls $fetch with the correct URL and Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ permissions: {} });

    await meHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith('http://test-api/v1/permissions/me', {
      headers: { Authorization: 'Bearer bearer-test' },
    });
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

  it('calls $fetch with the correct URL and Authorization header', async () => {
    mockFetch.mockResolvedValueOnce({ matrix: {} });

    await getHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith('http://test-api/v1/permissions', {
      headers: { Authorization: 'Bearer bearer-test' },
    });
  });

  it('returns the data from $fetch unchanged', async () => {
    const expected = { matrix: { profile_leave_balance: { view: ['admin'] } } };
    mockFetch.mockResolvedValueOnce(expected);

    const result = await getHandler(withToken);

    expect(result).toEqual(expected);
  });
});

describe('Server: PUT /api/permissions', () => {
  // readBody is an H3 auto-import; stub it globally for these tests
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

  it('proxies the body to $fetch as a PUT', async () => {
    const body = { matrix: { reports: { view: ['admin'] } } };
    (globalThis as any).readBody = vi.fn().mockResolvedValue(body);
    mockFetch.mockResolvedValueOnce({});

    await putHandler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api/v1/permissions',
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
