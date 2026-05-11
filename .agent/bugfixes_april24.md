# Bug Fixes — April 24 2026

Five issues reported after the permissions overhaul and Reverb integration. Each is diagnosed and fixed below.

---

## Issue 1 — 403 on processLeave for all users (cancel and approve)

### Diagnosis

`server/api/leaves/processLeave.ts` was given a `requireRole(event, ['admin'])` guard as part of the permissions overhaul. The intent was to prevent non-admins from approving or declining leaves. Two problems make this completely broken:

**Problem A — `requireRole` calls the wrong endpoint.**

`requireRole.ts` currently calls:
```ts
await $fetch(`${config.public.apiBase}/v1/permissions/me`, ...)
```

That endpoint is the one WE BUILT for the permissions overhaul. It returns:
```json
{ "permissions": { "profile_leave_balance": { "view": true, ... } } }
```

The function then checks `userProfile.roles` — a field that does not exist in that response. `userProfile.roles` is always `undefined`, so `requireRole` always throws 403 **for every user including admins**.

**Problem B — processLeave is also called for leave cancellation.**

Even if `requireRole` were fixed, the `['admin']` restriction would still block regular users from cancelling their own pending leaves via this endpoint. The frontend sends cancellations through `processLeave` (status: `'cancelled'`), not through the separate `cancelLeave` endpoint.

### Fix

#### Step 1 — Remove `requireRole` from `processLeave.ts`

The Laravel backend already enforces who can approve, decline, or cancel a leave. The Nuxt BFF has no added security value here — it just adds a second round-trip and breaks things. Remove the call entirely.

**File: `server/api/leaves/processLeave.ts`**

```ts
// REMOVE these two lines:
import { requireRole } from '~/server/utils/requireRole';
await requireRole(event, ['admin']);
```

Final file should look like:

```ts
import { defineEventHandler, readBody } from 'h3';
import { useRuntimeConfig } from '#imports';
import { proxyError } from '~/server/utils/proxyError';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { requestingUserId, token } = event.context;

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });
  }

  try {
    const { leaveId, status, reason } = body;

    const response = await $fetch(`${config.public.apiBase}${config.public.leaves.processLeave}`, {
      method: 'PUT',
      body: {
        leave_id: leaveId,
        user_editor: requestingUserId,
        status,
        reason,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    return response;
  } catch (error: any) {
    throw proxyError(error);
  }
});
```

#### Step 2 — Fix `requireRole.ts` to call the correct endpoint

The function needs the user's **roles**, not their permissions matrix. The correct endpoint is the Laravel user profile (`/me`), which returns the user object including a `roles` array.

Also fix the error handling: the current catch-all re-wraps every error as "Unable to verify user role", which hides the real cause. Let errors propagate with their original status code.

**File: `server/utils/requireRole.ts`**

```ts
import { H3Event } from 'h3';

export async function requireRole(event: H3Event, allowedRoles: string[]) {
  const { token } = event.context;
  if (!token) {
    throw createError({ statusCode: 403, message: 'Unauthenticated' });
  }

  const config = useRuntimeConfig();

  // Call the Laravel /me endpoint which returns the user profile including roles.
  // config.public.apiBase is e.g. "http://localhost:8000/api", so this resolves
  // to "http://localhost:8000/api/me".
  const userProfile = await $fetch<any>(`${config.public.apiBase}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userProfile?.roles?.length) {
    throw createError({ statusCode: 403, message: 'No roles found for user.' });
  }

  const userRoleNames: string[] = userProfile.roles.map((r: any) => r.name);
  const hasRole = userRoleNames.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    throw createError({
      statusCode: 403,
      message: `Forbidden. Required: one of [${allowedRoles.join(', ')}].`,
    });
  }
}
```

**Why the catch block was removed:** the original catch re-threw every error with the same "Unable to verify" message, which made every 403 (including a genuine Forbidden from Laravel) indistinguishable from a network failure. Let the caller see the real error.

#### Step 3 — Verify `requireRole` is only on routes that truly need it

After removing it from `processLeave.ts`, `requireRole` should only remain on:
- `server/api/permissions/index.put.ts` — the admin-only matrix edit endpoint

All other sensitive routes are already protected by the Laravel backend.

---

## Issue 2 & 3 — Reverb notifications not live / Laravel log shows nginx 404

### Diagnosis

Laragon runs nginx on **port 8080**. Reverb also defaults to **port 8080**. When Laravel tries to broadcast a notification, it connects to `localhost:8080` thinking that is Reverb — but it hits nginx instead and gets a 404 HTML response. This is the "Pusher error: `<html>404 Not Found</html>`" in `laravel.log`.

The front-end never receives notifications because Reverb never received the event from Laravel in the first place.

Separately: even if Reverb were on the correct port, the browser's Echo client would also try to connect to `ws://localhost:8080/...` and hit nginx. The WebSocket upgrade would fail silently, leaving Echo in a perpetual reconnect loop with no live notifications.

