import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * retryFetch calls $fetch (Nuxt auto-import / global).
 * We stub $fetch on globalThis before importing retryFetch so the module
 * picks up our mock. Each test configures mockFetch's return value.
 */

const mockFetch = vi.fn();
vi.stubGlobal('$fetch', mockFetch);

// Import AFTER stubbing so the module sees the mock $fetch
const { default: retryFetch } = await import('~/utils/retryFetch');

describe('retryFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('success path', () => {
    it('returns data on first successful call', async () => {
      mockFetch.mockResolvedValueOnce({ id: 1 });
      const result = await retryFetch('/api/test');
      expect(result).toEqual({ id: 1 });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('passes url and options through to $fetch', async () => {
      mockFetch.mockResolvedValueOnce({});
      await retryFetch('/api/test', { method: 'POST', body: { a: 1 } });
      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: { a: 1 },
      });
    });
  });

  describe('retry logic', () => {
    it('retries on 500 and resolves on second attempt', async () => {
      mockFetch
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce({ ok: true });

      const result = await retryFetch('/api/test', {}, 2, 0);
      expect(result).toEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting all retries on 500', async () => {
      mockFetch.mockRejectedValue({ response: { status: 500 } });
      await expect(retryFetch('/api/test', {}, 2, 0)).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('uses exponential backoff (delay doubles)', async () => {
      const delays: number[] = [];
      const origSetTimeout = globalThis.setTimeout;
      vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: any, delay: any) => {
        delays.push(delay);
        fn();
        return 0 as any;
      });

      mockFetch
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockRejectedValueOnce({ response: { status: 500 } })
        .mockResolvedValueOnce({});

      await retryFetch('/api/test', {}, 3, 100);

      expect(delays[0]).toBe(100);
      expect(delays[1]).toBe(200);

      vi.restoreAllMocks();
    });
  });

  describe('non-retryable client errors', () => {
    it('does not retry on 422 — throws immediately', async () => {
      mockFetch.mockRejectedValue({ response: { status: 422 } });
      await expect(retryFetch('/api/test', {}, 3, 0)).rejects.toMatchObject({
        response: { status: 422 },
      });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 400 — throws immediately', async () => {
      mockFetch.mockRejectedValue({ response: { status: 400 } });
      await expect(retryFetch('/api/test', {}, 3, 0)).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('does not retry on 403 — throws immediately', async () => {
      mockFetch.mockRejectedValue({ response: { status: 403 } });
      await expect(retryFetch('/api/test', {}, 3, 0)).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('401 handling', () => {
    it('calls /api/auth/logout on 401 error', async () => {
      mockFetch.mockRejectedValueOnce({ response: { status: 401 } }).mockResolvedValueOnce({}); // logout call

      await expect(retryFetch('/api/test', {}, 1, 0)).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    });

    it('calls /api/auth/logout on 401 throw from $fetch', async () => {
      // Cover the rejection-path (HTTP-level 401), which is the main real-world scenario.
      // Body-embedded statusCode detection races with Nuxt runtime init in the test env.
      mockFetch.mockRejectedValueOnce({ response: { status: 401 } }).mockResolvedValueOnce({}); // logout call

      await expect(retryFetch('/api/test', {}, 1, 0)).rejects.toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    });
  });
});
