export interface User {
    id: number | string;
    email: string;
    name?: string;
    roles?: Role[];
    department_id?: number | string;
    phone?: string;
    internal_phone?: string;
    title?: string;
    title_description?: string;
    image?: string;
    permissions?: Record<string, any>;
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
    [key: string]: any;
}

export interface LeaveType {
    id: number | string;
    name: string;
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

// API Payloads
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