**Confirm the conflict:**
```bash
# In Laragon terminal or PowerShell:
netstat -ano | findstr :8080
# You will see nginx (or httpd) holding port 8080.
```

### Fix

**Change Reverb to port 8081** (or any port not used by Laragon — check with `netstat -ano` to be sure).

#### Laravel `.env`
```env
REVERB_PORT=8081
REVERB_SERVER_PORT=8081
```

#### Nuxt `.env`
```env
NUXT_PUBLIC_REVERB_PORT=8081
```

#### `nuxt.config.ts` — update the default fallback
```ts
reverbPort: parseInt(process.env.NUXT_PUBLIC_REVERB_PORT || '8081'),
//                                                             ^^^^^ was 8080
```

After changing these:
1. Stop the currently running `php artisan reverb:start`
2. Restart it: `php artisan reverb:start --port=8081`  
   (Reverb reads `REVERB_PORT` from `.env` automatically when you run it without `--port`, but explicitly passing it avoids stale env caching)
3. Restart the Nuxt dev server so the new `reverbPort` config is picked up

**Verify Reverb is running on the new port:**
```bash
netstat -ano | findstr :8081
# Should show a LISTENING process (Reverb / PHP)
```

**Verify Reverb receives events:**  
After restarting, submit a leave request. You should see something like this in the terminal running `reverb:start`:
```
[2026-04-24 10:xx:xx] Received message on channel private-App.Models.User.1
```
If you see nothing → Laravel is not broadcasting (see the queue check below).

### Additional check — Queue worker

Laravel Reverb events are dispatched through the queue by default. If no queue worker is running, the broadcast job is queued but never executed, so Reverb receives nothing.

Run in a fourth terminal (in the Laravel project directory):
```bash
php artisan queue:work
```

Or for development simplicity, set `QUEUE_CONNECTION=sync` in Laravel's `.env` so broadcasts fire immediately without a queue worker. Revert to `redis` or `database` for production.

### Additional check — `ShouldBroadcast` on notification classes

The Laravel notification classes must implement `ShouldBroadcast` AND include `'broadcast'` in the `via()` array. Verify each notification class (e.g., `LeaveRequestedNotification`) has:

```php
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class LeaveRequestedNotification extends Notification implements ShouldBroadcast
{
    public function via($notifiable): array
    {
        return ['database', 'broadcast'];  // both are required
    }

    public function toBroadcast($notifiable): BroadcastMessage { ... }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("App.Models.User.{$notifiable->id}")];
    }
}
```

If `via()` only returns `['database']`, Reverb will never receive the event — it will appear in the DB (visible on refresh) but never be pushed live.

### What "no output in reverb:start terminal" means

Reverb only prints output when it **receives** a channel subscription or an event. If Reverb starts successfully but shows nothing when a leave is submitted, one of these is true:
1. The queue worker is not running (event is queued but not executed)
2. The notification class is missing `ShouldBroadcast` or `'broadcast'` in `via()`
3. Laravel's `BROADCAST_CONNECTION` is not set to `reverb` in `.env`

