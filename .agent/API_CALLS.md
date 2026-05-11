# API Calls Documentation

This document maps the API calls made by the Nuxt frontend to the Laravel backend, including the intermediary Nuxt server-side routes.

## Overview

The Nuxt project uses a server-side proxy layer (`server/api/**`) to communicate with the Laravel backend. Authentication is handled via a secure HTTP-only cookie containing a JWT, which encapsulates the Laravel Sanctu token.

---

## 1. Authentication

### Login

- **Frontend Path:** `/api/auth/login`
- **Method:** `POST`
- **Backend Path:** `/getToken`
- **Parameters:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "userId": 1,
    "message": "Authenticated successfully"
  }
  ```
  _Sets HTTP-only `auth_token` cookie._
- **Error Response (401 Unauthorized):**
  ```json
  {
    "statusCode": 401,
    "statusMessage": "Authentication failed"
  }
  ```

### Refresh Session

- **Frontend Path:** `/api/auth/refreshSession`
- **Method:** `GET`
- **Backend Path:** `/generateToken`
- **Success Response (200 OK):**
  ```json
  {
    "userId": 1,
    "message": "Session refreshed"
  }
  ```
- **Error Response (403 Forbidden):**
  ```json
  {
    "statusCode": 403,
    "statusMessage": "Invalid or expired authentication token"
  }
  ```

---

## 2. User Management

### Get User Profile

- **Frontend Path:** `/api/user/getProfile`
- **Method:** `POST`
- **Backend Path:** `/user/{id}`
- **Parameters:**
  ```json
  {
    "userId": 1
  }
  ```
- **Success Response (200 OK):** User object with `profile`, `department`, and `roles`.
- **Error Response (404 Not Found):** `"No User with this id"`

### Get All Users

- **Frontend Path:** `/api/user/getAllUsers`
- **Method:** `POST`
- **Backend Path:** `/users`
- **Success Response (200 OK):** Array of all user objects.

### Edit User

- **Frontend Path:** `/api/user/editUser`
- **Method:** `POST`
- **Backend Path:** `/user-update`
- **Parameters:** `userId`, `name`, `email`, `department_id`, `role_id`, `phone`, `internal_phone`, `job_title`, `job_description`, `profile_image` (Base64).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User updated successfully!",
    "data": { ...user }
  }
  ```

---

## 3. Leaves

### Get User Leaves

- **Frontend Path:** `/api/leaves/getLeavesByUser`
- **Method:** `POST`
- **Backend Path:** `/user_leaves/{id}`
- **Parameters:** `userId`
- **Success Response (200 OK):** Array of leaf requests, including connected users' leaves if applicable.

### New Leave Request

- **Frontend Path:** `/api/leaves/newLeave`
- **Method:** `POST`
- **Backend Path:** `/new_leave`
- **Parameters:** `id` (User ID), `leave_type_id`, `start_date`, `end_date`, `reason`.
- **Success Response (201 Created):**
  ```json
  {
    "message": "Leave request created successfully",
    "leave": { ...leave }
  }
  ```

### Process Leave (Approve/Reject)

- **Frontend Path:** `/api/leaves/processLeave`
- **Method:** `POST`
- **Backend Path:** `/processed_leave`
- **Parameters:** `leave_id`, `user_editor` (Admin/Head ID), `status` (approved/rejected/cancelled), `reason`.
- **Success Response (200 OK):** Updated leave object.

---

## 4. Departments

### Get All Departments

- **Frontend Path:** `/api/departments/getAll`
- **Method:** `POST`
- **Backend Path:** `/departments`
- **Success Response (200 OK):** Array of department objects with `head` and `relatedDepartments`.

### New Department

