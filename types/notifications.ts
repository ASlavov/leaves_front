// types/notifications.ts
export type NotificationType =
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_declined'
  | 'leave_cancelled'
  | 'leave_auto_approved'
  | 'leave_requested_head_info'
  | 'unknown';

export interface NotificationMeta {
  leave_id?: number;
  requesting_user_id?: number;
  requesting_user_name?: string;
  department_name?: string;
  leave_type_name?: string;
  date_from?: string;
  date_to?: string;
  days_count?: number;
}

export interface Notification {
  id: string;                   // Laravel notification IDs are UUIDs
  user_id: number | string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;             // always boolean — normalised in BFF
  created_at: string;
  meta: NotificationMeta;
}
