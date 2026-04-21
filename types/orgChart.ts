export interface OrgChartNode {
  id: number;
  user_id: number;
  parent_id: number | null;
  position: number;
  user?: {
    id: number;
    name: string;
    job_title: string | null;
    profile_image: string | null;
  };
}

export interface OrgChartTreeNode extends OrgChartNode {
  children: OrgChartTreeNode[];
}

export interface OrgChartSyncPayload {
  nodes: Array<{ id: number; user_id: number; parent_id: number | null; position: number }>;
}
