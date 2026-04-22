import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useRuntimeConfig', () => ({
  apiBase: 'http://test-api',
  public: { apiBase: 'http://test-api' },
}));

import handler from '~/server/api/notifications/markAllRead.post';

const withToken = { context: { token: 'user-token' } } as any;
const withoutToken = { context: {} } as any;

describe('Server: POST /api/notifications/markAllRead', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 403 when token is absent', async () => {
    await expect(handler(withoutToken)).rejects.toMatchObject({ statusCode: 403 });
  });

  it('calls $fetch as PUT to the correct Laravel endpoint', async () => {
    mockFetch.mockResolvedValueOnce([]);

    await handler(withToken);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api/notifications-mark-all-read',
      { method: 'PUT', headers: { Authorization: 'Bearer user-token' } },
    );
  });

  it('returns the list of notifications from Laravel', async () => {
    const notifications = [
      { id: 'uuid-1', is_read: true },
      { id: 'uuid-2', is_read: true },
    ];
    mockFetch.mockResolvedValueOnce(notifications);

    const result = await handler(withToken);

    expect(result).toEqual(notifications);
  });

  it('propagates upstream errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('upstream'));
    await expect(handler(withToken)).rejects.toThrow('upstream');
  });
});
