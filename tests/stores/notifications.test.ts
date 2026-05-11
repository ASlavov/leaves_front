import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import {
  getNotificationsComposable,
  markNotificationReadComposable,
  markNotificationUnreadComposable,
  markAllNotificationsReadComposable,
} from '~/composables/notificationsApiComposable';
import { useNotificationsStore } from '~/stores/notifications';

vi.mock('~/composables/notificationsApiComposable', () => ({
  getNotificationsComposable: vi.fn(),
  markNotificationReadComposable: vi.fn(),
  markNotificationUnreadComposable: vi.fn(),
  markAllNotificationsReadComposable: vi.fn(),
}));

// useUserStore is accessed inside the notifications store
vi.mock('~/stores/user', () => ({
  useUserStore: () => ({ userId: 42 }),
}));

const mockGet = vi.mocked(getNotificationsComposable);
const mockRead = vi.mocked(markNotificationReadComposable);
const mockUnread = vi.mocked(markNotificationUnreadComposable);
const mockAllRead = vi.mocked(markAllNotificationsReadComposable);

const makeNotification = (overrides: Record<string, any> = {}) => ({
  id: 'uuid-1',
  user_id: 42,
  type: 'leave_requested' as const,
  title: 'New Leave Request',
  message: 'Alice requested leave',
  is_read: false,
  created_at: '2026-04-22T10:00:00Z',
  meta: {},
  ...overrides,
});

