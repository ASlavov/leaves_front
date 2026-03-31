import type {
  AddEntitlementPayload,
  UpdateEntitlementPayload,
  Entitlement,
  MassDeleteResponse,
  BaseMessageResponse,
} from '~/types';

export const getEntitledDaysForUserComposable = (
  userId: string | number,
): Promise<Entitlement[]> => {
  return retryFetch<Entitlement[]>('/api/entitlement/get', {
    method: 'POST',
    body: { userId },
  });
};

export const addEntitledDaysForUserComposable = (
  body: AddEntitlementPayload,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/entitlement/add', {
    method: 'POST',
    body: { ...body },
  });
};

export const addEntitledDaysForMultipleUsersComposable = (
  body: AddEntitlementPayload,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/entitlement/massLeaves', {
    method: 'POST',
    body: { ...body },
  });
};

export const addEntitledRemoteDaysForMultipleUsersComposable = (
  body: AddEntitlementPayload,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/entitlement/massRemote', {
    method: 'POST',
    body: { ...body },
  });
};

export const updateEntitledDaysForUserComposable = (
  body: UpdateEntitlementPayload,
): Promise<Entitlement> => {
  return retryFetch<Entitlement>('/api/entitlement/update', {
    method: 'POST',
    body: { ...body },
  });
};

export const deleteEntitledDaysForUserComposable = (
  entitlementId: string | number,
): Promise<BaseMessageResponse> => {
  return retryFetch<BaseMessageResponse>('/api/entitlement/delete', {
    method: 'POST',
    body: { entitlementId },
  });
};

export const massDeleteEntitlementsComposable = (body: {
  leaveTypeId: string | number;
  year: number;
  userIds?: (string | number)[];
  dryRun?: boolean;
  force?: boolean;
}): Promise<MassDeleteResponse> => {
  return retryFetch<MassDeleteResponse>('/api/entitlement/massDelete', {
    method: 'POST',
    body,
  });
};
