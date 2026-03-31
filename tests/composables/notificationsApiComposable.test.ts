import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import retryFetch from '~/utils/retryFetch';
import {
  getNotificationsComposable,
  markNotificationReadComposable,
  markNotificationUnreadComposable,
} from '~/composables/notificationsApiComposable';

vi.mock('~/utils/retryFetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(retryFetch);

describe('notificationsApiComposable', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({} as any);
  });

  afterEach(() => vi.clearAllMocks());

  it('getNotificationsComposable — POST with userId in body', async () => {
    await getNotificationsComposable(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/getNotifications', {
      method: 'POST',
      body: { userId: 5 },
    });
  });

  it('markNotificationReadComposable — POST with notificationId in body', async () => {
    await markNotificationReadComposable(12);
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/markedRead', {
      method: 'POST',
      body: { notificationId: 12 },
    });
  });

  it('markNotificationUnreadComposable — POST with notificationId in body', async () => {
    await markNotificationUnreadComposable(12);
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/markedUnread', {
      method: 'POST',
      body: { notificationId: 12 },
    });
  });

  it('getNotificationsComposable — accepts string userId', async () => {
    await getNotificationsComposable('3');
    expect(mockFetch).toHaveBeenCalledWith('/api/notifications/getNotifications', {
      method: 'POST',
      body: { userId: '3' },
    });
  });
});
