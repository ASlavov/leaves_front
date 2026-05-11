//import type { User } from './models';

export interface TerminationPreviewResponse {
  user: { id: number; name: string };
  user_name?: string;
  termination_date: string;
  future_leaves?: any[];
  spanning_leaves?: any[];
  total_affected?: number;
  worked_days_in_year?: number;
  prorated_entitlements?: any[];
  upcoming_leaves_to_cancel?: number;
  [key: string]: any;
}
