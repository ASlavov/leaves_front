export interface UserProfile {
  id?: number;
  user_id?: number;
  phone?: string | null;
  internal_phone?: number | string | null;
  job_title?: string | null;
  job_description?: string | null;
  title_description?: string | null;
  profile_image_base64?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number | string;
  email: string;
  name?: string;
  roles?: Role[];
  department_id?: number | string;
  department?: { id: number | string; name: string };
  profile?: UserProfile;
  phone?: string;
  internal_phone?: string;
  title?: string;
  title_description?: string;
  image?: string;
  permissions?: Record<string, any>;
  leaves?: Leave[];
  [key: string]: any;
}

export interface Role {
  id: number | string;
  name: string;
}

export interface Department {
  id: number | string;
  name: string;
  head_id?: number | string;
  members?: (number | string)[];
  [key: string]: any;
}

export interface Leave {
  id: number | string;
  user_id: number | string;
  leave_type_id: number | string;
  start_date: string;
  end_date: string;
  reason?: string;
  status_id?: number | string;
  status?: string;
  [key: string]: any;
}

export interface LeaveType {
  id: number | string;
  name: string;
  depends_on_type_id?: number | string | null;
  allow_rollover?: boolean;
  deleted_at?: string | null;
  [key: string]: any;
}

export interface Notification {
  id: number | string;
  user_id: number | string;
  message: string;
  is_read: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface Entitlement {
  id: number | string;
  user_id: number | string;
  leave_type_id: number | string;
  start_from: string;
  days: number;
  year?: number;
  [key: string]: any;
}

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface LeaveStatus {
  id: number | string;
  name: string;
}

/** Generic { message } envelope returned by most mutating endpoints. */
export interface BaseMessageResponse {
  message?: string;
}

/** Returned by login and refreshSession. */
export interface AuthResponse extends BaseMessageResponse {
  userId: number | string;
}

/** Returned by create / edit user endpoints. */
export interface UserResponse extends BaseMessageResponse {
  success: boolean;
  data: User;
}

/** Returned by create / edit department endpoints. */
export interface DepartmentResponse extends BaseMessageResponse {
  success: boolean;
  data: Department;
}

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

/** Returned by massDeleteEntitlements. */
export interface MassDeleteResponse extends BaseMessageResponse {
  deleted: number;
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

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AuthUserPayload {
  email?: string;
  password?: string;
}

export interface UpdatePasswordPayload {
  userId: string | number;
  oldPass: string;
  newPass: string;
}

export interface EditUserPayload {
  userId: string | number;
  userName?: string;
  userEmail?: string;
  userDepartment?: string | number;
  userRole?: string | number | any[];
  userPhone?: string;
  userInternalPhone?: string;
  userTitle?: string;
  userTitleDescription?: string;
  userImage?: any;
}

export interface AddUserPayload {
  userName: string;
  userEmail: string;
  userDepartment: string | number;
  userRole: string | number;
  userPassword: string;
  userPhone?: string;
  userInternalPhone?: string;
  userTitle?: string;
  userTitleDescription?: string;
  userImage?: string;
}

export interface NewDepartmentPayload {
  groupName: string;
  head: string | number;
  members: (string | number)[];
}

export interface EditDepartmentPayload extends NewDepartmentPayload {
  groupId: string | number;
}

export interface AddEntitlementPayload {
  userId?: string | number;
  userIds?: (string | number)[];
  leaveTypeId: string | number;
  entitledDays: number;
  year: number;
  startDate: string;
  endDate: string;
  rolloverPrevious?: boolean;
  rolloverUntil?: string;
}

export interface UpdateEntitlementPayload extends AddEntitlementPayload {
  entitlementId: string | number;
}

export interface LeaveActionPayload {
  userId: string | number;
  leaveId?: string | number;
  leaveTypeId?: string | number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string | number;
}

export interface UpdateLeaveTypePayload {
  id: string | number;
  name: string;
  dependsOnTypeId?: string | number | null;
  allowRollover?: boolean;
}

export interface PublicHoliday {
  id: number | string;
  date: string;
  name: string;
  is_recurring: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkWeekSettings {
  days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface InvitationUser {
  id: number | string;
  name?: string;
  email: string;
}

export interface Invitation {
  id: number | string;
  user_id_from: number | string;
  user_id_to: number | string;
  status: 'pending' | 'accepted' | 'declined';
  sender?: InvitationUser;
  receiver?: InvitationUser;
  created_at?: string;
  updated_at?: string;
}
