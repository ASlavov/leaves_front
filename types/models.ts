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

export interface Role {
  id: number | string;
  name: string;
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
  work_schedule?: number[] | null;
  hire_date?: string | null;
  termination_date?: string | null;
  leaves?: Leave[];
  [key: string]: any;
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
  is_administrative?: boolean;
  administrative_reason?: string | null;
  total_hours?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  attachment_base64?: string | null;
  attachment_filename?: string | null;
  parent_leave_id?: number | string | null;
  [key: string]: any;
}

export interface LeaveType {
  id: number | string;
  name: string;
  depends_on_type_id?: number | string | null;
  allow_rollover?: boolean;
  priority_level?: number;
  allow_wallet_overflow?: boolean;
  overflow_leave_type_id?: number | string | null;
  accrual_type?: 'upfront' | 'pro_rata_monthly';
  allow_negative_balance?: boolean;
  max_negative_balance?: number;
  is_hourly?: boolean;
  hours_per_day?: number;
  attachment_required_after_days?: number | null;
  auto_approve?: boolean;
  deleted_at?: string | null;
  [key: string]: any;
}

export interface LeaveStatus {
  id: number | string;
  name: string;
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
