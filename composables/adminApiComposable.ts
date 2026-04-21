import type { AdminLeavePayload, TerminationPreviewResponse } from '~/types';

export const recordAdminLeaveComposable = (body: AdminLeavePayload) =>
  retryFetch('/api/admin/leave', { method: 'POST', body });

export const previewTerminationComposable = (
  userId: string | number,
  terminationDate: string,
): Promise<TerminationPreviewResponse> =>
  retryFetch('/api/admin/terminatePreview', { method: 'POST', body: { userId, terminationDate } });

export const terminateUserComposable = (userId: string | number, terminationDate: string) =>
  retryFetch('/api/admin/terminate', { method: 'POST', body: { userId, terminationDate } });
