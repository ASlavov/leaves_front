import type { BaseMessageResponse } from './common';
import type { Department } from './models';

/** Returned by create / edit department endpoints. */
export interface DepartmentResponse extends BaseMessageResponse {
  success: boolean;
  data: Department;
}

export interface NewDepartmentPayload {
  groupName: string;
  head: string | number;
  members: (string | number)[];
}

export interface EditDepartmentPayload extends NewDepartmentPayload {
  groupId: string | number;
}