describe('useNotificationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGet.mockResolvedValue([]);
    mockAllRead.mockResolvedValue([]);
  });

  afterEach(() => vi.clearAllMocks());

  // ─── init ────────────────────────────────────────────────────────────────────

  describe('init', () => {
    it('calls getNotifications on init', async () => {
      const store = useNotificationsStore();
      await store.init();
      expect(mockGet).toHaveBeenCalledWith(42);
    });

    it('does not crash when $echo is absent (graceful no-op)', async () => {
      // useNuxtApp().$echo is undefined in the test environment — subscribeToChannel
      // has an explicit guard and exits early; this must not throw.
      const store = useNotificationsStore();
      await expect(store.init()).resolves.not.toThrow();
    });

    it('sets error when getNotifications throws', async () => {
      mockGet.mockRejectedValueOnce(new Error('network'));
      const store = useNotificationsStore();
      await store.init();
      expect(store.error).toBeTruthy();
    });
  });

  // ─── getNotifications ────────────────────────────────────────────────────────

  describe('getNotifications', () => {
    it('populates notificationsData on success', async () => {
      const data = [makeNotification({ id: 'a' }), makeNotification({ id: 'b' })];
      mockGet.mockResolvedValueOnce(data);

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(store.notificationsData).toEqual(data);
    });

    it('sets loading true during fetch and false after', async () => {
      let loadingDuringFetch = false;
      mockGet.mockImplementationOnce(async () => {
        loadingDuringFetch = useNotificationsStore().loading;
        return [];
      });

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(loadingDuringFetch).toBe(true);
      expect(store.loading).toBe(false);
    });

    it('sets loading false even when fetch throws', async () => {
      mockGet.mockRejectedValueOnce(new Error('fail'));
      const store = useNotificationsStore();
      await store.getNotifications();
      expect(store.loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockGet.mockRejectedValueOnce(new Error('fail'));
      const store = useNotificationsStore();
      await store.getNotifications();
      expect(store.error).toBeTruthy();
    });
  });

  // ─── computed: unreadCount ────────────────────────────────────────────────────

  describe('unreadCount', () => {
    it('returns 0 when no notifications', () => {
      const store = useNotificationsStore();
      expect(store.unreadCount).toBe(0);
    });

    it('counts only unread notifications', async () => {
      const data = [
        makeNotification({ id: '1', is_read: false }),
        makeNotification({ id: '2', is_read: true }),
        makeNotification({ id: '3', is_read: false }),
      ];
      mockGet.mockResolvedValueOnce(data);

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(store.unreadCount).toBe(2);
    });

    it('returns 0 when all notifications are read', async () => {
      const data = [makeNotification({ is_read: true }), makeNotification({ id: '2', is_read: true })];
      mockGet.mockResolvedValueOnce(data);

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(store.unreadCount).toBe(0);
    });
  });

  // ─── computed: unreadNotifications / readNotifications ───────────────────────

  describe('unreadNotifications', () => {
    it('returns only unread, sorted newest first', async () => {
      const data = [
        makeNotification({ id: '1', is_read: false, created_at: '2026-04-20T10:00:00Z' }),
        makeNotification({ id: '2', is_read: false, created_at: '2026-04-22T10:00:00Z' }),
        makeNotification({ id: '3', is_read: true,  created_at: '2026-04-21T10:00:00Z' }),
      ];
      mockGet.mockResolvedValueOnce(data);

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(store.unreadNotifications.map((n) => n.id)).toEqual(['2', '1']);
    });
  });

  describe('readNotifications', () => {
    it('returns only read, sorted newest first', async () => {
      const data = [
        makeNotification({ id: '1', is_read: true,  created_at: '2026-04-20T10:00:00Z' }),
        makeNotification({ id: '2', is_read: false, created_at: '2026-04-22T10:00:00Z' }),
        makeNotification({ id: '3', is_read: true,  created_at: '2026-04-21T10:00:00Z' }),
      ];
      mockGet.mockResolvedValueOnce(data);

      const store = useNotificationsStore();
      await store.getNotifications();

      expect(store.readNotifications.map((n) => n.id)).toEqual(['3', '1']);
    });
  });

  // ─── changeNotificationStatus ─────────────────────────────────────────────────

  describe('changeNotificationStatus', () => {
    it('calls markRead when notification is currently unread', async () => {
      const updated = [makeNotification({ id: 'uuid-1', is_read: true })];
      mockRead.mockResolvedValueOnce(updated);

      const store = useNotificationsStore();
      store.notificationsData = [makeNotification({ id: 'uuid-1', is_read: false })];

      await store.changeNotificationStatus('uuid-1');

      expect(mockRead).toHaveBeenCalledWith('uuid-1');
      expect(mockUnread).not.toHaveBeenCalled();
      expect(store.notificationsData).toEqual(updated);
    });

    it('calls markUnread when notification is currently read', async () => {
      const updated = [makeNotification({ id: 'uuid-1', is_read: false })];
      mockUnread.mockResolvedValueOnce(updated);

      const store = useNotificationsStore();
      store.notificationsData = [makeNotification({ id: 'uuid-1', is_read: true })];

      await store.changeNotificationStatus('uuid-1');

      expect(mockUnread).toHaveBeenCalledWith('uuid-1');
      expect(mockRead).not.toHaveBeenCalled();
    });

    it('does nothing when notification id is not found', async () => {
      const store = useNotificationsStore();
      store.notificationsData = [makeNotification({ id: 'uuid-1' })];

      await store.changeNotificationStatus('non-existent-id');

      expect(mockRead).not.toHaveBeenCalled();
      expect(mockUnread).not.toHaveBeenCalled();
    });

    it('sets error when composable throws', async () => {
      mockRead.mockRejectedValueOnce(new Error('fail'));

      const store = useNotificationsStore();
      store.notificationsData = [makeNotification({ id: 'uuid-1', is_read: false })];

      await store.changeNotificationStatus('uuid-1');

      expect(store.error).toBeTruthy();
    });
  });

  // ─── markAllRead ──────────────────────────────────────────────────────────────

  describe('markAllRead', () => {
    it('calls markAllNotificationsReadComposable', async () => {
      const store = useNotificationsStore();
      await store.markAllRead();
      expect(mockAllRead).toHaveBeenCalledTimes(1);
    });

    it('updates notificationsData with the returned list', async () => {
      const updated = [makeNotification({ is_read: true }), makeNotification({ id: '2', is_read: true })];
      mockAllRead.mockResolvedValueOnce(updated);

      const store = useNotificationsStore();
      store.notificationsData = [makeNotification({ is_read: false })];

      await store.markAllRead();

      expect(store.notificationsData).toEqual(updated);
    });

    it('sets error when composable throws', async () => {
      mockAllRead.mockRejectedValueOnce(new Error('fail'));
      const store = useNotificationsStore();
      await store.markAllRead();
      expect(store.error).toBeTruthy();
    });
  });

  // ─── reset ───────────────────────────────────────────────────────────────────

  describe('reset', () => {
    it('clears notificationsData', async () => {
      mockGet.mockResolvedValueOnce([makeNotification()]);
      const store = useNotificationsStore();
      await store.getNotifications();
      expect(store.notificationsData).toHaveLength(1);

      store.reset();

      expect(store.notificationsData).toHaveLength(0);
    });

    it('resets connected to false', () => {
      const store = useNotificationsStore();
      store.connected = true;
      store.reset();
      expect(store.connected).toBe(false);
    });

    it('clears error', () => {
      const store = useNotificationsStore();
      store.error = 'some error';
      store.reset();
      expect(store.error).toBeNull();
    });

    it('does not crash when $echo is absent (unsubscribeFromChannel guard)', () => {
      const store = useNotificationsStore();
      expect(() => store.reset()).not.toThrow();
    });
  });
});
