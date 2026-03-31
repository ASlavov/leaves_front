# Refactor Plan: Centralized User Avatar

## Problem Summary

The avatar rendering pattern (image → initials fallback) is duplicated inline across 7+ components with no shared abstraction. Sizes vary (38px, 50px, 90px, 132px). The `User` type also doesn't declare the `profile` sub-object, which means `user.profile` is only accessible via the `[key: string]: any` escape hatch — a type safety gap that will cause trouble as the codebase grows.

---

## Step 1 — Fix the `User` type definition

**File:** `types/index.ts`

Add a `UserProfile` interface and reference it in `User`:

```typescript
export interface UserProfile {
  id?: number;
  user_id?: number;
  phone?: string | null;
  internal_phone?: number | string | null;
  job_title?: string | null;
  job_description?: string | null;
  profile_image_base64?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number | string;
  email: string;
  name?: string;
  roles?: Role[];
  department_id?: number | string;
  department?: { id: number | string; name: string };
  profile?: UserProfile; // ← add this
  permissions?: Record<string, any>;
  user_status?: number;
  connected_users?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
```

The `profile_image_base64: null` case in the API response confirms we should type this as `string | null`, not just `string`.

---

## Step 2 — Create `UserAvatar.vue`

**New file:** `components/shared/UserAvatar.vue`

This component is the single source of truth for all avatar rendering.

### Props

| Prop        | Type           | Default  | Notes                                                   |
| ----------- | -------------- | -------- | ------------------------------------------------------- |
| `user`      | `User \| null` | required | Accepts any user object with optional `profile`         |
| `size`      | `number`       | `40`     | Pixel size — drives both container and image dimensions |
| `textClass` | `string`       | `''`     | Optional override for the initials text size/weight     |

### Internal logic

- Computed `src` → `user?.profile?.profile_image_base64 ?? null`
- Computed `initials` → parse `user.name` (split on space, take first char of each part, max 2 chars). This is more robust than the current `firstName`/`lastName` pattern, since the API returns a single `name` field like `"Antonis KELAIDIS"` — there is no `firstName`/`lastName` on the object.
- The container `div` is always rendered as `rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden` with inline `:style="{ width: size + 'px', height: size + 'px' }"`
- If `src` is present, render `<img>` with `object-cover w-full h-full`
- Otherwise render `<span>` with initials; font size is auto-derived from `size` (e.g. `Math.round(size / 2.8)`)

### Template sketch

```vue
<template>
  <div
    class="rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img v-if="src" :src="src" class="w-full h-full object-cover" alt="avatar" />
    <span
      v-else
      class="text-white font-semibold select-none"
      :style="{ fontSize: `${Math.round(size / 2.8)}px` }"
    >
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '@/types';

const props = withDefaults(
  defineProps<{
    user: User | null;
    size?: number;
    textClass?: string;
  }>(),
  {
    size: 40,
    textClass: '',
  },
);

const src = computed(() => props.user?.profile?.profile_image_base64 ?? null);

const initials = computed(() => {
  const parts = (props.user?.name ?? '').trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
});
</script>
```

---

## Step 3 — Replace inline avatar blocks in each component

For each component below, delete the `<div>…<img>…<span>` inline block and replace with `<UserAvatar>`.

| Component             | Current size          | Replacement                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------- |
| `MyAccount.vue`       | 38px                  | `<UserAvatar :user="user" :size="38" />`                      |
| `GroupsList.vue`      | 50px                  | `<UserAvatar :user="user" :size="50" />`                      |
| `LeavesList.vue`      | 50px                  | `<UserAvatar :user="user" :size="50" />`                      |
| `UsersList.vue`       | 50px                  | `<UserAvatar :user="user" :size="50" />`                      |
| `EntitlementDays.vue` | 24px (size-6)         | `<UserAvatar :user="user" :size="24" />`                      |
| `ProfileInfo.vue`     | ~90px                 | `<UserAvatar :user="userStore.userInfo" :size="90" />`        |
| `EditUser.vue`        | ~132px (display only) | `<UserAvatar>` for display outside edit mode (see note below) |

> **Note on `EditUser.vue`:** This component has a file upload flow that binds a local `formPhoto` base64 string (not yet persisted). In edit mode, keep the existing `<img :src="formPhoto">` preview since it reflects unsaved state. Use `UserAvatar` only for the display-only view outside of edit mode.

---

## Step 4 — Register `UserAvatar` globally

Since it is used in 7+ places, register it globally in `main.ts` to avoid repetitive per-file imports:

```typescript
import UserAvatar from '@/components/shared/UserAvatar.vue';
app.component('UserAvatar', UserAvatar);
```

If the project strongly prefers explicit local imports, import it per file instead — but global registration is the cleaner choice given the breadth of usage.

---

## On the "store" idea

Putting avatar logic in the store is the wrong layer:

- The store manages _data_ state; rendering concerns (HTML, CSS, size variants) belong in the component layer.
- Multiple users appear in lists (GroupsList, LeavesList, etc.) — a store getter would only work naturally for the currently logged-in user's own avatar.
- A store computed like `userStore.avatarSrc` could serve as a _convenience_ for the current user, but it doesn't solve the general case of rendering avatars for arbitrary `User` objects from a list.

The `UserAvatar` component approach handles both cases — the logged-in user (`userStore.userInfo`) and any arbitrary `User` from a list — with a single, uniform API.

---

## On the missing `profile` field on `User`

Yes, it will cause trouble eventually. Right now it "works" because of `[key: string]: any`, but:

- TypeScript won't catch typos like `user.profil?.profile_image_base64` — it silently resolves to `undefined`.
- IDE autocompletion won't suggest `profile` or any of its sub-fields.
- If someone destructures or narrows a `User` type, `profile` disappears from the type view entirely.

Step 1 above fixes this. It is a low-risk change since `profile` is declared optional (`?:`) — no existing code breaks, and type safety strictly improves.

---

## Files Touched Summary

| Action                             | File                                      |
| ---------------------------------- | ----------------------------------------- |
| Modify                             | `types/index.ts`                          |
| Create                             | `components/shared/UserAvatar.vue`        |
| Modify (replace inline avatar)     | `components/SidebarTopbar/MyAccount.vue`  |
| Modify (replace inline avatar)     | `components/Settings/GroupsList.vue`      |
| Modify (replace inline avatar)     | `components/Settings/LeavesList.vue`      |
| Modify (replace inline avatar)     | `components/Settings/UsersList.vue`       |
| Modify (replace inline avatar)     | `components/Settings/EntitlementDays.vue` |
| Modify (replace inline avatar)     | `components/Home/ProfileInfo.vue`         |
| Modify (display-only preview only) | `components/Settings/EditUser.vue`        |
| Modify (global register, optional) | `main.ts`                                 |
