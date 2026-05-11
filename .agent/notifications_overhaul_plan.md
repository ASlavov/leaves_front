# Notifications System Overhaul Plan

**Date:** 2026-04-22  
**Branch:** aris_improvements  
**Goal:** Replace the 10-second polling loop with a live WebSocket connection (Laravel Reverb), add an unread-count badge to the bell, fix the broken message format (no more IDs as text), and wire notification clicks to their relevant pages.

---

## Current State Summary (What's Broken)

| Problem | Root Cause |
|---|---|
| Messages say "user 3 requested leave_type 5" | Laravel sends raw IDs in the notification string instead of resolved names |
| No unread badge on bell | Badge simply not implemented in `UserNotification.vue` |
| Clicking a notification does nothing except toggle read | No routing logic in the click handler |
| 10-second polling hammers the server | `beginPolling()` in `stores/notifications.ts` with a hardcoded 10 000 ms interval |
| No `title` field in the `Notification` type but the UI tries to render it | Type definition in `types/common.ts` is incomplete |
| `is_read` type mismatch | Type says `boolean`, but the UI checks `=== 0` / `=== 1` (DB sends integers) |

---

## Technology Choice: Laravel Reverb

Reverb is Laravel's first-party WebSocket server (released early 2024). It is:
- Free and self-hosted
- Pusher-protocol compatible (so `laravel-echo` + `pusher-js` work unchanged on the frontend)
- Zero external dependency (no Pusher account, no Soketi Docker container)
- Runs as `php artisan reverb:start`

The client library is the standard `laravel-echo` + `pusher-js` combo. Echo handles automatic reconnection, so no fallback polling is needed.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Browser (Nuxt/Vue client)                           │
│                                                      │
│  laravel-echo ──WS──────────────────────────────┐   │
│    .private('App.Models.User.{id}')             │   │
│    .notification(handler)                       │   │
│                                                 │   │
│  $fetch('/api/notifications/*') ──HTTP──────┐  │   │
└─────────────────────────────────────────────│──│───┘
                                              │  │
                    ┌─────────────────────────│──│──────┐
                    │  Nuxt BFF                │  │      │
                    │  /api/notifications/*  ◄─┘  │      │
                    │  /api/broadcasting/auth      │      │
                    └──────────────────────────│──┘      
                                               │
          ┌────────────────────────────────────│──────────┐
          │  Laravel Backend                   │          │
          │                                    │          │
          │  REST API  ◄───────────────────────┘          │
          │  Reverb WebSocket Server ◄────────────────────┘
          │    (port 8080 default)                         │
          └────────────────────────────────────────────────┘
```

**Key point:** The WebSocket connection goes *directly* from the browser to Laravel Reverb. The Nuxt BFF is only involved for the one-time channel auth handshake (`/api/broadcasting/auth`) and for the initial REST notification load on app start.

---

## Phase 1 — Laravel Backend Changes

> All changes in `c:\laragon\www\intelligence-back`

### 1.1 Install and Configure Reverb

```bash
composer require laravel/reverb
php artisan reverb:install
```

This publishes `config/reverb.php` and adds the necessary `.env` entries. Confirm these are set in `.env`:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

In `config/broadcasting.php`, verify the `reverb` driver is registered (the installer does this automatically).

In `bootstrap/app.php` (Laravel 11) or `config/app.php` (Laravel 10), ensure `BroadcastServiceProvider` is uncommented / registered.

To start the server: `php artisan reverb:start`  
For production: run as a supervised process (Supervisor or similar).

---

### 1.2 Database: Add `meta` Column to `notifications` Table

The existing `notifications` table has a `data` JSON column where notification payload is stored. **Do not add a new column.** The `meta` object defined below will be nested inside `data`. Laravel's notification system serialises the return value of `toDatabase()` / `toArray()` into the `data` column automatically.

The only schema change needed is if `data` is not already a JSON column — check the existing migration and confirm. No new migration is required unless the column type is wrong.

---

### 1.3 Notification Classes

Create one class per notification event. All classes live in `app/Notifications/`. All implement `ShouldBroadcast` so they are sent through both the `database` channel (persisted, fetchable via REST) and the `broadcast` channel (WebSocket push).

**Base pattern for every notification class:**

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        private readonly \App\Models\User $requestingUser,
        private readonly \App\Models\Leave $leave,
        private readonly string $leaveTypeName,
        private readonly string $departmentName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * broadcastType() overrides the outer "type" field in the WS payload
     * so the frontend receives 'leave_requested' instead of the full class name.
     */
    public function broadcastType(): string
    {
        return 'leave_requested';
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->payload();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    private function payload(): array
    {
        return [
            'type'    => 'leave_requested',
            'title'   => 'New Leave Request',
            'message' => "{$this->requestingUser->full_name} requested {$this->leave->days_count} day(s) of {$this->leaveTypeName}",
            'meta'    => [
                'leave_id'              => $this->leave->id,
                'requesting_user_id'    => $this->requestingUser->id,
                'requesting_user_name'  => $this->requestingUser->full_name,
                'department_name'       => $this->departmentName,
                'leave_type_name'       => $this->leaveTypeName,
                'date_from'             => $this->leave->date_from,
                'date_to'               => $this->leave->date_to,
                'days_count'            => $this->leave->days_count,
            ],
        ];
    }
}
```

**Create the following notification classes** (same structure, different payload):

#### `LeaveApprovedNotification`
- `broadcastType()` → `'leave_approved'`
- Title: `'Leave Request Approved'`
- Message: `"Your {leaveTypeName} request ({dateFrom} – {dateTo}) has been approved."`
- Constructor: `User $approvingUser, Leave $leave, string $leaveTypeName`
- Meta: `leave_id`, `leave_type_name`, `date_from`, `date_to`, `days_count`
- Sent to: the *requesting* user (`$leave->user->notify(...)`)

#### `LeaveDeclinedNotification`
- `broadcastType()` → `'leave_declined'`
- Title: `'Leave Request Declined'`
- Message: `"Your {leaveTypeName} request ({dateFrom} – {dateTo}) has been declined."`
- Same constructor / meta pattern as `LeaveApprovedNotification`
- Sent to: the *requesting* user

#### `LeaveAutoApprovedNotification`
- `broadcastType()` → `'leave_auto_approved'`
- Title: `'Leave Auto-Approved'`
- Message: `"Your {leaveTypeName} request ({dateFrom} – {dateTo}) was automatically approved."`
- Sent to: the *requesting* user AND to admin users (separate notify calls)
- Admin version title: `'Auto-Approved Leave'` / message: `"{userName}'s {leaveTypeName} request was automatically approved."`

#### `LeaveCancelledNotification`
- `broadcastType()` → `'leave_cancelled'`
- Title: `'Leave Request Cancelled'`
- Message: `"{userName} cancelled their {leaveTypeName} request ({dateFrom} – {dateTo})."`
- Sent to: admin users (the requester doesn't need to be notified about their own cancellation)

#### `LeaveRequestedHeadInfoNotification`
- `broadcastType()` → `'leave_requested_head_info'`
- Title: `'Leave Request in Your Department'`
- Message: `"{userName} from {departmentName} submitted a {leaveTypeName} request ({dateFrom} – {dateTo})."`
- Sent to: the Head(s) of the requesting user's department

---

### 1.4 Update `LeavesController` to Use Notification Classes

Replace every raw `$user->notify(new \App\Notifications\DatabaseNotification(...))` (or equivalent string-message notification) with the structured classes above.

**Pattern for `newLeave`:**

```php
// After leave is created successfully (inside or just after the transaction):

