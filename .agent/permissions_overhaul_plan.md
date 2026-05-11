# Permissions System Overhaul Plan

**Date:** 2026-04-22  
**Branch:** aris_improvements  
**Goal:** Move frontend-hardcoded permissions to the backend, make them Admin-editable, and apply two new role permission requirements.

---

## Context & Motivation

Currently, all permission logic lives in `stores/permissions.ts` as a static JavaScript object. There is no API call; no persistence; no way to change who can do what without a code deploy. Two new requirements expose why this is inadequate:

1. **HR** should be able to request leave for themselves but **not** accept/decline.
2. **Head** should be notified when a dept member requests leave but **not** accept/decline. Only **Admin** can accept/decline.

These are the first two customizations in what will likely become a long list. The right fix is a dynamic, backend-driven permission system editable by Admin through the UI.

---

## New Default Permissions (vs. Current)

| Category | Action | Old Roles | New Roles |
|---|---|---|---|
| `profile_leave_balance` | `accept_leave` | admin, hr-manager, head | **admin** |
| `profile_leave_balance` | `decline_leave` | admin, hr-manager, head | **admin** |
| `profile_leave_balance` | `request_leave` | admin, hr-manager, head, user | admin, hr-manager, head, user *(no change)* |

The Head notification requirement is a separate concern (push notification on new leave request for dept heads) and is covered in Phase 5.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Frontend (Nuxt/Vue)                            │
│  stores/permissions.ts  ──  API call on init    │
│  components use can() / hasRole()  unchanged    │
│  Settings/Permissions.vue  ──  editable matrix  │
└──────────────────┬──────────────────────────────┘
                   │ /api/permissions/*
┌──────────────────▼──────────────────────────────┐
│  Nuxt Server (BFF layer)                        │
│  server/api/permissions/index.get.ts  (GET)     │
│  server/api/permissions/index.put.ts  (PUT)     │
│  server middleware: enforce critical routes     │
└──────────────────┬──────────────────────────────┘
                   │ proxies to Laravel
┌──────────────────▼──────────────────────────────┐
│  Laravel Backend                                │
│  permissions table (role_key, category, action) │
│  seeded from current hardcoded defaults         │
│  CRUD endpoints (admin-only)                    │
└─────────────────────────────────────────────────┘
```

---

## Phase 1 — Laravel Backend Changes

> These changes are outside the Nuxt codebase. Describe to the Laravel developer or implement if you have access.

### 1.1 Database Migration

```sql
CREATE TABLE role_permissions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_key    VARCHAR(50)  NOT NULL,  -- 'admin', 'hr-manager', 'head', 'user'
  category    VARCHAR(100) NOT NULL,  -- 'profile_leave_balance', 'reports', etc.
  action      VARCHAR(100) NOT NULL,  -- 'view', 'accept_leave', etc.
  allowed     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_role_cat_action (role_key, category, action)
);
```

### 1.2 Seed with Current Defaults (NEW defaults applied)

Seed the entire current permissions matrix from `stores/permissions.ts`, with the updated `accept_leave` / `decline_leave` restricted to admin only.

### 1.3 New Laravel Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/permissions` | Any authenticated | Returns flat list of {role_key, category, action, allowed} for all roles |
| GET | `/api/v1/permissions/me` | Any authenticated | Returns only the allowed actions for the requesting user's role(s) |
| PUT | `/api/v1/permissions` | Admin only | Accepts array of {role_key, category, action, allowed} to batch-update |

The `/me` endpoint is what the frontend will call on init — it returns the resolved flat permission set for the logged-in user. The full matrix endpoint is only needed by the admin Settings page.

**Response shape for `/me`:**
```json
{
  "permissions": {
    "profile_leave_balance": {
      "view": true,
      "request_leave": true,
      "cancel_leave": true,
      "accept_leave": false,
      "decline_leave": false,
      "record_admin_leave": false
    },
    "reports": {
      "view": false,
      "export": false
    }
    // ... all categories
  }
}
```

**Response shape for full matrix (admin):**
```json
{
  "matrix": {
    "profile_leave_balance": {
      "view": ["admin", "hr-manager", "head", "user"],
      "accept_leave": ["admin"]
    }
    // ...
  },
  "roles": ["admin", "hr-manager", "head", "user"],
  "categories": { ... }
}
```

---

## Phase 2 — Nuxt Server Proxy Routes

Create three new server API files. All proxy to Laravel with the auth token as usual.

### 2.1 `server/api/permissions/index.get.ts`

Fetches the full permissions matrix (admin Settings page use).  
Enforces that the requesting user is admin — returns 403 otherwise.

```ts
// GET /api/permissions
// Admin only - full editable matrix
export default defineEventHandler(async (event) => {
  const { token, requestingUserId } = event.context;
  if (!token) throw createError({ statusCode: 403 });

  // Proxy to Laravel
  const data = await $fetch(`${config.apiBase}/api/v1/permissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
```

### 2.2 `server/api/permissions/me.get.ts`

Fetches resolved permissions for the current user. Called on every app init.

```ts
// GET /api/permissions/me
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403 });

  const data = await $fetch(`${config.apiBase}/api/v1/permissions/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
```

### 2.3 `server/api/permissions/index.put.ts`

Admin updates the matrix.

```ts
// PUT /api/permissions
// Admin only
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403 });

  const body = await readBody(event);

  const data = await $fetch(`${config.apiBase}/api/v1/permissions`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  return data;
});
```

### 2.4 Server Middleware: Enforce Critical Routes

Add lightweight role checks to the most sensitive Nuxt server routes so that even if the frontend is bypassed, the BFF rejects unauthorized calls. This is a defense-in-depth layer; Laravel already enforces on its side.

Routes to protect with a role-check helper:

| Route | Minimum Role |
|---|---|
| `server/api/leaves/processLeave.post.ts` | admin (after permission change) |
| `server/api/admin/**` | admin |
| `server/api/user/editUser.post.ts` | admin, hr-manager |
| `server/api/permissions/index.put.ts` | admin |

Create `server/utils/requireRole.ts`:
```ts
export async function requireRole(event: H3Event, allowedRoles: string[]) {
  // Fetch user profile using the token already on context
  // Check role against allowedRoles
  // Throw 403 if not satisfied
}
```

---

## Phase 3 — Frontend Permissions Store Refactor

**File:** `stores/permissions.ts`

### 3.1 Replace Static Object with Reactive State

```ts
// NEW shape
const permissionsMatrix = ref<Record<string, Record<string, boolean>>>({});
const fullMatrix = ref<Record<string, Record<string, string[]>>>({});
const initialized = ref(false);
const loading = ref(false);
```

### 3.2 Add `init()` Function

```ts
async function init() {
  loading.value = true;
  try {
    const data = await $fetch('/api/permissions/me');
    permissionsMatrix.value = data.permissions;
    initialized.value = true;
  } finally {
    loading.value = false;
  }
}
```

### 3.3 Update `can()` to Use Reactive Matrix

```ts
const can = (category: string, action: string): boolean => {
  if (!initialized.value) return false;
  return permissionsMatrix.value?.[category]?.[action] ?? false;
};
```

### 3.4 Add `fetchFullMatrix()` for Admin Settings Page

```ts
async function fetchFullMatrix() {
  const data = await $fetch('/api/permissions');
  fullMatrix.value = data.matrix;
}

async function updateMatrix(newMatrix: Record<string, Record<string, string[]>>) {
  await $fetch('/api/permissions', { method: 'PUT', body: { matrix: newMatrix } });
  fullMatrix.value = newMatrix;
  // Re-fetch own resolved permissions so UI updates immediately
  await init();
}
```

### 3.5 Add `reset()` for Logout

```ts
function reset() {
  permissionsMatrix.value = {};
  fullMatrix.value = {};
  initialized.value = false;
}
```

---

## Phase 4 — Store Initialization Order

**File:** `stores/centralStore.ts`

Permissions must be fetched **before** any component renders and before any other store init that gates on permissions. The current init sequence does not include `permissionsStore.init()` at all.

### New init() Sequence

```ts
async function init() {
  try {
    if (!userStore.userId) throw new Error('No user id');

    // STEP 0: Permissions FIRST — everything depends on this
    await permissionsStore.init();

    // STEP 1: Core user + department data
    await Promise.all([userStore.init(), departmentsStore.init(), notificationsStore.init()]);

    // STEP 2: Everything else in parallel
    await Promise.all([
      userStore.getAllUsers(),
      leavesStore.init(userStore.userId),
      entitlementStore.init(),
      holidaysStore.fetchHolidays(),
      workWeekStore.fetchWorkWeek(),
      invitationsStore.fetchInvitations(),
      orgChartStore.fetchOrgChart(),
      documentsStore.fetchDocuments(),
      dashboardPreferencesStore.fetchPreferences(),
    ]);

    initialized.value = true;
  } catch (err) {
    setError((err as Error).message || String(err));
    initialized.value = false;
  }
}
```

Also add `permissionsStore.reset()` to the `logout()` function.

---

## Phase 5 — Admin UI: Editable Permissions Matrix

**File:** `components/Settings/Permissions.vue`

Currently this component exists but is read-only. It needs to become an interactive toggle matrix.

### 5.1 Layout

- Rows = permission categories + actions (e.g. "Leave Balance > Accept")
- Columns = roles (admin, hr-manager, head, user)
- Cells = toggle checkbox (enabled/disabled)
- Admin role column is read-only (always full access, cannot be stripped)
- "Save Changes" button — calls `permissionsStore.updateMatrix()`
- Unsaved changes indicator

### 5.2 Constraints (enforced in UI and backend)

- The `admin` role always has ALL permissions — UI disables those checkboxes
- The `permissions.modify` permission is always admin-only and cannot be changed
- Certain actions are logically dependent (e.g., can't have `modify` without `view`) — add validation

### 5.3 Data Flow

```
mount → permissionsStore.fetchFullMatrix() → render matrix
toggle cell → local state update
save → permissionsStore.updateMatrix(localMatrix) → re-fetch /me → UI re-renders
```

---

## Phase 6 — Head Notification on Leave Request

This is separate from the permission matrix but was mentioned as a requirement.

When a user submits a leave request, the Head of their department should receive a notification. This is **informational only** — no accept/decline action.

### 6.1 Backend (Laravel)

When a leave request is created, Laravel should:
1. Look up the requesting user's department
2. Find users in that department with role `head`
3. Create a notification record for each Head found

This is likely already partially in place (the notification system exists). Confirm with the Laravel developer.

**Note:** WFH auto-approved leaves (Phase 8) should also trigger this notification so Heads are kept informed even when no action is required.

### 6.2 Nuxt / Frontend

No frontend changes needed for this. The existing notification polling system will pick up the new notification. The notification should read something like:

> "{{employee_name}} from {{department_name}} has submitted a leave request."

The Head sees this notification but has no accept/decline button — that is enforced by the updated `accept_leave` / `decline_leave` permissions being admin-only.

---

## Phase 7 — Types Update

**File:** `types/models.ts` (or a new `types/permissions.ts`)

```ts
export interface PermissionMatrix {
  [category: string]: {
    [action: string]: boolean;
  };
}

export interface FullPermissionMatrix {
  [category: string]: {
    [action: string]: string[];  // array of role keys
  };
}

export interface PermissionCategory {
  key: string;
  label: string;
  actions: PermissionAction[];
}

export interface PermissionAction {
  key: string;
  label: string;
}
```

---

## Phase 8 — Auto-Approve Leave Types (WFH)

### Background

Certain leave types — the canonical example being "Work from home" — should be approved instantly without requiring Admin action. The original Gemini proposal identified this correctly but suggested looking up the leave type by the hardcoded string `"Work from home"`. That is fragile: a typo, a translation, or a rename breaks it silently.

The better model is a first-class `auto_approve` flag on the leave type itself. This integrates cleanly with the rest of this overhaul: admins can toggle auto-approval per leave type through the existing leave types settings UI, with no code changes.

---

### 8.1 Laravel — Database Migration

Add a single column to the existing `leave_types` table:

```sql
ALTER TABLE leave_types
  ADD COLUMN auto_approve TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'If 1, new requests of this type are immediately set to approved';
```

Seed: set `auto_approve = 1` on the row where `name = 'Work from home'` (one-time, safe to run again).

---

### 8.2 Laravel — `LeavesController@newLeave` Changes

The auto-approval path must sit **after** all validation and balance checks, **inside** the same database transaction used to create the leave record. This is non-negotiable: an auto-approved leave that failed a balance check would be a data integrity bug.

```
newLeave():
  1. Validate request payload
  2. Resolve leave type → check auto_approve flag
  3. Run rules engine (balance, rollover/FIFO, negative-balance policy)
     → If any rule fails, abort and return 422 — auto_approve is irrelevant here
  4. Open DB transaction
     a. Create leave record
        - If auto_approve: set status='approved', processed_at=now(),
          processed_reason='Automatically approved.'
        - Else: set status='pending'
     b. Deduct from entitlement wallet (FIFO: oldest expiry date first)
  5. Commit transaction
  6. Dispatch notifications (see §8.3)
  7. Return leave record
```

**Key point:** step 3 happens unconditionally before step 4. A WFH request with zero balance is rejected with the same "Not enough entitlement days available" error as any other leave type. Auto-approval does not bypass the rules engine — it only replaces the human approval step for requests that already passed.

---

### 8.3 Notifications for Auto-Approved Leaves

When `auto_approve` is true, the notification content should differ from a standard pending request.

**User notification:**
> "Your Work from home request from [date] to [date] has been automatically approved."

**Admin notification** (and Head notification per Phase 6):
> "Work from home request by [User] ([date]–[date]) was automatically approved."

The existing notification infrastructure handles delivery; only the message strings change. Add new translation keys in both the Laravel side and in `locales/en.json` / `locales/el.json`.

---

### 8.4 Leave Types API — Expose `auto_approve`

The Nuxt proxy route for leave types (`/api/leaves/getLeavesTypes`) must pass through the `auto_approve` field in its response so the frontend can read and display it.

No new Nuxt routes are needed; this is just ensuring the field is not stripped in the proxy.

---

### 8.5 Frontend — Leave Types Settings UI

**File:** `components/Settings/` (wherever leave types are managed)

Add a toggle per leave type row: "Auto-approve requests". Admin-only, gated on `can('leave_types', 'modify')`.

When toggled and saved, call the existing update leave type endpoint with the `auto_approve` field included in the payload.

---

### 8.6 Frontend — Leave Request Submission Feedback

**File:** `components/Home/NewLeave.vue` (or wherever the leave request form lives)

After a successful submission, check the returned leave's `status` field:

```ts
if (newLeave.status === 'approved') {
  // Show: "Your request was automatically approved."
} else {
  // Show: "Your request has been submitted and is awaiting approval."
}
```

This is purely a UX improvement — the data is already correct either way.

---

### 8.7 Type Update

Add `auto_approve` to the leave type type definition:

```ts
// types/models.ts or types/leaves.ts
interface LeaveType {
  id: number;
  name: string;
  // ... existing fields
  auto_approve: boolean;
}
```

---

### 8.8 Verification Checklist

These replace the `php -l` syntax check from the original proposal, which only proves the file parses — not that the logic is correct.

**Balance enforcement (most important):**
- [ ] Submit WFH with sufficient balance → status is `approved`, balance deducted
- [ ] Submit WFH with balance = 0 and `allow_negative_balance = false` → rejected with 422, no record created
- [ ] Submit WFH with balance = 0 and `allow_negative_balance = true` → auto-approved, balance goes negative

**Rollover / FIFO:**
- [ ] User has entitlement from two periods (e.g., Jan rollover + current month). Submit WFH → the older entitlement (earlier `expires_at`) is deducted first.

**Non-WFH leave types unaffected:**
- [ ] Submit any other leave type → status is `pending`, awaiting manual approval

**Permissions interaction:**
- [ ] HR submits WFH → auto-approved (no accept/decline required, so the HR permission change is irrelevant here)
- [ ] Admin submits WFH → auto-approved
- [ ] Admin tries to manually approve a WFH leave that is already `approved` → should be a no-op or blocked

**Notifications:**
- [ ] Requester receives "automatically approved" notification, not "pending" notification
- [ ] Admin receives "auto-approved" notification
- [ ] Head of requester's department receives informational notification (Phase 6)

**`auto_approve` toggle:**
- [ ] Admin disables `auto_approve` on WFH type → new WFH requests go to `pending` again
- [ ] Admin re-enables `auto_approve` → requests are auto-approved again

---

## Implementation Order

1. **Laravel: permissions migration + seed + endpoints** (Phase 1) — blocks Phase 3 and Phase 5
2. **Laravel: `auto_approve` column + `newLeave` changes** (Phase 8.1–8.3) — can be done in parallel with #1
3. **Nuxt: permission proxy routes** (Phase 2) — can start immediately, no Laravel dependency for the route scaffolding
4. **Nuxt: pass `auto_approve` through leave types route** (Phase 8.4) — trivial, do alongside #3
5. **Frontend: refactor `stores/permissions.ts`** (Phase 3)
6. **Frontend: update `stores/centralStore.ts` init order** (Phase 4)
7. **Frontend: types** (Phase 7 + Phase 8.7)
8. **Frontend: leave submission feedback** (Phase 8.6) — quick win, low risk
9. **Frontend: leave types `auto_approve` toggle** (Phase 8.5)
10. **Frontend: Admin UI editable permissions matrix** (Phase 5) — largest frontend task, do last
11. **Laravel: Head notification on leave request** (Phase 6) — coordinate with Laravel dev, can overlap
12. **Full verification pass** — Phase 8.8 checklist + all 19 `can()` component checks

---

## Risk & Edge Cases

| Risk | Mitigation |
|---|---|
| Permissions not loaded before component renders | `can()` returns `false` when `!initialized` — components hide until ready |
| Admin locks themselves out | Backend prevents stripping `permissions.modify` from admin role |
| Network failure on permissions fetch | Show a full-page error state; do not render the app without permissions |
| Stale permissions after admin changes matrix | `updateMatrix()` re-fetches `/me` immediately; other users get fresh permissions on next login or page refresh |
| HR or Head tries to accept/decline via direct API call | Phase 2.4 server middleware + Laravel backend enforcement blocks this |
| WFH auto-approval bypasses balance check | Auto-approve flag is checked after rules engine passes — the engine runs unconditionally |
| Leave type renamed away from "Work from home" | `auto_approve` is a DB column, not a name lookup — rename has no effect |
| Admin disables auto_approve mid-day | Only affects new requests; already-approved leaves are unaffected |
| Duplicate `auto_approve` leave type records | Not possible — `auto_approve` is a property of the leave type, not a filter |

---

## Files Changed Summary

| File | Change Type |
|---|---|
| `stores/permissions.ts` | Refactor — remove static object, add API fetch |
| `stores/centralStore.ts` | Update — add permissionsStore.init() as step 0, add reset() to logout |
| `server/api/permissions/index.get.ts` | New |
| `server/api/permissions/me.get.ts` | New |
| `server/api/permissions/index.put.ts` | New |
| `server/utils/requireRole.ts` | New |
| `server/api/leaves/processLeave.post.ts` | Update — add role check |
| `server/api/leaves/getLeavesTypes.ts` | Update — pass through `auto_approve` field |
| `components/Settings/Permissions.vue` | Refactor — make editable |
| `components/Home/NewLeave.vue` | Update — auto-approved success message |
| `components/Settings/` (leave types UI) | Update — add `auto_approve` toggle |
| `types/permissions.ts` | New |
| `types/models.ts` | Update — add `auto_approve` to LeaveType |
| `locales/en.json` + `locales/el.json` | Update — permission UI labels + auto-approve notification strings |
| Laravel (external) | Permission migration + seed + 3 endpoints; `auto_approve` column + seeder; `newLeave` logic; notification strings |
