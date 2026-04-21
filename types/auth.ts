import type { BaseMessageResponse } from './common';

/** Returned by login and refreshSession. */
export interface AuthResponse extends BaseMessageResponse {
  userId: number | string;
}

export interface AuthUserPayload {
  email?: string;
  password?: string;
}

export interface UpdatePasswordPayload {
  userId: string | number;
  oldPass: string;
  newPass: string;
}