// Notify the requesting user
$leave->user->notify(new LeaveRequestedNotification(
    requestingUser: $leave->user,
    leave: $leave,
    leaveTypeName: $leaveType->name,
    departmentName: $leave->user->department->name ?? '',
));

// Notify all admin users
User::role('admin')->each(fn($admin) =>
    $admin->notify(new LeaveRequestedNotification(...))
);

// Notify the Head(s) of the requesting user's department (Phase 6 from permissions plan)
User::whereHas('roles', fn($q) => $q->where('name', 'head'))
    ->whereHas('department', fn($q) => $q->where('id', $leave->user->department_id))
    ->each(fn($head) =>
        $head->notify(new LeaveRequestedHeadInfoNotification(...))
    );
```

**For `processLeave` (approve/decline):**

```php
if ($status === 'approved') {
    $leave->user->notify(new LeaveApprovedNotification(...));
} else {
    $leave->user->notify(new LeaveDeclinedNotification(...));
}
```

**For auto-approve (from permissions overhaul Phase 8):**

```php
// Inside newLeave, in the auto-approve path:
$leave->user->notify(new LeaveAutoApprovedNotification(
    leave: $leave,
    leaveTypeName: $leaveType->name,
    isAdminVersion: false,
));

User::role('admin')->each(fn($admin) =>
    $admin->notify(new LeaveAutoApprovedNotification(..., isAdminVersion: true))
);
```

---

### 1.5 Add `markAllRead` Endpoint

Laravel already ships with notification management methods on the `User` model. Add a new API route:

```php
// routes/api.php
Route::put('/notifications-mark-all-read', [NotificationController::class, 'markAllRead']);
```

```php
// In NotificationController (or equivalent):
public function markAllRead(Request $request): JsonResponse
{
    $request->user()->unreadNotifications->markAsRead();
    return response()->json($this->formatNotifications($request->user()->notifications));
}
```

---

### 1.6 Ensure Broadcasting Auth Route is Active

Laravel ships with `/broadcasting/auth` out of the box. Verify it is active (not commented out) in `routes/channels.php`:

```php
// routes/channels.php
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

