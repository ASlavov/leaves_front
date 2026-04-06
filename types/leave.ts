import type { BaseMessageResponse } from './common';
import type { User, Leave, LeaveType } from './models';

/** User object augmented with an eager-loaded leaves array (calendar endpoint). */
export interface UserWithLeaves extends User {
  leaves: Leave[];
}

/** Shape returned by GET /api/leaves/getLeavesByUser. */
export interface UserLeavesResponse {
  currentUser: Leave[];
  leavesTypes: LeaveType[];
  [key: string]: any;
}

/** Returned by newLeave. */
export interface LeaveResponse extends BaseMessageResponse {
  leave: Leave;
}

/** Returned by newLeaveType / updateLeaveType. */
export interface LeaveTypeResponse extends BaseMessageResponse {
  leave_type?: LeaveType;
}

/** Available leave days per leave type for a user. */
export interface AvailableDaysEntry {
  leave_type_id: number | string;
  leave_type_name?: string;
  available_days: number;
  remaining_days?: number;
  used_days?: number;
  entitled_days?: number;
  [key: string]: any;
}

export interface LeaveActionPayload {
  userId: string | number;
  leaveId?: string | number;
  leaveTypeId?: string | number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string | number;
  startTime?: string;
  endTime?: string;
  attachmentBase64?: string;
  attachmentFilename?: string;
}

export interface UpdateLeaveTypePayload {
  id: string | number;
  name: string;
  dependsOnTypeId?: string | number | null;
  allowRollover?: boolean;
  priorityLevel?: number;
  allowWalletOverflow?: boolean;
  overflowLeaveTypeId?: string | number | null;
  accrualType?: 'upfront' | 'pro_rata_monthly';
  allowNegativeBalance?: boolean;
  maxNegativeBalance?: number;
  isHourly?: boolean;
  hoursPerDay?: number;
  attachmentRequiredAfterDays?: number | null;
}

export interface AdminLeavePayload {
  userId: string | number;
  leaveTypeId: string | number;
  startDate: string;
  endDate: string;
  reason?: string;
  administrativeReason: string;
  status?: 'approved' | 'pending';
  skipWalletDeduction?: boolean;
}
