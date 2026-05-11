import type { OrgChartNode, OrgChartSyncPayload } from '~/types';

export const getOrgChartComposable = (): Promise<OrgChartNode[]> => {
  return retryFetch<OrgChartNode[]>('/api/org-chart', {
    method: 'GET',
  });
};

export const syncOrgChartComposable = (payload: OrgChartSyncPayload): Promise<OrgChartNode[]> => {
  return retryFetch<OrgChartNode[]>('/api/org-chart', {
    method: 'POST',
    body: payload,
  });
};