This is the auth gate for private channels. A user can only subscribe to their own channel.

---

### 1.7 Notification Response Normalisation

When the REST `GET /user-notifications/{userId}` endpoint returns existing notifications, the `data` column contains the JSON payload. Ensure the response maps it correctly so the frontend receives a flat object, not a nested `{ data: {...} }` shape:

```php
// The notifications should be returned as:
$notifications->map(function ($notification) {
    return [
        'id'         => $notification->id,
        'user_id'    => $notification->notifiable_id,
        'type'       => $notification->data['type'] ?? 'unknown',
        'title'      => $notification->data['title'] ?? '',
        'message'    => $notification->data['message'] ?? '',
        'meta'       => $notification->data['meta'] ?? [],
        'is_read'    => !is_null($notification->read_at),
        'created_at' => $notification->created_at->toISOString(),
    ];
});
```

This normalises `is_read` to a proper `boolean` (derived from whether `read_at` is null) and flattens the `data` column's contents to the top level.

---

## Phase 2 — Nuxt BFF Changes

### 2.1 New: `server/api/broadcasting/auth.post.ts`

This proxies the Laravel Echo channel-auth handshake through the BFF so the Bearer token is included.

```ts
// server/api/broadcasting/auth.post.ts
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Laravel expects socket_id and channel_name in the body
  const data = await $fetch<unknown>(`${config.apiBase}/broadcasting/auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
  });

  return data;
});
```

**Important:** The `verifyAuth` middleware already runs on `/api/**`, so the token will be on `event.context.token` automatically.

---

### 2.2 New: `server/api/notifications/markAllRead.post.ts`

```ts
// server/api/notifications/markAllRead.post.ts
export default defineEventHandler(async (event) => {
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403 });

  const config = useRuntimeConfig();

  const data = await $fetch<unknown>(`${config.apiBase}/notifications-mark-all-read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
});
```

---

### 2.3 Update `nuxt.config.ts` — Add Reverb Public Config

Add to `runtimeConfig.public`:

```ts
// nuxt.config.ts
runtimeConfig: {
  // ... existing private keys
  public: {
    // ... existing public keys
    reverbAppKey: process.env.NUXT_PUBLIC_REVERB_APP_KEY || '',
    reverbHost: process.env.NUXT_PUBLIC_REVERB_HOST || 'localhost',
    reverbPort: parseInt(process.env.NUXT_PUBLIC_REVERB_PORT || '8080'),
    reverbScheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http',
  },
},
```

Add to `.env` (and `.env.example`):

```env
NUXT_PUBLIC_REVERB_APP_KEY=your-reverb-app-key   # must match REVERB_APP_KEY in Laravel
NUXT_PUBLIC_REVERB_HOST=localhost                 # production: your domain
NUXT_PUBLIC_REVERB_PORT=8080
NUXT_PUBLIC_REVERB_SCHEME=http                   # production: https
```

---

### 2.4 Update Existing Notification REST Routes

The `getNotifications` route currently returns whatever Laravel returns verbatim. After Phase 1.7 (Laravel normalisation), it should pass through cleanly. However, add a **response normalisation guard** in case old notification records exist with the legacy `data`-nested format:

```ts
// server/api/notifications/getNotifications.post.ts  (existing file, modify)
// After fetching from Laravel, normalise each notification:

function normaliseNotification(raw: Record<string, any>) {
  // Handle both new flat format and old nested { data: {...} } format
  const payload = raw.data && typeof raw.data === 'object' ? raw.data : raw;
  return {
    id: raw.id,
    user_id: raw.user_id ?? raw.notifiable_id,
    type: payload.type ?? 'unknown',
    title: payload.title ?? '',
    message: payload.message ?? payload.type ?? '',
    meta: payload.meta ?? {},
    is_read: typeof raw.is_read === 'boolean' ? raw.is_read : raw.is_read === 1,
    created_at: raw.created_at ?? '',
  };
}

// Apply after fetch:
return Array.isArray(result) ? result.map(normaliseNotification) : [];
```

Apply the same normalisation to `markedRead.post.ts` and `markedUnread.post.ts` since they also return the notification list.

---

## Phase 3 — Frontend: Packages & Echo Plugin

### 3.1 Install Packages

```bash
npm install laravel-echo pusher-js
```

`pusher-js` is required by Laravel Echo even when connecting to Reverb, because Reverb speaks the Pusher protocol.

---

### 3.2 Create `plugins/echo.client.ts`

The `.client.ts` suffix tells Nuxt to only run this plugin in the browser (no SSR). WebSockets cannot be opened during server-side rendering.

```ts
// plugins/echo.client.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Pusher needs to be on window for Laravel Echo internals
  window.Pusher = Pusher;

  const echo = new Echo({
    broadcaster: 'reverb',
    key: config.public.reverbAppKey,
    wsHost: config.public.reverbHost,
    wsPort: config.public.reverbPort,
    wssPort: config.public.reverbPort,
    forceTLS: config.public.reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    // Auth endpoint: routed through the Nuxt BFF (Phase 2.1)
    authEndpoint: '/api/broadcasting/auth',
    // Cookies are sent automatically with same-origin requests,
    // but we need the CSRF token if Laravel requires it.
    // The BFF handles token injection — no headers needed here.
  });

  return {
    provide: {
      echo,
    },
  };
});
```

**TypeScript declaration** — add to a `.d.ts` file or `types/echo.d.ts` so `useNuxtApp().$echo` is typed:

```ts
// types/echo.d.ts
import type Echo from 'laravel-echo';

declare module '#app' {
  interface NuxtApp {
    $echo: Echo;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $echo: Echo;
  }
}
```

---

## Phase 4 — Frontend: Types

Replace the existing `Notification` interface in `types/common.ts` (or wherever it lives):

```ts
// types/notifications.ts  (new file — keep separate from models.ts)

export type NotificationType =
  | 'leave_requested'
  | 'leave_approved'
  | 'leave_declined'
  | 'leave_cancelled'
  | 'leave_auto_approved'
  | 'leave_requested_head_info'
  | 'unknown';

export interface NotificationMeta {
  leave_id?: number;
  requesting_user_id?: number;
  requesting_user_name?: string;
  department_name?: string;
  leave_type_name?: string;
  date_from?: string;
  date_to?: string;
  days_count?: number;
}

export interface Notification {
  id: string;                   // Laravel notification IDs are UUIDs
  user_id: number | string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;             // always boolean — normalised in Phase 2.4
  created_at: string;
  meta: NotificationMeta;
}
```

Export `Notification`, `NotificationType`, and `NotificationMeta` from `types/index.ts` (or wherever the barrel file is).

---

## Phase 5 — Frontend: Notifications Store Refactor

**Full replacement of `stores/notifications.ts`:**

```ts
// stores/notifications.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '~/stores/user';
import {
  getNotificationsComposable,
  markNotificationReadComposable,
  markNotificationUnreadComposable,
  markAllNotificationsReadComposable,  // new — see Phase 5 note
} from '@/composables/notificationsApiComposable';
import type { Notification } from '~/types';

export const useNotificationsStore = defineStore('notificationsStore', () => {
  const userStore = useUserStore();
  const { t } = useI18n();

  const notificationsData = ref<Notification[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const connected = ref(false);   // WebSocket connection state

  // ─── Computed ────────────────────────────────────────────────────────────────

  const unreadCount = computed(() =>
    notificationsData.value.filter((n) => !n.is_read).length,
  );

  const unreadNotifications = computed(() =>
    notificationsData.value
      .filter((n) => !n.is_read)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  );

  const readNotifications = computed(() =>
    notificationsData.value
      .filter((n) => n.is_read)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function init() {
    try {
      await getNotifications();
      subscribeToChannel();
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  function subscribeToChannel() {
    // useNuxtApp() is available in stores when called from a component context.
    // If called during SSR, $echo won't exist — the .client.ts plugin guards this.
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$echo) return;

    const userId = userStore.userId;

    nuxtApp.$echo
      .private(`App.Models.User.${userId}`)
      .notification((notification: Notification) => {
        // Prepend the new notification so it appears at the top of the list
        notificationsData.value.unshift(notification);
      });

    // Track WebSocket connection state for the optional UI indicator
    const pusherConn = (nuxtApp.$echo as any).connector?.pusher?.connection;
    if (pusherConn) {
      pusherConn.bind('connected', () => {
        connected.value = true;
        // Re-fetch on reconnect to catch any events missed during disconnect
        getNotifications();
      });
      pusherConn.bind('disconnected', () => {
        connected.value = false;
      });
      pusherConn.bind('connecting', () => {
        connected.value = false;
      });
    }
  }

  function unsubscribeFromChannel() {
    const nuxtApp = useNuxtApp();
    if (!nuxtApp.$echo) return;
    nuxtApp.$echo.leave(`App.Models.User.${userStore.userId}`);
  }

  async function getNotifications() {
    loading.value = true;
    try {
      const result = await getNotificationsComposable(userStore.userId as string | number);
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    } finally {
      loading.value = false;
    }
  }

  async function changeNotificationStatus(notificationId: string | number) {
    const notification = notificationsData.value.find((n) => n.id === notificationId);
    if (!notification) return;

    try {
      let result: Notification[];
      if (notification.is_read) {
        result = await markNotificationUnreadComposable(notificationId);
      } else {
        result = await markNotificationReadComposable(notificationId);
      }
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  async function markAllRead() {
    try {
      const result = await markAllNotificationsReadComposable();
      if (result) {
        notificationsData.value = result;
      }
    } catch (err) {
      error.value = err ? String(err) : t('errors.common.unknownError');
    }
  }

  function reset() {
    unsubscribeFromChannel();
    notificationsData.value = [];
    connected.value = false;
    error.value = null;
  }

  return {
    notificationsData,
    loading,
    error,
    connected,
    unreadCount,
    unreadNotifications,
    readNotifications,
    init,
    getNotifications,
    changeNotificationStatus,
    markAllRead,
    reset,
    // Remove: beginPolling, stopPollingNotifications, notificationsActive
  };
});
```

**Note:** Remove `beginPolling`, `stopPollingNotifications`, and `notificationsActive` entirely. Also remove the call to `notificationsStore.stopPollingNotifications()` from `centralStore.ts`'s `logout()` function — `reset()` now handles cleanup.

---

### 5.1 Update `composables/notificationsApiComposable.ts`

Add the new `markAllRead` composable:

```ts
export async function markAllNotificationsReadComposable(): Promise<Notification[]> {
  return retryFetch<Notification[]>('/api/notifications/markAllRead', {
    method: 'POST',
  });
}
```

---

## Phase 6 — Frontend: `UserNotification.vue` Full Rewrite

The existing component is a mix of `<script setup>` and Options API (`<script>` block with `name`). Rewrite it as pure `<script setup lang="ts">`. The design language should match the existing Tailwind classes in the codebase.

```vue
<!-- components/SidebarTopbar/UserNotification.vue -->
<template>
  <div ref="dropdownContainer" class="relative">

    <!-- Bell Button with Unread Badge -->
    <button
      type="button"
      class="size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
      @click="toggleNotifications"
    >
      <!-- Bell SVG (unchanged from current) -->
      <svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
      </svg>

      <!-- Unread count badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>

      <span class="sr-only">{{ $t('common.notifications') }}</span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="showNotifications"
      class="fixed top-[60px] right-0 h-[calc(100vh-60px)] w-80 bg-white border-l border-gray-200 shadow-xl dark:bg-neutral-800 dark:border-neutral-600 flex flex-col z-[100]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b dark:border-neutral-600 shrink-0">
        <h3 :class="theme === 'dark' ? 'text-white' : 'text-gray-900'" class="font-semibold text-sm">
          {{ $t('common.notifications') }}
        </h3>
        <button
          v-if="unreadCount > 0"
          class="text-xs text-blue-600 hover:underline dark:text-blue-400"
          @click="handleMarkAllRead"
        >
          {{ $t('notifications.markAllRead') }}
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b dark:border-neutral-600 shrink-0">
        <button
          v-for="tab in ['unread', 'read']"
          :key="tab"
          :class="[
            'flex-1 py-2 text-xs uppercase font-medium transition-colors',
            activeTab === tab
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
          ]"
          @click="activeTab = tab"
        >
          {{ $t(`common.${tab}`) }}
          <span v-if="tab === 'unread' && unreadCount > 0" class="ml-1 text-blue-500">
            ({{ unreadCount }})
          </span>
        </button>
      </div>

      <!-- Notification List -->
      <ul class="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-700">
        <li
          v-if="activeNotifications.length === 0"
          class="p-6 text-center text-sm text-gray-400 dark:text-gray-500"
        >
          {{ $t('notifications.empty') }}
        </li>

        <li
          v-for="notification in activeNotifications"
          :key="notification.id"
          class="group flex gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
          @click="handleNotificationClick(notification)"
        >
          <!-- Type Icon -->
          <div class="shrink-0 mt-0.5">
            <span class="flex h-7 w-7 items-center justify-center rounded-full text-sm"
              :class="notificationIconClass(notification.type)">
              {{ notificationIcon(notification.type) }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {{ notification.title || $t(`notifications.titles.${notification.type}`) }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
              {{ formatMessage(notification) }}
            </p>
            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {{ formatRelativeTime(notification.created_at) }}
            </p>
          </div>

          <!-- Read/unread dot -->
          <div v-if="!notification.is_read" class="shrink-0 mt-2">
            <span class="block h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
        </li>
      </ul>

      <!-- Connection status footer (optional, subtle) -->
      <div
        v-if="!connected"
        class="shrink-0 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800"
      >
        <p class="text-[10px] text-yellow-700 dark:text-yellow-400">
          {{ $t('notifications.reconnecting') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useCentralStore } from '@/stores/centralStore';
import type { Notification, NotificationType } from '~/types';

const router = useRouter();
const { notificationsStore } = useCentralStore();
const { $colorMode } = useNuxtApp();

const theme = computed(() => $colorMode?.value || 'light');
const showNotifications = ref(false);
const activeTab = ref<'unread' | 'read'>('unread');
const dropdownContainer = ref<HTMLElement | null>(null);

const unreadCount = computed(() => notificationsStore.unreadCount);
const connected = computed(() => notificationsStore.connected);

const activeNotifications = computed(() =>
  activeTab.value === 'unread'
    ? notificationsStore.unreadNotifications
    : notificationsStore.readNotifications,
);

// ─── Toggle & Outside Click ───────────────────────────────────────────────────

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    activeTab.value = 'unread';
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    showNotifications.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

// ─── Actions ─────────────────────────────────────────────────────────────────

async function handleNotificationClick(notification: Notification) {
  // 1. Mark as read if currently unread
  if (!notification.is_read) {
    await notificationsStore.changeNotificationStatus(notification.id);
  }

  // 2. Navigate to the relevant page
  const route = getNotificationRoute(notification);
  if (route) {
    router.push(route);
  }

  // 3. Close the dropdown
  showNotifications.value = false;
}

async function handleMarkAllRead() {
  await notificationsStore.markAllRead();
}

// ─── Routing Map ─────────────────────────────────────────────────────────────

function getNotificationRoute(notification: Notification): string | null {
  switch (notification.type) {
    case 'leave_requested':
    case 'leave_requested_head_info':
    case 'leave_cancelled':
      // Navigate to the leaves page pre-filtered on the requesting user
      return notification.meta?.requesting_user_id
        ? `/leaves?userId=${notification.meta.requesting_user_id}`
        : '/leaves';

    case 'leave_approved':
    case 'leave_declined':
    case 'leave_auto_approved':
      // Navigate to the current user's own leaves view
      return '/leaves';

    default:
      return null;
  }
}

// ─── Display Helpers ─────────────────────────────────────────────────────────

const { t, d } = useI18n();

function formatMessage(notification: Notification): string {
  // If meta is populated, render via i18n for correct language
  if (notification.type !== 'unknown' && notification.meta?.leave_type_name) {
    try {
      return t(`notifications.messages.${notification.type}`, {
        userName:       notification.meta.requesting_user_name ?? '',
        leaveType:      notification.meta.leave_type_name ?? '',
        departmentName: notification.meta.department_name ?? '',
        dateFrom:       notification.meta.date_from
                          ? d(new Date(notification.meta.date_from), 'short')
                          : '',
        dateTo:         notification.meta.date_to
                          ? d(new Date(notification.meta.date_to), 'short')
                          : '',
        daysCount:      notification.meta.days_count ?? 0,
      });
    } catch {
      // Fall through to raw message
    }
  }
  return notification.message;
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t('notifications.justNow');
  if (mins < 60) return t('notifications.minutesAgo', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('notifications.hoursAgo', { n: hours });
  const days = Math.floor(hours / 24);
  return t('notifications.daysAgo', { n: days });
}

// Emoji icons per type — swap for Heroicons or similar if preferred
function notificationIcon(type: NotificationType): string {
  const icons: Record<string, string> = {
    leave_requested:          '📋',
    leave_approved:           '✅',
    leave_declined:           '❌',
    leave_cancelled:          '↩️',
    leave_auto_approved:      '⚡',
    leave_requested_head_info:'👁️',
  };
  return icons[type] ?? '🔔';
}

function notificationIconClass(type: NotificationType): string {
  const classes: Record<string, string> = {
    leave_requested:           'bg-blue-100 dark:bg-blue-900/30',
    leave_approved:            'bg-green-100 dark:bg-green-900/30',
    leave_declined:            'bg-red-100 dark:bg-red-900/30',
    leave_cancelled:           'bg-gray-100 dark:bg-gray-700',
    leave_auto_approved:       'bg-purple-100 dark:bg-purple-900/30',
    leave_requested_head_info: 'bg-yellow-100 dark:bg-yellow-900/30',
  };
  return classes[type] ?? 'bg-gray-100 dark:bg-gray-700';
}
</script>
```

---

## Phase 7 — Deep Link Target: Leaves Page

The notification click for `leave_requested` navigates to `/leaves?userId=123`. The leaves page needs to read that query parameter on mount and pre-select the user.

**Locate the component that renders the user selector on the yearly leaves page** (likely `components/Leaves/YearlyLeaves.vue` or the `pages/leaves.vue` page itself). Add the following to its `<script setup>`:

```ts
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();

onMounted(() => {
  const targetUserId = route.query.userId;
  if (targetUserId) {
    // Set whatever ref/store controls the "selected user" in this component
    // Examples (adjust to the actual variable name):
    selectedUserId.value = Number(targetUserId);
    // or: leavesStore.setSelectedUser(Number(targetUserId));
    // or: emit('userSelected', Number(targetUserId));
  }
});
```

**Important for Gemini:** Read the actual `YearlyLeaves.vue` component and identify the variable that controls which user's leaves are displayed (likely a `ref` named `selectedUser`, `activeUser`, or similar, or a store action). Apply the `onMounted` hook using that exact variable name.

---

## Phase 8 — i18n: New Translation Keys

Add to both `locales/en.json` and `locales/el.json`.

### `locales/en.json` additions:

```json
{
  "notifications": {
    "markAllRead": "Mark all as read",
    "empty": "No notifications",
    "justNow": "Just now",
    "minutesAgo": "{n} minute ago | {n} minutes ago",
    "hoursAgo": "{n} hour ago | {n} hours ago",
    "daysAgo": "{n} day ago | {n} days ago",
    "reconnecting": "Reconnecting to notification service...",
    "titles": {
      "leave_requested":          "New Leave Request",
      "leave_approved":           "Leave Approved",
      "leave_declined":           "Leave Declined",
      "leave_cancelled":          "Leave Cancelled",
      "leave_auto_approved":      "Leave Auto-Approved",
      "leave_requested_head_info":"Leave Request in Your Department",
      "unknown":                  "Notification"
    },
    "messages": {
      "leave_requested":          "{userName} requested {daysCount} day(s) of {leaveType} ({dateFrom}–{dateTo})",
      "leave_approved":           "Your {leaveType} request ({dateFrom}–{dateTo}) has been approved.",
      "leave_declined":           "Your {leaveType} request ({dateFrom}–{dateTo}) has been declined.",
      "leave_cancelled":          "{userName} cancelled their {leaveType} request ({dateFrom}–{dateTo}).",
      "leave_auto_approved":      "Your {leaveType} request ({dateFrom}–{dateTo}) was automatically approved.",
      "leave_requested_head_info":"{userName} from {departmentName} submitted a {leaveType} request ({dateFrom}–{dateTo})."
    }
  },
  "common": {
    "notifications": "Notifications"
  }
}
```

### `locales/el.json` additions (Greek):

```json
{
  "notifications": {
    "markAllRead": "Σήμανση όλων ως αναγνωσμένα",
    "empty": "Δεν υπάρχουν ειδοποιήσεις",
    "justNow": "Μόλις τώρα",
    "minutesAgo": "πριν {n} λεπτό | πριν {n} λεπτά",
    "hoursAgo": "πριν {n} ώρα | πριν {n} ώρες",
    "daysAgo": "πριν {n} μέρα | πριν {n} μέρες",
    "reconnecting": "Επανασύνδεση στην υπηρεσία ειδοποιήσεων...",
    "titles": {
      "leave_requested":          "Νέο Αίτημα Άδειας",
      "leave_approved":           "Έγκριση Άδειας",
      "leave_declined":           "Απόρριψη Άδειας",
      "leave_cancelled":          "Ακύρωση Άδειας",
      "leave_auto_approved":      "Αυτόματη Έγκριση Άδειας",
      "leave_requested_head_info":"Αίτημα Άδειας στο Τμήμα σας",
      "unknown":                  "Ειδοποίηση"
    },
    "messages": {
      "leave_requested":          "Ο/Η {userName} ζήτησε {daysCount} μέρα/ες {leaveType} ({dateFrom}–{dateTo})",
      "leave_approved":           "Το αίτημα {leaveType} σας ({dateFrom}–{dateTo}) εγκρίθηκε.",
      "leave_declined":           "Το αίτημα {leaveType} σας ({dateFrom}–{dateTo}) απορρίφθηκε.",
      "leave_cancelled":          "Ο/Η {userName} ακύρωσε το αίτημα {leaveType} ({dateFrom}–{dateTo}).",
      "leave_auto_approved":      "Το αίτημα {leaveType} σας ({dateFrom}–{dateTo}) εγκρίθηκε αυτόματα.",
      "leave_requested_head_info":"{userName} από {departmentName} υπέβαλε αίτημα {leaveType} ({dateFrom}–{dateTo})."
    }
  },
  "common": {
    "notifications": "Ειδοποιήσεις"
  }
}
```

---

## Implementation Order

1. **Laravel: install Reverb + configure `.env`** — needed before any WS testing
2. **Laravel: create all notification classes** (Phase 1.3) — pure new code, no breakage risk
3. **Laravel: update `LeavesController` notification calls** (Phase 1.4)
4. **Laravel: normalise notification response format** (Phase 1.7) — align with Nuxt expectations
5. **Laravel: add `markAllRead` endpoint** (Phase 1.5)
6. **Laravel: verify `broadcasting/auth` route + channels.php** (Phase 1.6)
7. **Nuxt: add Reverb keys to `nuxt.config.ts` and `.env`** (Phase 2.3) — no risk
8. **Nuxt: create `server/api/broadcasting/auth.post.ts`** (Phase 2.1)
9. **Nuxt: create `server/api/notifications/markAllRead.post.ts`** (Phase 2.2)
10. **Nuxt: update existing notification routes with normalisation guard** (Phase 2.4)
11. **Nuxt: `npm install laravel-echo pusher-js`** (Phase 3.1)
12. **Nuxt: create `plugins/echo.client.ts`** (Phase 3.2)
13. **Nuxt: create `types/notifications.ts`** (Phase 4)
14. **Nuxt: rewrite `stores/notifications.ts`** (Phase 5) — remove polling, add Echo
15. **Nuxt: add `markAllNotificationsReadComposable` to composable** (Phase 5.1)
16. **Nuxt: update `stores/centralStore.ts`** — remove `stopPollingNotifications()` from logout
17. **Nuxt: rewrite `UserNotification.vue`** (Phase 6)
18. **Nuxt: add `userId` query param handling to Leaves page** (Phase 7)
19. **Nuxt: add i18n keys** (Phase 8)

---

## Verification Checklist

### WebSocket Connection
- [ ] Open browser devtools Network tab → WS filter → confirm a `wss://` (or `ws://`) connection to Reverb appears on login
- [ ] Connection shows as active (not pending/failed)
- [ ] On logout, connection closes
- [ ] Kill Reverb process → browser shows "Reconnecting..." footer in notification panel → restart Reverb → reconnects and fetches missed notifications

### Bell Badge
- [ ] Badge shows correct unread count on initial load
- [ ] Badge increments immediately when a new notification arrives via WebSocket (without page refresh)
- [ ] Badge decrements when a notification is clicked (marked read)
- [ ] Badge disappears entirely when unread count reaches 0
- [ ] Badge shows "99+" when count exceeds 99

### Message Quality
- [ ] Notification reads "[Full Name] requested 2 day(s) of Annual Leave (22 Apr – 23 Apr)" — NOT "user 3 requested leave_type 5"
- [ ] Auto-approved WFH shows different message than pending leave request
- [ ] Head notification shows department name
- [ ] Greek locale shows Greek message strings

### Deep Linking
- [ ] Admin receives "New Leave Request" notification → clicks it → navigates to `/leaves` → the requesting user is pre-selected in the user filter
- [ ] Regular user receives "Leave Approved" notification → clicks it → navigates to `/leaves` (their own view)
- [ ] Clicking a notification closes the panel

### Mark All Read
- [ ] "Mark all as read" button appears only when `unreadCount > 0`
- [ ] Clicking it calls the backend, all notifications move to the Read tab, badge disappears

### Old Notifications (Regression)
- [ ] Notifications created before this deployment (old format, IDs in message) still render without crashing (fallback to `notification.message` in `formatMessage()`)

---

## Files Changed Summary

| File | Change Type | Notes |
|---|---|---|
| `stores/notifications.ts` | Full rewrite | Remove polling, add Echo subscription, new computeds |
| `stores/centralStore.ts` | Minor update | Remove `stopPollingNotifications()` from logout |
| `plugins/echo.client.ts` | New | Laravel Echo initialisation |
| `types/echo.d.ts` | New | TypeScript declaration for `$echo` on NuxtApp |
| `types/notifications.ts` | New | `Notification`, `NotificationType`, `NotificationMeta` |
| `composables/notificationsApiComposable.ts` | Update | Add `markAllNotificationsReadComposable` |
| `server/api/broadcasting/auth.post.ts` | New | WS channel auth proxy |
| `server/api/notifications/markAllRead.post.ts` | New | Batch mark-read endpoint |
| `server/api/notifications/getNotifications.post.ts` | Update | Add normalisation guard |
| `server/api/notifications/markedRead.post.ts` | Update | Add normalisation guard |
| `server/api/notifications/markedUnread.post.ts` | Update | Add normalisation guard |
| `nuxt.config.ts` | Update | Add `reverbAppKey`, `reverbHost`, `reverbPort`, `reverbScheme` to public config |
| `.env` / `.env.example` | Update | Add `NUXT_PUBLIC_REVERB_*` keys |
| `components/SidebarTopbar/UserNotification.vue` | Full rewrite | Badge, deep links, type icons, mark-all-read |
| `pages/leaves.vue` or `components/Leaves/YearlyLeaves.vue` | Update | Read `route.query.userId` on mount |
| `locales/en.json` | Update | All notification message/title/UI strings |
| `locales/el.json` | Update | Greek translations |
| Laravel: `app/Notifications/` | 5 new classes | All implementing `ShouldBroadcast` |
| Laravel: `app/Http/Controllers/LeavesController.php` | Update | Use new notification classes |
| Laravel: `routes/api.php` | Update | Add `notifications-mark-all-read` route |
| Laravel: `routes/channels.php` | Verify/update | Ensure private channel auth is registered |
| Laravel: `.env` | Update | Add `BROADCAST_CONNECTION=reverb` + `REVERB_*` keys |
