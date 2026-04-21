import type { BaseMessageResponse } from './common';
//import type { Entitlement } from './models';

/** Returned by massDeleteEntitlements. */
export interface MassDeleteResponse extends BaseMessageResponse {
  deleted: number;
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
