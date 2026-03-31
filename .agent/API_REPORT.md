# API Field Requirements Report

This report documents the required and optional fields for each API endpoint found in `routes/api.php` and their corresponding controllers.

---

## ApiLoginController

- **POST `/api/getToken`**
  - **Required:** `email` (string, email), `password` (string)
  - **Optional:** None
- **POST `/api/generateToken`**
  - **Required:** `userId` (numeric-ish)
  - **Optional:** None

---

## UserController

- **GET `/api/users`**
  - **Required:** None
- **POST `/api/users`** (store)
  - **Required:** `name` (string), `email` (email, unique), `department_id` (exists in departments), `password` (string), `role_id` (exists in roles), `profile_image` (string/base64)
  - **Optional:** `phone` (numeric), `internal_phone` (numeric), `job_title` (string), `job_description` (string)
- **PUT `/api/user-update`**
  - **Required:** `user_id` (exists in users)
  - **Optional:** `name` (string), `email` (email, unique), `department_id` (exists in departments), `role_id` (exists in roles), `phone` (numeric), `internal_phone` (numeric), `job_title` (string), `job_description` (string), `profile_image` (string/base64)
- **GET `/api/usersbystatus`**
  - **Required:** `user_status` (query param)
- **GET `/api/user/{id}`**
  - **Path Param:** `id`
- **PUT `/api/user-update-password`**
  - **Required:** `user_id` (exists), `old_password` (string), `password` (string)

---

## DepartmentController

- **GET `/api/departments`**
  - **Required:** None
- **POST `/api/create_department`** (store)
  - **Required:** `name` (string, unique), `head` (exists in users)
  - **Optional:** `related_departments` (array of IDs), `users` (array of IDs)
- **PUT `/api/edit_department`**
  - **Required:** `department_id` (exists), `name` (string), `head` (exists in users)
  - **Optional:** `related_departments` (array of IDs), `users` (array of IDs)
- **DELETE `/api/delete_department/{id}`**
  - **Path Param:** `id`
  - **Note:** Method `delete` is MISSING in `DepartmentController.php`.

---

## InvitationController

- **GET `/api/invitations`**
  - **Required:** `user_id` (query param, integer, exists:users)
- **POST `/api/new-invitation`**
  - **Required:** `user_id_from` (int), `user_id_to` (array of ints)
  - **Optional:** `status` (pending, accepted, declined)
- **PATCH `/api/invitations/{id}/status`**
  - **Required:** `user_id`, `status` (pending, accepted, declined)
  - **Path Param:** `id`
- **DELETE `/api/invitations/{id}`**
  - **Required:** `user_id` (body, integer, exists:users) — must be sender or receiver
  - **Path Param:** `id`
  - **Note:** Cleans up `connected_users` on the sender if invitation was accepted.

---

## PublicHolidaysController

- **GET `/api/public-holidays`**
  - **Optional:** `year` (query param, integer) — filters moving holidays by year; recurring always returned
- **POST `/api/public-holidays`**
  - **Required:** `date` (date), `name` (string)
  - **Optional:** `is_recurring` (boolean, default true)
- **PUT `/api/public-holidays/{id}`**
  - **Required:** `date` (date), `name` (string)
  - **Optional:** `is_recurring` (boolean)
  - **Path Param:** `id`
- **DELETE `/api/public-holidays/{id}`**
  - **Path Param:** `id`
- **POST `/api/public-holidays/batch`**
  - **Required:** `dates` (array of date strings), `name` (string)
  - **Optional:** `is_recurring` (boolean, default true)
  - **Note:** Uses `insertOrIgnore` — duplicate dates are silently skipped.
- **DELETE `/api/public-holidays/batch`**
  - **Required:** `ids` (array of integers)

---

## CompanySettingsController

- **GET `/api/company-settings/work-week`**
  - **Required:** None
  - **Success Response:** `{"days": [1,2,3,4,5]}`
- **PUT `/api/company-settings/work-week`**
  - **Required:** `days` (array of integers, each 0–6)
  - **Note:** Array is validated, sorted, and stored as JSON under key `work_week`.

---

## LeaveActionController

- **GET `/api/leave_action`**
  - **Required:** None
- **GET `/api/get_user_actions`**
  - **Required:** `userId`, `leaveId`

---

## LeaveEntitlementController

- **GET `/api/entitlement_days/{id}`**
  - **Path Param:** `id`
- **POST `/api/entitlement`** (store)
  - **Required:** `user_id`, `leave_type_id`, `entitled_days`, `year`, `start_from`, `end_to`
- **PUT `/api/entitlement/{id}`** (update)
  - **Required:** `user_id`, `leave_type_id`, `entitled_days`, `year`, `start_from`, `end_to`
  - **Path Param:** `id`
- **DELETE `/api/entitlement/{id}`** (destroy)
  - **Path Param:** `id`
- **POST `/api/import-workfromhome`**
  - **Required:** `userIds` (array), `leave_type_id`, `entitled_days`, `year`
- **POST `/api/import-mass-leaves`**
  - **Required:** `userIds` (array), `leave_type_id`, `entitled_days`, `year`
  - **Optional:** `startDate`, `endDate` (used in code but not explicitly in validator)

---

## LeavesController

- **POST `/api/new_leave`**
  - **Required:** `id` (user_id), `leave_type_id`, `start_date`, `end_date`
  - **Optional:** `reason`
- **GET `/api/user_leaves/{id}`**
  - **Path Param:** `id`
- **GET `/api/all_user_leaves/{id}`**
  - **Path Param:** `id`
- **POST/PUT `/api/processed_leave`**
  - **Required:** `leave_id`, `user_editor`, `status`
  - **Optional:** `reason`

---

## LeavesTypeController

- **GET `/api/leaves_types`**
  - **Required:** None
- **POST `/api/new_leave_type`**
  - **Required:** `leave_type_name`
- **PUT `/api/update_leave_type`**
  - **Required:** `leave_type_id`, `leave_type_name`
- **DELETE `/api/delete_leave_type`**
  - **Required:** `leave_type_id` (sent in request body or query, route is DELETE)

---

## NotificationController

- **GET `/api/get-notifications`** (index)
  - **Required:** None
- **GET `/api/user-notifications/{id}`** (notificationUser)
  - **Path Param:** `id`
- **PUT `/api/notification-marked-read/{id}`** (markedRead)
  - **Path Param:** `id`
- **PUT `/api/notification-marked-unread/{id}`** (markedUnread)
  - **Path Param:** `id`
