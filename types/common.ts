/** Generic { message } envelope returned by most mutating endpoints. */
export interface BaseMessageResponse {
  message?: string;
}

export interface Notification {
  id: number | string;
  user_id: number | string;
  message: string;
  is_read: boolean;
  created_at?: string;
  [key: string]: any;
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
