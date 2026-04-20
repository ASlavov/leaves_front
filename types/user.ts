import type { BaseMessageResponse } from './common';
import type { User } from './models';

/** Returned by create / edit user endpoints. */
export interface UserResponse extends BaseMessageResponse {
  success: boolean;
  data: User;
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
  workSchedule?: number[] | null;
  hire_date?: string | null;
  hireDate?: string | null; // Compatibility
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
  hireDate?: string | null;
}
