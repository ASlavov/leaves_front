export interface ReportSummary {
  year: number;
  by_month: { m: number; days: number }[];
  by_department: { department_id: number; days: number }[];
  by_type: { leave_type_id: number; days: number }[];
  top_users: { user_id: number; days: number; user: { id: number; name: string; email: string } }[];
  pending_count: number;
  headcount: number;
}

export const getReportSummaryComposable = (
  year: number,
  deptIds: number[] = [],
  leaveTypeIds: number[] = [],
) => {
  const qs = new URLSearchParams();
  qs.set('year', String(year));
  deptIds.forEach((d) => qs.append('dept_ids', String(d)));
  leaveTypeIds.forEach((t) => qs.append('leave_type_ids', String(t)));
  return retryFetch<ReportSummary>(`/api/reports/summary?${qs.toString()}`, { method: 'GET' });
};

export interface LeaveBalancesResponse {
  year: number;
  users: { id: number; name: string; email?: string }[];
  leave_types: { id: number; name: string }[];
  rows: {
    user_id: number;
    leave_type_id: number;
    entitled: number;
    remaining: number;
    taken: number;
  }[];
}

export const getLeaveBalancesComposable = (
  year: number,
  userIds: (number | string)[] = [],
  leaveTypeIds: (number | string)[] = [],
) => {
  const qs = new URLSearchParams();
  qs.set('year', String(year));
  userIds.forEach((u) => qs.append('user_ids', String(u)));
  leaveTypeIds.forEach((t) => qs.append('leave_type_ids', String(t)));
  return retryFetch<LeaveBalancesResponse>(`/api/reports/leave-balances?${qs.toString()}`, {
    method: 'GET',
  });
};
