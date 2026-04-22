export interface BaseMessageResponse {
  message?: string;
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
