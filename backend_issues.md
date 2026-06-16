# Backend Issues

The following QA items have been investigated and determined to require backend changes.
They cannot be fixed from the frontend alone.

---

## 1. Group / Department Head Not Persisting on Refresh (QA #4)

**Reported behavior:** When the group head (υπεύθυνος) is changed in "Edit Group", the change saves
successfully and shows in the UI. However, after a full page refresh, the head reverts to the previous user.

**Investigation:**
- The frontend correctly sends `head` (user ID) to `POST /api/departments/editDepartment`,
  which proxies to the Laravel `edit_department` endpoint.
- The frontend re-fetches departments after save (`await getAll()`) and displays the updated data.
- After a hard refresh, the store re-fetches from the backend and the previous head is returned.

**Conclusion:** The backend `edit_department` controller is not persisting the `head` field to the database.
The field is likely being silently ignored in the update logic.

**Fix required on backend:** Ensure the `edit_department` endpoint correctly saves the `head` (user/head_id) 
field when updating a department/group record.

---

## 2. Calendar Sharing — Notifications Show Raw Identifiers Instead of User Names (QA #8)

**Reported behavior:** When a calendar sharing invitation is sent, the notification that appears in the
bell/notification drawer shows raw technical identifiers (e.g., user IDs or class names like 
`App\Models\User`) instead of the actual user's name.

**Investigation:**
- The frontend `UserNotification` component renders `notification.message` and `notification.title` 
  directly as they are returned by the backend.
- The frontend has no post-processing of notification message content.
- The `message` field content is composed entirely on the backend when the notification event is fired.

**Conclusion:** The backend notification handler for calendar invitation events is not formatting the 
`message` field correctly. It is likely interpolating the User model object directly instead of extracting 
`user->name`.

**Fix required on backend:** In the notification class responsible for calendar invitation events,
ensure the `toDatabase()` (or `toArray()`) method formats the `message` field using `$user->name`
instead of the `$user` object directly.

---

## 3. Leave Request Overlap Validation Missing (QA #6)

**Reported behavior:** Users can submit a new leave request that overlaps with an existing approved or
pending leave for the same dates, with no warning or error shown.

**Investigation:**
- The frontend `LeaveRequest` modal submits the date range to the backend without pre-validation.
- There is no frontend-side check for overlapping leave dates as the full leave history is not always
  loaded on the client.
- The business rule enforcement (e.g., "user already has an approved leave for these dates") belongs
  at the API level.

**Conclusion:** The backend `new_leave` endpoint does not validate for date-range overlaps against
existing leaves for the same user. It should return a validation error (4xx) when an overlap is detected,
which the frontend will surface to the user as a toast error.

**Fix required on backend:** Add a validation check in the `new_leave` controller that queries 
`user_leaves` for any existing record (with status `pending` or `approved`) whose date range overlaps 
the requested `[start_date, end_date]` for the same user. Return a 422 with an appropriate error message.

---

## 4. Statistics / Reports Charts Not Updating on Department Filter Change (QA #9)

**Partially frontend, partially backend.**

**Frontend fix applied:** The server-side proxy (`server/api/reports/summary.get.ts`) was updated to:
- Correctly forward `dept_ids[]`, `leave_type_ids[]`, and `user_ids[]` as array parameters
- Handle both single-value and array query params

**Remaining backend concern:** If the backend's `reports/summary` controller ignores the `dept_ids[]` 
filter when computing `by_month`, `by_type`, `top_users`, or `pending_count` (only filtering 
`by_department`), the charts will still not update. 

**Fix required on backend (if applicable):** Ensure ALL summary fields (`by_month`, `by_type`, 
`top_users`, `pending_count`, `headcount`) apply the `dept_ids`, `leave_type_ids`, and `user_ids`
filters when they are provided.
