import type { CompanyDocument, CreateDocumentPayload } from '~/types';

export const getDocumentsComposable = (targetUserId?: number): Promise<CompanyDocument[]> => {
  const query = targetUserId ? `?target_user_id=${targetUserId}` : '';
  return retryFetch<CompanyDocument[]>(`/api/documents${query}`, {
    method: 'GET',
  });
};

export const createDocumentComposable = (
  payload: CreateDocumentPayload,
): Promise<CompanyDocument> => {
  return retryFetch<CompanyDocument>('/api/documents', {
    method: 'POST',
    body: payload,
  });
};

export const updateDocumentComposable = (
  id: number | string,
  payload: Partial<CreateDocumentPayload>,
): Promise<CompanyDocument> => {
  return retryFetch<CompanyDocument>(`/api/documents/${id}`, {
    method: 'PUT',
    body: payload,
  });
};

export const deleteDocumentComposable = (id: number | string): Promise<{ message: string }> => {
  return retryFetch<{ message: string }>(`/api/documents/${id}`, {
    method: 'DELETE',
  });
};

export const getDocumentDownloadUrl = (id: number | string): string => {
  return `/api/documents/${id}/download`;
};
