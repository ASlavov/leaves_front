# Error Reporting Overhaul Plan

**Date:** 2026-03-27
**Status:** Planning

---

## 1. The Problem

The current error flow has a fundamental flaw: **Laravel's error messages are discarded before they reach the user.**

Trace of what happens today when the dependency check fails:

```
Laravel → { "error": "You must exhaust your Paid Leave..." } [422]
    ↓ $fetch throws FetchError (error.data contains the body)
Nuxt server route (newLeave.ts) catch block:
    throw createError({ statusCode: 500, statusMessage: 'Error posting leaves' })
    ↑ Original body DISCARDED. Status changed from 422 → 500.
    ↓
retryFetch on client → sees 500 → retries 3 times → throws generic FetchError
    ↓
Store catch block → $toast.error(t('errors.leaves.createFailed'))
    ↓
User sees: "Could not create new leave"
Expected: "You must exhaust your Paid Leave balance before using Company Bonus Days."
```

### Secondary problem: stores eat errors

Most stores use `setError(t(...))` in catch blocks but **don't re-throw**, so components can't react. The component's `try { await store.action() }` never enters its own `catch` block even when the action failed.

---

## 2. Error Taxonomy

We distinguish three categories:

| Type | When | User-facing message | HTTP codes |
|------|------|---------------------|------------|
| **`user`** | Business rule violation, validation failure — the backend said "no" for a logical reason | Backend's specific message | 400, 409, 422 |
| **`app`** | Infrastructure failure — something broke unexpectedly | Generic i18n fallback | 500, network errors |
| **`auth`** | Session expired or missing | Redirect to login (already handled by retryFetch) | 401, 403 |

### Backend error shapes (Laravel)

Laravel uses three patterns:
1. **Single business error:** `{ "error": "You must exhaust..." }` — used for logic/domain rules
2. **Field validation errors:** `{ "errors": { "field": ["message 1", ...] } }` — used by `Validator::make()`
3. **Success + body:** `{ "message": "...", "data": {...} }` — 200/201

---

## 3. Solution Architecture

Four layers, each with a clear responsibility:

```
Laravel backend
    ↓ (422/4xx with error body)
[Layer 1] Nuxt server routes  → normalize errors into standard envelope
    ↓ ({ type: 'user'|'app', message: string })
[Layer 2] retryFetch utility  → re-throw tagged errors (no change needed)
    ↓
[Layer 3] Pinia stores        → re-throw ALL errors (no swallowing)
    ↓
[Layer 4] Components          → extractApiError() → show right message
```

---

## 4. Layer 1: Nuxt Server Routes

### 4a. New shared utility: `server/utils/proxyError.ts`

```ts
import { createError } from 'h3';

/**
 * Normalize a $fetch error from a Laravel backend call into a typed H3 error.
 * - 4xx (excluding 401/403): user-facing errors — forward the message, preserve status code
 * - 401/403:                  auth errors — rethrow as-is so retryFetch handles logout
 * - 5xx / network:            app errors — generic 500, message hidden from client
 */
export function proxyError(error: any): never {
    const status: number = error.response?.status ?? error.statusCode ?? 500;
    const laravelBody: any = error.data ?? {};

    // Auth errors — let retryFetch handle logout
    if (status === 401 || status === 403) {
        throw createError({ statusCode: status, statusMessage: 'Unauthorized' });
    }

    // Client / business errors (400, 409, 422)
    if (status >= 400 && status < 500) {
        // Normalize Laravel's two error shapes into a single message string
        let message: string | null = null;
        if (laravelBody.error) {
            // { "error": "..." }
            message = laravelBody.error;
        } else if (laravelBody.errors && typeof laravelBody.errors === 'object') {
            // { "errors": { "field": ["msg1", ...] } } — take the first message
            const first = Object.values(laravelBody.errors)[0];
            message = Array.isArray(first) ? first[0] : String(first);
        }
        throw createError({
            statusCode: status,
            statusMessage: 'User Error',
            data: { type: 'user', message },
        });
    }

    // Server / infrastructure errors
    throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        data: { type: 'app', message: null },
    });
}
```

### 4b. Update ALL server routes

Replace every route's current catch block:

**Before (in every route):**
```ts
} catch (error: any) {
    console.error('Error posting leave:', error);
    throw createError({ statusCode: 500, statusMessage: 'Error posting leaves' });
}
```

**After:**
```ts
} catch (error: any) {
    throw proxyError(error);
}
```

Routes to update:
- `server/api/leaves/newLeave.ts` ← highest priority (dependency check fires here)
- `server/api/leaves/processLeave.ts`
- `server/api/leaves/cancelLeave.ts`
- `server/api/leaves/newLeaveType.ts`
- `server/api/leaves/updateLeaveType.ts`
- `server/api/leaves/deleteLeaveType.ts`
- `server/api/leaves/restoreLeaveType.ts`
- `server/api/entitlement/add.ts`
- `server/api/entitlement/massLeaves.ts`
- `server/api/entitlement/massDelete.ts`
- `server/api/entitlement/delete.ts`
- `server/api/entitlement/update.ts`
- `server/api/user/editUser.ts`
- `server/api/user/addUser.ts`
- `server/api/user/changePassword.ts`
- All department routes

