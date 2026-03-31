import type { Invitation } from '~/types';

export const getInvitationsComposable = () => {
  return retryFetch<{ sent: Invitation[]; received: Invitation[] }>('/api/invitations', {
    method: 'GET',
  });
};

export const createInvitationComposable = (
  userIdFrom: number | string,
  userIdsTo: (number | string)[],
) => {
  return retryFetch<{ message: string; invitations: Invitation[] }>('/api/invitations', {
    method: 'POST',
    body: { user_id_from: userIdFrom, user_id_to: userIdsTo },
  });
};

export const updateInvitationStatusComposable = (
  id: number | string,
  userId: number | string,
  status: 'pending' | 'accepted' | 'declined',
) => {
  return retryFetch<{ message: string; invitation: Invitation }>(`/api/invitations/${id}`, {
    method: 'PATCH',
    body: { user_id: userId, status },
  });
};

export const deleteInvitationComposable = (id: number | string) => {
  return retryFetch<{ message: string }>(`/api/invitations/${id}`, {
    method: 'DELETE',
  });
};