Verify in Laravel's `.env`:
```env
BROADCAST_CONNECTION=reverb
```

---

## Issue 4 — PHP Parse error in laravel.log

### Diagnosis

This is a red herring. The stack trace points to:
```
Psy\Shell  (Tinker's REPL)
Laravel\Tinker\Console\TinkerCommand
```

This is the Laravel Tinker interactive shell. Someone typed an invalid PHP expression (`= App\Models\U...` — missing the variable name before `=`) in a Tinker session. The REPL logged the parse error to `laravel.log`. 

**This is not an application bug.** No fix needed. The log entry can be ignored.

---

## Issue 5 — App performance degradation

### Diagnosis

Two changes from the overhaul are causing the slowdown:

**Cause A — `requireRole` on `processLeave` (now fixed by Issue 1)**

Every call to `processLeave` (approve, decline, cancel) was triggering `requireRole`, which makes an **extra HTTP round-trip to the Laravel backend** before the actual request. Since `requireRole` was calling the wrong endpoint (`/v1/permissions/me`), it was:

1. Making a request that returns the wrong data shape
2. `userProfile.roles` evaluates to `undefined`
3. Throwing a 403 in the catch block

This means every single leave action was making **two backend calls**, the first always failing and adding latency. Removing `requireRole` from `processLeave.ts` (Issue 1 fix) eliminates this entirely.

**Cause B — Permissions store `init()` on every app load**

The new `permissionsStore.init()` added as "Step 0" in `centralStore.init()` makes one extra HTTP call (`/api/permissions/me`) before any other store initialises. This is acceptable — it's a single call at login. It should not cause ongoing slowness.

If the app feels slow after Issue 1 is fixed, look at whether the Laravel `/v1/permissions/me` endpoint is slow. That endpoint was added as part of the overhaul and may need a database query optimisation (e.g., indexing the `role_permissions` table on `role_key`).

**Cause C — Echo reconnect loop (Reverb on wrong port)**

With Reverb unreachable (nginx on port 8080), the Echo client enters a reconnect loop. The browser opens a new WebSocket, gets refused, waits, tries again — every few seconds. This does not slow down the app itself, but it generates a lot of browser console noise and may saturate the network tab in DevTools, making the app *appear* slower.

Fixing the Reverb port (Issue 2) stops this loop entirely.

### Verification after fixes

After applying Issues 1 and 2 fixes:
1. Open DevTools → Network
2. Submit a leave request
3. You should see exactly **two** requests: the POST to `/api/leaves/processLeave` and the response. No extra `/v1/permissions/me` call.
4. The WebSocket connection in the WS filter should show a stable `OPEN` connection to `ws://localhost:8081/...` with no repeated reconnects.

---

## Fix Execution Order

| # | File(s) | Change | Restarts needed |
|---|---------|--------|-----------------|
| 1 | `server/api/leaves/processLeave.ts` | Remove `requireRole` import and call | Nuxt hot-reloads |
| 2 | `server/utils/requireRole.ts` | Fix endpoint from `/v1/permissions/me` → `/me` | Nuxt hot-reloads |
| 3 | Laravel `.env` | `REVERB_PORT=8081`, `BROADCAST_CONNECTION=reverb` | Restart `reverb:start` |
| 4 | Nuxt `.env` | `NUXT_PUBLIC_REVERB_PORT=8081` | Restart Nuxt dev server |
| 5 | `nuxt.config.ts` | Change default port fallback from `8080` → `8081` | Restart Nuxt dev server |
| 6 | New Laravel terminal | `php artisan queue:work` | Keep running |
| 7 | Laravel notification classes | Verify `ShouldBroadcast` + `'broadcast'` in `via()` | Restart `reverb:start` |

Issues 1 and 2 are Nuxt-side and can be done immediately. Issues 3–7 require access to the Laravel project.