- **Frontend Path:** `/api/departments/newDepartment`
- **Method:** `POST`
- **Backend Path:** `/create_department`
- **Parameters:** `name`, `head` (User ID), `users` (Array of User IDs), `related_departments` (Array of ID).
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Department created successfully!",
    "data": { ... }
  }
  ```

### Edit Department

- **Frontend Path:** `/api/departments/editDepartment`
- **Method:** `POST`
- **Backend Path:** `/edit_department` (Laravel `PUT`)
- **Parameters:** `groupId`, `groupName`, `head` (User ID), `members` (Array of User IDs).
- **Backend Payload (mapped by Nuxt):** `department_id`, `name`, `head`, `users`.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Department updated successfully!",
    "data": { ... }
  }
  ```

---

## 5. Entitlements

### Get Entitled Days

- **Frontend Path:** `/api/entitlement/get`
- **Method:** `POST`
- **Backend Path:** `/entitlement_days/{id}`
- **Parameters:** `userId`
- **Success Response (200 OK):** Array of entitlement objects for the current month/year.

### Mass Import Leaves

- **Frontend Path:** `/api/entitlement/massLeaves`
- **Method:** `POST`
- **Backend Path:** `/import-mass-leaves`
- **Parameters:** `userIds` (Array), `leave_type_id`, `entitled_days`, `year`, `startDate`, `endDate`.
- **Success Response (201 Created):** `{"message": "Monthly entitlements created successfully for the user"}`

---

## 6. Notifications

### Get User Notifications

- **Frontend Path:** `/api/notifications/getNotifications`
- **Method:** `POST`
- **Backend Path:** `/user-notifications/{id}`
- **Parameters:** `userId`
- **Success Response (200 OK):** Array of notification objects.

### Mark Read/Unread

- **Frontend Path:** `/api/notifications/markedRead` | `/markedUnread`
- **Method:** `POST`
- **Backend Path:** `/notification-marked-read/{id}` | `/notification-marked-unread/{id}`
- **Parameters:** `notificationId`
- **Success Response (200 OK):** `{"message": "Notification marked as read/unread successfully."}`

---

## 7. Public Holidays

### Get Holidays

- **Frontend Path:** `/api/holidays`
- **Method:** `GET`
- **Backend Path:** `/public-holidays`
- **Query Params:** `year` (optional integer — omit to get all recurring + current-year moving)
- **Success Response (200 OK):** Array of `PublicHoliday` objects.

### Create Holiday

- **Frontend Path:** `/api/holidays`
- **Method:** `POST`
- **Backend Path:** `/public-holidays`
- **Parameters:** `date` (YYYY-MM-DD), `name` (string), `is_recurring` (boolean, default true)
- **Success Response (201 Created):** Created `PublicHoliday` object.

### Update Holiday

- **Frontend Path:** `/api/holidays/:id`
- **Method:** `PUT`
- **Backend Path:** `/public-holidays/{id}`
- **Parameters:** `date`, `name`, `is_recurring`
- **Success Response (200 OK):** Updated `PublicHoliday` object.

### Delete Holiday

- **Frontend Path:** `/api/holidays/:id`
- **Method:** `DELETE`
- **Backend Path:** `/public-holidays/{id}`
- **Success Response (200 OK):** `{"message": "Holiday deleted."}`

### Batch Create Holidays

- **Frontend Path:** `/api/holidays/batch`
- **Method:** `POST`
- **Backend Path:** `/public-holidays/batch`
- **Parameters:** `dates` (string[], YYYY-MM-DD), `name` (string), `is_recurring` (boolean)
- **Success Response (200 OK):** `{"created": number, "holidays": PublicHoliday[]}`

### Batch Delete Holidays

- **Frontend Path:** `/api/holidays/batchDelete`
- **Method:** `DELETE`
- **Backend Path:** `/public-holidays/batch`
- **Parameters:** `ids` (number[])
- **Success Response (200 OK):** `{"deleted": number}`

---

## 8. Company Settings

### Get Work Week

- **Frontend Path:** `/api/settings/workWeek`
- **Method:** `GET`
- **Backend Path:** `/company-settings/work-week`
- **Success Response (200 OK):** `{"days": [1,2,3,4,5]}` (0=Sunday … 6=Saturday)

### Update Work Week

