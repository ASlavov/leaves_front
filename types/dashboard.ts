export type DashboardSection = 'leave_balance' | 'profile_info' | 'pending_actions';

export interface DashboardPreferences {
  sectionOrder: DashboardSection[];
  hiddenSections: DashboardSection[];
  leaveTypeOrder: number[];
  hiddenLeaveTypes: number[];
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  sectionOrder: ['leave_balance', 'profile_info', 'pending_actions'],
  hiddenSections: [],
  leaveTypeOrder: [],
  hiddenLeaveTypes: [],
};
