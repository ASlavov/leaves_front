# Reverb Live Notifications — Fix Plan

**Date:** 2026-04-24  
**Symptom:** User submits a leave request; admin does NOT receive a notification without refreshing the page. `php artisan reverb:start` and `php artisan serve` are both running.

---

## Root Cause Analysis

### Issue 1 — CRITICAL: Echo plugin is not registered (notifications never start)

**File:** `nuxt.config.ts`

```ts
// Current state — echo.client.ts is MISSING
plugins: [
  '~/plugins/vue3-toastify.client.js',
],
```

The `plugins/echo.client.ts` file exists and is correct, but Nuxt never loads it because it is not listed in `nuxt.config.ts`. As a result:
- `window.Pusher` is never set
- The Laravel Echo instance is never created
- `useNuxtApp().$echo` is `undefined` everywhere
- `subscribeToChannel()` in the notifications store calls `if (!nuxtApp.$echo) return` and silently exits
- No WebSocket connection is ever opened to Reverb
- Notifications are effectively still polling-only (except polling was removed — so they never arrive at all)

**Fix:**

```ts
// nuxt.config.ts
plugins: [
  '~/plugins/echo.client.ts',        // ← ADD THIS
  '~/plugins/vue3-toastify.client.js',
],
```

---

### Issue 2 — MODERATE: `verifyAuth` middleware blocks the broadcasting auth endpoint

**File:** `server/middleware/verifyAuth.ts`

The middleware exempts `/api/auth/*` routes but not `/api/broadcasting/*`. When Echo tries to authenticate a private channel, it POSTs to `/api/broadcasting/auth`. The middleware intercepts this and throws 403 if the user is not yet fully authenticated (e.g., if the auth cookie is missing at the time of the handshake).

**Current exempt check:**
```ts
if (url.startsWith('/api/auth')) return;
```

Echo's channel auth POST arrives with the user's auth cookie present (they are logged in), so in practice this usually works. But if the cookie timing is off — e.g., the WS connection initialises before the cookie is fully set — the middleware will throw 403 and the channel subscription will silently fail.

**Fix (defensive hardening):**

```ts
// server/middleware/verifyAuth.ts
if (url.startsWith('/api/auth') || url.startsWith('/api/broadcasting')) return;
```

Wait — actually we DO want the token check to run for `/api/broadcasting/auth` because the route handler requires `event.context.token` to proxy the request. The middleware IS what puts the token onto the context. So we should NOT exempt it from the middleware. What we should verify is that the user IS logged in by the time `subscribeToChannel()` is called.

The correct fix is in the frontend: ensure Echo is initialized AFTER auth is confirmed (see Issue 3 below). Leave the middleware as-is.

---

### Issue 3 — MODERATE: Echo initialises before the user's JWT cookie is available

**File:** `plugins/echo.client.ts` / `stores/notifications.ts`

The Echo plugin runs at app startup. The `authEndpoint: '/api/broadcasting/auth'` is called by Echo when it first tries to subscribe to a private channel. At this point, the user may not yet have their `auth_token` cookie set (if the plugin runs before the auth check completes).

The notifications store's `init()` is called in `centralStore.init()`, which runs after the `/me` check in `app.vue`. So by the time `subscribeToChannel()` is called, the user IS authenticated. The Echo plugin itself (the `new Echo({...})` call) does not make the auth request immediately — it only authenticates when `.private(channelName)` is called. So the timing should be fine as long as `init()` runs after auth.

This is not an issue in the current flow — just worth noting for future reference.

---

### Issue 4 — CHECK: Reverb app key mismatch between Laravel and Nuxt

**Files:** Laravel `.env` vs Nuxt `.env`

The Reverb app key in Nuxt's `.env` (`NUXT_PUBLIC_REVERB_APP_KEY`) must exactly match the `REVERB_APP_KEY` in Laravel's `.env`. A mismatch causes Echo to connect successfully at the socket level but fail authentication, resulting in silent channel subscription failures.

**Verify:**
```bash
# In Laravel project
grep REVERB_APP_KEY .env

# In Nuxt project  
grep NUXT_PUBLIC_REVERB_APP_KEY .env
```

The values must be identical.