Also remove leftover `console.log(response)` / `console.log(body)` calls scattered across routes.

---

## 5. Layer 2: retryFetch (minimal change)

`utils/retryFetch.ts` already re-throws the raw `FetchError` for 4xx. On the client side, `$fetch` throws a `FetchError` where:
- `error.data` = the H3 error response body = `{ statusCode, statusMessage, data: { type, message } }`

So `error.data?.data` = our typed envelope `{ type: 'user'|'app', message: string }`.

**No structural change needed** to `retryFetch`. The only addition is a small helper (Layer 2b) that reads the typed envelope.

### 5b. New client utility: `utils/extractApiError.ts`

```ts
export interface ApiError {
    type: 'user' | 'app' | 'auth';
    message: string | null;
}

/**
 * Extract a typed error from a FetchError thrown by retryFetch.
 * Use this in component catch blocks to decide what toast to show.
 */
export function extractApiError(error: any): ApiError {
    const status: number = error.response?.status ?? error.statusCode ?? 0;

    if (status === 401 || status === 403) {
        return { type: 'auth', message: null };
    }

    // H3 wraps our data under error.data.data
    const envelope = error.data?.data ?? error.data ?? {};

    return {
        type: envelope.type === 'user' ? 'user' : 'app',
        message: envelope.message ?? null,
    };
}
```

---

## 6. Layer 3: Pinia Stores

### Current problem

Most store actions:
1. Call `setError(t('errors.x.y'))` — sets store error state (not shown anywhere)
2. Do NOT re-throw — so the component's own `catch` block is never reached
3. Some actions also directly call `$toast.error()` (mixed responsibility)

### Fix

**Rule:** Stores re-throw ALL errors. Stores do NOT show toasts. Stores do NOT display user-facing messages — they're data layer, not UI layer.

**Pattern to apply across all stores:**

```ts
// Before
} catch (err) {
    setError(t('errors.leaves.createFailed'));
    // nothing re-thrown
}

// After
} catch (err) {
    setError(t('errors.leaves.createFailed')); // optional: keep for store error state
    throw err; // always re-throw
}
```

Stores to fix: `stores/leaves.ts`, `stores/entitlement.ts`, `stores/user.ts`, `stores/departments.ts`

Some of these already throw (e.g. `addEntitledDays`, `deleteLeaveType`) — those are fine. The ones that silently swallow need fixing.

---

## 7. Layer 4: Components

### Current pattern

```ts
} catch {
    $toast.error(t('errors.leaves.createFailed')); // always generic
}
```

### New pattern

```ts
import { extractApiError } from '@/utils/extractApiError';

} catch (error) {
    const { type, message } = extractApiError(error);
    if (type === 'user' && message) {
        $toast.error(message);                         // backend's human message
    } else {
        $toast.error(t('errors.leaves.createFailed')); // generic app error fallback
    }
}
```

### Consistency rule

| Scenario | Toast |
|----------|-------|
| Backend sends `{ error: "..." }` 422 | Show backend message verbatim |
| Backend sends `{ errors: { field: [...] } }` 422 | Show first field message (normalized by proxyError) |
| HTTP 5xx or network failure | Show generic i18n error string |
| HTTP 401/403 | retryFetch already handles logout, no toast needed |

### Components to update

- `components/Settings/EditEntitlement.vue`
- `components/Settings/MassDeleteEntitlement.vue`
- `components/Settings/EditLeaveType.vue`
- `components/Settings/LeavesTypesList.vue`
- `components/Settings/EditGroup.vue`
- `components/Settings/EditUser.vue`
- `components/Leaves/NewLeave.vue` (or wherever leave requests are submitted) ← highest priority
- `components/Settings/Security.vue` (password change)
- Any other component that has try/catch with a toast

---

## 8. i18n Considerations

The backend currently returns **English** error messages (e.g. `"You must exhaust your Paid Leave balance before using Company Bonus Days."`). This is a known limitation.

**Short term:** Display backend English messages as-is for user errors. The app i18n fallbacks remain for app errors.

**Long term (out of scope for this PR):** Backend should return error codes (`"error_code": "prerequisite_not_exhausted"`) that the frontend translates. This is a separate backend + frontend refactor.

---

## 9. Implementation Order

1. **`server/utils/proxyError.ts`** — create the shared utility
2. **`utils/extractApiError.ts`** — create the client helper
3. **`server/api/leaves/newLeave.ts`** — update first (highest urgency)
4. **All remaining server routes** — bulk update, same pattern
5. **`stores/leaves.ts`** — ensure all actions re-throw
6. **`stores/entitlement.ts`** — same
7. **`stores/user.ts`** — same
8. **`stores/departments.ts`** — same
9. **`components/Leaves/NewLeave*.vue`** — highest user-facing priority
10. **All remaining components** — bulk update using new pattern

---

## 10. What This Does NOT Cover

- Translating backend error messages (would require backend changes to return error codes)
- Form-level inline validation errors below specific fields (currently handled by showing a toast — acceptable for now)
- A global error boundary / error page (separate concern)
- Logging errors to an external service (Sentry, etc.) — can be added to `proxyError` later
