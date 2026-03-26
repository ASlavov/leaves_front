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
  *Sets HTTP-only `auth_token` cookie.*
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