---

### Issue 5 — CHECK: Laravel notifications not using `ShouldBroadcast`

If the Laravel notification classes do not implement `ShouldBroadcast`, Reverb never receives an event to push. The notification gets saved to the database (visible on page refresh) but never pushed over the WebSocket.

**Verify each notification class has:**
```php
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class LeaveRequestedNotification extends Notification implements ShouldBroadcast
{
    public function via($notifiable): array
    {
        return ['database', 'broadcast'];  // 'broadcast' is required
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$notifiable->id}"),
        ];
    }
}
```

If `via()` only returns `['database']`, Reverb never fires.

---

### Issue 6 — CHECK: Queue not running (broadcast events are queued)

Laravel broadcasts are dispatched through the queue by default. If the queue worker is not running, broadcast events pile up and never reach Reverb.

**Verify the queue is running:**
```bash
php artisan queue:work
```

Or, to test without a queue, add to the notification class:
```php
use Illuminate\Contracts\Queue\ShouldQueue;

// Remove ShouldQueue to make broadcasts synchronous (dev only):
class LeaveRequestedNotification extends Notification implements ShouldBroadcast
// NOT: class LeaveRequestedNotification extends Notification implements ShouldBroadcast, ShouldQueue
```

For production, always run the queue. For debugging, removing `ShouldQueue` (or setting `QUEUE_CONNECTION=sync` in Laravel's `.env`) lets you confirm Reverb receives events without a separate queue process.

---

## Step-by-Step Fix Order

### Step 1 — Register the Echo plugin (5 seconds, fixes the core issue)

In `nuxt.config.ts`, add the plugin:

```ts
plugins: [
  '~/plugins/echo.client.ts',
  '~/plugins/vue3-toastify.client.js',
],
```

Restart the Nuxt dev server after this change.

### Step 2 — Confirm the WebSocket connection opens

Open the browser DevTools → Network tab → filter by WS.

You should see a WebSocket connection to `ws://localhost:8080/app/vwxjoppf1wevuw0ywutr` (or whatever your key is) shortly after login.

If the connection appears and stays open → Issue 1 was the only problem, you're done.  
If the connection fails or closes immediately → continue to Step 3.

### Step 3 — Verify the broadcasting auth handshake

In DevTools → Network, filter for `broadcasting/auth`. After login + page load, you should see a POST to `/api/broadcasting/auth` with status 200.

If it returns 200 → channel auth is working.  
If it returns 403 → token cookie timing issue; check that the user is fully authed before this fires.  
If it doesn't appear at all → Echo is still not initialised (check Step 1).

### Step 4 — Test an end-to-end notification

1. Log in as User A in one browser/tab
2. Log in as Admin in another browser/tab
3. User A submits a leave request
4. Immediately check the Admin tab — the bell badge count should increment without a refresh

If it works → done.  
If it doesn't → check Steps 5 and 6.

### Step 5 — Verify Reverb receives the event

In the terminal running `php artisan reverb:start`, you should see a log entry when a notification is broadcast. If you see nothing when a leave is submitted, Laravel is not broadcasting (check Issue 5 and 6 above — `ShouldBroadcast` and queue worker).

### Step 6 — Verify queue worker is running

```bash
# In the Laravel project directory:
php artisan queue:work
```

Or set `QUEUE_CONNECTION=sync` in Laravel's `.env` during debugging so broadcasts fire synchronously without a queue worker.

---

## Summary

| # | File | Change | Priority |
|---|------|--------|----------|
| 1 | `nuxt.config.ts` | Add `'~/plugins/echo.client.ts'` to plugins array | **CRITICAL — do this first** |
| 2 | Laravel notification classes | Ensure `ShouldBroadcast` + `toBroadcast()` + `'broadcast'` in `via()` | High |
| 3 | Laravel queue | Run `php artisan queue:work` or use `QUEUE_CONNECTION=sync` | High |
| 4 | Laravel + Nuxt `.env` | Verify `REVERB_APP_KEY` matches `NUXT_PUBLIC_REVERB_APP_KEY` | Medium |
| 5 | `server/middleware/verifyAuth.ts` | No change needed — middleware correctly requires auth | None |