- **Frontend Path:** `/api/settings/workWeek`
- **Method:** `PUT`
- **Backend Path:** `/company-settings/work-week`
- **Parameters:** `days` (integer[], each 0–6)
- **Success Response (200 OK):** `{"days": [...]}`

---

## 9. Calendar Invitations

### List Invitations

- **Frontend Path:** `/api/invitations`
- **Method:** `GET`
- **Backend Path:** `/invitations?user_id={id}`
- **Notes:** `user_id` injected server-side from `event.context.requestingUserId`; not sent by client.
- **Success Response (200 OK):**
  ```json
  {
    "sent": ["...Invitation[] with receiver"],
    "received": ["...Invitation[] with sender"]
  }
  ```

### Send Invitation

- **Frontend Path:** `/api/invitations`
- **Method:** `POST`
- **Backend Path:** `/new-invitation`
- **Parameters:** `user_id_from` (int), `user_id_to` (int[])
- **Success Response (201 Created):** `{"message": "...", "invitations": Invitation[]}`

### Update Invitation Status (Accept / Decline)

- **Frontend Path:** `/api/invitations/:id`
- **Method:** `PATCH`
- **Backend Path:** `/invitations/{id}/status`
- **Parameters:** `user_id` (int), `status` ("accepted" | "declined")
- **Success Response (200 OK):** `{"message": "...", "invitation": Invitation}`

### Revoke Invitation

- **Frontend Path:** `/api/invitations/:id`
- **Method:** `DELETE`
- **Backend Path:** `/invitations/{id}`
- **Notes:** `user_id` injected server-side from `event.context.requestingUserId`; not sent by client.
- **Success Response (200 OK):** `{"message": "Invitation revoked successfully."}`

---

## 10. Administrative Leave (HR/Admin)

### Record Leave for User

- **Frontend Path:** `/api/leaves/adminLeave`
- **Method:** `POST`
- **Backend Path:** `/admin-leave`
- **Parameters:** `user_id`, `leave_type_id`, `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD), `reason` (optional), `administrative_reason` (optional)
- **Notes:** Bypasses wallet/entitlement checks. Sets `is_administrative = true` on the leave record. HR and Admin roles only.
- **Success Response (201 Created):**
  ```json
  { "message": "Leave recorded successfully", "leave": { ...leave } }
  ```

---

## 11. User Termination

### Terminate User

- **Frontend Path:** `/api/user/terminate/:id`
- **Method:** `POST`
- **Backend Path:** `/user-terminate/{id}`
- **Parameters:** `termination_date` (YYYY-MM-DD)
- **Notes:** Sets `termination_date` on the user and cancels all future pending/approved leaves.
- **Success Response (200 OK):** `{"message": "User terminated. N future leaves cancelled."}`

---

## 12. Leave Types (Rules Engine)

### Get Leave Types

- **Frontend Path:** `/api/leaves/leavesTypes`
- **Method:** `GET`
- **Backend Path:** `/leaves_types`
- **Success Response (200 OK):** Array of `LeaveType` objects including all rules-engine fields.

### Create Leave Type

- **Frontend Path:** `/api/leaves/newLeaveType`
- **Method:** `POST`
- **Backend Path:** `/new_leave_type`
- **Parameters:** `leave_type_name` (string), plus optional rules-engine fields: `priority_level`, `allow_wallet_overflow`, `overflow_leave_type_id`, `accrual_type` (upfront|pro_rata_monthly), `allow_negative_balance`, `max_negative_balance`, `is_hourly`, `hours_per_day`, `attachment_required_after_days`.
- **Success Response (201 Created):** Created `LeaveType` object.

### Update Leave Type

- **Frontend Path:** `/api/leaves/updateLeaveType`
- **Method:** `PUT`
- **Backend Path:** `/update_leave_type`
- **Parameters:** `leave_type_id`, `leave_type_name`, plus any rules-engine fields to update.
- **Success Response (200 OK):** Updated `LeaveType` object.
