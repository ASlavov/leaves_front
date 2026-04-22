# Major Bugfixes & New Features — Implementation Guide

Companion to `major_bugfixes_and_new_features_plan.md`. This file contains paste-ready code and exact edits for the executing agent.

Execute issues in this order: **#1 → #3 → #8 → #2 → #5 → #4 → #9 → #6 → #7**.

Read `major_bugfixes_and_new_features_plan.md` first for rationale. This file is the "how".

Conventions used by this codebase (do not break):
- `useFormStyles()` exports `input`, `label`, `submitBtn` class strings — use these for any new form element.
- Colors: primary red `#EA021A`, border `#DFEAF2`, text dark `text-black` / light `dark:text-white`.
- All user-facing strings go through `$t()` / `t()`. Add keys to both `locales/en.json` and `locales/el.json`.
- Day numbering: 0=Sunday … 6=Saturday.
- Local date strings: use `toLocalDateStr()` pattern, never `toISOString()` (timezone bug).
- No emojis in code.
- Stores proxied via `useCentralStore()` — don't import individual stores directly in components unless the existing file already does.

---

## #1 — Accrual Type Validation Error

### Step 1.1 — Confirm the backend enum

On the Laravel backend, open `app/Http/Controllers/Api/LeavesTypeController.php`. In the `store()` and `update()` methods, find the validation for `accrual_type`. It likely reads:
```php
'accrual_type' => 'nullable|in:upfront,pro_rata',
```

The migration (`add rules engine to leaves_types`) uses `upfront,pro_rata_monthly`. The validation must match:
```php
'accrual_type' => 'nullable|in:upfront,pro_rata_monthly',
```

Apply to both `store()` and `update()`. Run a create + edit through the UI to confirm the error is gone.

### Step 1.2 — If the migration is the source of truth elsewhere

Also check the model `app/Models/LeavesType.php` — if there's a const array listing accepted enum values (e.g. `const ACCRUAL_TYPES = [...]`), align it too.

No frontend changes needed. `EditLeaveType.vue:131` already sends `pro_rata_monthly`.

---

## #3 — Admin Leave Button Permissions

### Step 3.1 — Add new permission

Edit `stores/permissions.ts:15-68`. Add a new key inside the existing `profile_leave_balance` block (keep alphabetical/logical):

```ts
profile_leave_balance: {
  view: ['admin', 'hr-manager', 'head', 'user'],
  request_leave: ['admin', 'hr-manager', 'head', 'user'],
  cancel_leave: ['admin', 'hr-manager', 'head', 'user'],
  accept_leave: ['admin', 'hr-manager', 'head'],
  decline_leave: ['admin', 'hr-manager', 'head'],
  record_admin_leave: ['admin', 'hr-manager'],
},
```

### Step 3.2 — Gate the button

Edit `components/Leaves/YearlyLeaves.vue`. The button is at lines 40-45, nested inside a parent `v-if` at line 33 (`accept_leave`). Split the gating so the title section still shows for heads but only the admin button is hidden:

Replace lines 32-46 with:
```vue
<div
  v-if="permissionsStore.can('profile_leave_balance', 'accept_leave')"
  class="text-black dark:text-white col-span-1 font-bold flex items-center gap-4"
>
  <div class="whitespace-nowrap">
    {{ $t('leaves.leaveRequests') }}
    <span class="text-[#EA021A]">({{ filteredLeaves.length }})</span>
  </div>
  <button
    v-if="permissionsStore.can('profile_leave_balance', 'record_admin_leave')"
    class="inline-flex justify-center rounded-[70px] border shrink-0 border-transparent bg-[#EA021A] py-[5px] px-[20px] text-[14px] font-medium text-white shadow-sm hover:bg-[#EA021A]/80 focus:outline-none whitespace-nowrap"
    @click="adminLeaveModalOpen = true"
  >
    {{ $t('leaves.admin.recordBtn') }}
  </button>
</div>
```

### Step 3.3 — Permissions matrix UI

Edit `components/Settings/Permissions.vue`. Find the `categoryDefinitions` computed and `hasPermission` matrix (search for `profile_leave_balance` to locate both). Add a row entry for `record_admin_leave`:
- `categoryDefinitions`: append `{ category: 'profile_leave_balance', action: 'record_admin_leave', label: t('permissions.recordAdminLeave') }`
- `hasPermission` matrix: true for admin (row 1) and hr-manager (row 2), false for head and user.

### Step 3.4 — Locale keys

Add to `locales/en.json` under `permissions`:
```json
"recordAdminLeave": "Record administrative leave"
```

Add to `locales/el.json` under `permissions`:
```json
"recordAdminLeave": "Καταχώρηση διοικητικής άδειας"
```

---

## #8 — Holidays Year Fetch Bug

### Step 8.1 — Make `useHolidays` reactive

Replace `composables/holidaysApiComposable.ts:49-59` with:

```ts
// ─── Reactive Variants ────────────────────────────────────────────────────────

import { computed, isRef, type Ref } from 'vue';

export const useHolidays = (yearInput?: Ref<number | undefined> | number) => {
  const yearRef = isRef(yearInput) ? yearInput : ref(yearInput);

  const key = computed(() => `holidays-${yearRef.value ?? 'all'}`);
  const url = computed(() =>
    yearRef.value ? `/api/holidays?year=${yearRef.value}` : '/api/holidays',
  );

  return useAsyncData<PublicHoliday[]>(
    key.value,
    () => $fetch<PublicHoliday[]>(url.value),
    {
      lazy: true,
      server: true,
      watch: [yearRef],
    },
  );
};
```

Top-of-file import additions:
```ts
import { computed, isRef, ref, type Ref } from 'vue';
```

Remove the existing `ref` import if it's already separately imported from a different place to avoid duplicates.

### Step 8.2 — Pass the ref from PublicHolidays.vue

Edit `components/Settings/PublicHolidays.vue:497-501`. Change from:
```ts
const {
  data: remoteHolidays,
  pending: holidaysPending,
  refresh: refreshHolidays,
} = useHolidays(selectedYear.value);
```

To:
```ts
const {
  data: remoteHolidays,
  pending: holidaysPending,
  refresh: refreshHolidays,
} = useHolidays(selectedYear);
```

### Step 8.3 — Simplify year navigation

Edit `components/Settings/PublicHolidays.vue:522-529`. `useAsyncData`'s `watch` now auto-refetches when `selectedYear` changes, so the explicit `refreshHolidays()` calls become redundant (but harmless). Prefer removing them for clarity:

```ts
const prevYear = () => {
  selectedYear.value--;
};
const nextYear = () => {
  selectedYear.value++;
};
```

Keep `refreshHolidays` imported — still used after create/update/delete in `saveHoliday`, `doDelete`, etc.

---

## #2 — Invitation Sender Details Missing

### Step 2.1 — Backend eager load

On Laravel backend, `app/Http/Controllers/Api/InvitationController.php::list()`. Ensure eager loading includes `profile`:

```php
public function list(Request $request)
{
    $userId = (int) $request->query('user_id');

    $sent = Invitation::with(['receiver.profile'])
        ->where('user_id_from', $userId)
        ->orderByDesc('created_at')
        ->get();

    $received = Invitation::with(['sender.profile'])
        ->where('user_id_to', $userId)
        ->orderByDesc('created_at')
        ->get();

    return response()->json(['sent' => $sent, 'received' => $received]);
}
```

Verify `Invitation` model has `sender()` and `receiver()` BelongsTo relations to `User`.

### Step 2.2 — Frontend fallback hydration

Edit `components/Settings/Invitations.vue`. After line 354 (`const userStore = centralStore.userStore;`), add:

```ts
const resolveUser = (inv, side /* 'sender' | 'receiver' */) => {
  const relation = inv?.[side];
  if (relation && (relation.name || relation.email)) return relation;
  const id = side === 'sender' ? inv?.user_id_from : inv?.user_id_to;
  return (userStore.allUsers || []).find((u) => String(u.id) === String(id)) || null;
};
```

Replace sender references (lines 113-120):
```vue
<SharedUserAvatar :user="resolveUser(inv, 'sender')" :size="36" />
<div class="flex-1 min-w-0">
  <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
    {{ resolveUser(inv, 'sender')?.name || resolveUser(inv, 'sender')?.email }}
  </p>
  <p class="text-xs text-gray-500 dark:text-neutral-400 truncate">
    {{ resolveUser(inv, 'sender')?.email }}
  </p>
</div>
```

Replace receiver references (lines 51-59):
```vue
<SharedUserAvatar :user="resolveUser(inv, 'receiver')" :size="36" />
<div class="flex-1 min-w-0">
  <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
    {{ resolveUser(inv, 'receiver')?.name || resolveUser(inv, 'receiver')?.email }}
  </p>
  <p class="text-xs text-gray-500 dark:text-neutral-400 truncate">
    {{ resolveUser(inv, 'receiver')?.email }}
  </p>
</div>
```

Call-site-level computed helpers would be cleaner but this pattern matches the rest of the file. If performance becomes an issue, wrap `resolveUser` with a `Map` cache keyed by `invId:side`.

---

## #5 — Delete User Modal + Icon Sizing

### Step 5.1 — Create `components/Settings/DeleteUserModal.vue`

```vue
<template>
  <div class="px-[30px] pb-[30px] pt-[10px]">
    <h3 class="text-[20px] font-bold text-black dark:text-white mb-[8px]">
      {{ $t('settings.deleteUserTitle') }}
    </h3>
    <p class="text-[14px] text-gray-600 dark:text-neutral-400 mb-[20px]">
      {{ $t('settings.deleteUserWarning') }}
    </p>

    <div
      v-if="user"
      class="flex items-center gap-[12px] p-[12px] rounded-[8px] bg-gray-50 dark:bg-neutral-700/40 mb-[20px]"
    >
      <SharedUserAvatar :user="user" :size="40" />
      <div class="min-w-0">
        <p class="text-[14px] font-bold text-black dark:text-white truncate">
          {{ user.name }}
        </p>
        <p class="text-[12px] text-gray-500 dark:text-neutral-400 truncate">
          {{ user.email }}
        </p>
      </div>
    </div>

    <div class="mb-[20px]">
      <label :class="labelClass">
        {{ $t('settings.typeNameToConfirm', { name: user?.name || '' }) }}
      </label>
      <input
        v-model="confirmation"
        :class="inputClass"
        type="text"
        :placeholder="user?.name"
        autocomplete="off"
      />
    </div>

    <p class="text-[12px] text-amber-600 dark:text-amber-400 mb-[20px]">
      {{ $t('common.irreversibleAction') }}
    </p>

    <div class="flex gap-[10px] justify-end">
      <button
        type="button"
        class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
        @click="emit('saved')"
      >
        {{ $t('common.cancel') }}
      </button>
      <button
        type="button"
        :disabled="!canSubmit || loading"
        class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        @click="doDelete"
      >
        {{ loading ? $t('common.deleting') : $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const { input: inputClass, label: labelClass } = useFormStyles();
const { $toast } = useNuxtApp() as any;
const centralStore = useCentralStore();
const { userStore } = centralStore;

const props = defineProps({
  userId: {
    type: [Number, String] as PropType<number | string | null>,
    default: null,
  },
});
const emit = defineEmits(['saved']);

const user = computed(() =>
  (userStore.allUsers || []).find((u: any) => String(u.id) === String(props.userId)),
);

const confirmation = ref('');
const loading = ref(false);

const canSubmit = computed(
  () =>
    user.value &&
    confirmation.value.trim().toLowerCase() === (user.value.name || '').trim().toLowerCase(),
);

const doDelete = async () => {
  if (!canSubmit.value || !props.userId) return;
  loading.value = true;
  try {
    await userStore.deleteUser(props.userId);
    $toast.success(t('settings.userDeletedSuccess'));
    emit('saved');
  } catch (err) {
    $toast.error(t('settings.userDeletedError'));
  } finally {
    loading.value = false;
  }
};
</script>
```

### Step 5.2 — Ensure `userStore.deleteUser` exists

Open `stores/user.ts`. If there's no `deleteUser` action, add one following the `terminateUser` pattern. It should call a composable that hits a backend DELETE endpoint. If the endpoint doesn't exist on the Laravel side, add it (`DELETE /user/{id}` on the backend, plus `server/api/user/delete.ts` Nuxt proxy) — mirror the structure of `server/api/user/terminate.ts`.

Minimal composable addition to `composables/userApiComposable.ts`:
```ts
export const deleteUserComposable = (userId: number | string) => {
  return retryFetch(`/api/user/delete/${userId}`, { method: 'DELETE' });
};
```

Nuxt proxy `server/api/user/delete/[id].delete.ts`:
```ts
import { defineEventHandler, getRouterParam } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const id = getRouterParam(event, 'id');

  return await $fetch(`${config.public.apiBase}/user/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-TOKEN': config.apiSecret,
    },
  });
});
```

Add to `stores/user.ts`:
```ts
const deleteUser = async (userId: number | string) => {
  try {
    loading.value = true;
    setError(null);
    await deleteUserComposable(userId);
    await getAllUsers();
  } catch (err) {
    setError(t('errors.users.deleteFailed'));
    throw err;
  } finally {
    loading.value = false;
  }
};
```
Add `deleteUser` to the returned object and to the composable import block at the top.

### Step 5.3 — Wire modal into UsersList.vue

Edit `components/Settings/UsersList.vue`.

Add the import near the existing `EditUser` import:
```ts
import DeleteUserModal from './DeleteUserModal.vue';
```

Update the `modalComponent` computed at line 567-569:
```ts
const modalComponent = computed(() => {
  if (modalType.value === 'edit') return EditUser;
  if (modalType.value === 'delete') return DeleteUserModal;
  return null;
});
```

### Step 5.4 — Normalize action icons

Replace the action column block at lines 340-367 with unified sizing (32×32 buttons, 20×20 icons):

```vue
<a
  v-if="permissionsStore.can('all_users', 'modify')"
  class="cursor-pointer text-[#EA021A] font-bold underline"
  @click="editUser(user.id)"
>{{ $t('settings.editProfile') }}</a>

<button
  v-if="permissionsStore.can('all_users', 'modify')"
  class="h-[32px] px-[12px] rounded-[6px] text-[13px] font-medium text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 focus:outline-none transition-colors"
  @click="showTerminateUser(user.id)"
>
  {{ $t('settings.terminate') }}
</button>

<button
  v-if="permissionsStore.can('all_users', 'modify')"
  type="button"
  class="h-[32px] w-[32px] flex items-center justify-center rounded-[6px] text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 focus:outline-none transition-colors"
  :aria-label="$t('common.delete')"
  @click="deleteUser(user.id)"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 16 19" fill="none">
    <path
      d="M13.4104 14.3631L14.1604 14.3698L13.4104 14.3631ZM1 3.58333C0.585786 3.58333 0.25 3.91912 0.25 4.33333C0.25 4.74755 0.585786 5.08333 1 5.08333V3.58333ZM14.3333 5.08333C14.7475 5.08333 15.0833 4.74755 15.0833 4.33333C15.0833 3.91912 14.7475 3.58333 14.3333 3.58333V5.08333ZM6.75 7.66667C6.75 7.25245 6.41421 6.91667 6 6.91667C5.58579 6.91667 5.25 7.25245 5.25 7.66667H6.75ZM5.25 14.3333C5.25 14.7475 5.58579 15.0833 6 15.0833C6.41421 15.0833 6.75 14.7475 6.75 14.3333H5.25ZM10.0833 7.66667C10.0833 7.25245 9.74755 6.91667 9.33333 6.91667C8.91912 6.91667 8.58333 7.25245 8.58333 7.66667H10.0833ZM8.58333 14.3333C8.58333 14.7475 8.91912 15.0833 9.33333 15.0833C9.74755 15.0833 10.0833 14.7475 10.0833 14.3333H8.58333ZM12.75 4.32664L12.6605 14.3564L14.1604 14.3698L14.25 4.34003L12.75 4.32664ZM10.0772 16.9167H5.16667V18.4167H10.0772V16.9167ZM1.08333 4.33333V14.3333H2.58333V4.33333H1.08333ZM1 5.08333H1.83333V3.58333H1V5.08333ZM1.83333 5.08333H4.33333V3.58333H1.83333V5.08333ZM4.33333 5.08333H11V3.58333H4.33333V5.08333ZM11 5.08333H13.5V3.58333H11V5.08333ZM13.5 5.08333H14.3333V3.58333H13.5V5.08333ZM5.08333 3.96296C5.08333 2.82138 6.15445 1.75 7.66667 1.75V0.25C5.49699 0.25 3.58333 1.83175 3.58333 3.96296H5.08333ZM7.66667 1.75C9.17889 1.75 10.25 2.82138 10.25 3.96296H11.75C11.75 1.83174 9.83634 0.25 7.66667 0.25V1.75ZM3.58333 3.96296V4.33333H5.08333V3.96296H3.58333ZM10.25 3.96296V4.33333H11.75V3.96296H10.25ZM5.16667 16.9167C3.73993 16.9167 2.58333 15.7601 2.58333 14.3333H1.08333C1.08333 16.5885 2.9115 18.4167 5.16667 18.4167V16.9167ZM12.6605 14.3564C12.6478 15.7741 11.495 16.9167 10.0772 16.9167V18.4167C12.3182 18.4167 14.1404 16.6106 14.1604 14.3698L12.6605 14.3564ZM5.25 7.66667V14.3333H6.75V7.66667H5.25ZM8.58333 7.66667V14.3333H10.0833V7.66667H8.58333Z"
      fill="currentColor"
    />
  </svg>
</button>
```

This drops the theme-dependent `:fill="theme === 'light' ? 'black' : 'white'"` in favor of `currentColor` + Tailwind's dark-mode text classes for consistency.

### Step 5.5 — Locale keys

Add to both locales (adapt Greek):

`en.json`:
```json
"common": {
  "deleting": "Deleting...",
  "irreversibleAction": "This action cannot be undone."
},
"settings": {
  "deleteUserTitle": "Delete user",
  "deleteUserWarning": "This will permanently delete the user and all their leave records. If the user is simply leaving the company, use Terminate instead to preserve historical data.",
  "typeNameToConfirm": "Type {name} to confirm",
  "userDeletedSuccess": "User deleted successfully",
  "userDeletedError": "Failed to delete user"
},
"errors": {
  "users": {
    "deleteFailed": "Could not delete user"
  }
}
```

---

## #4 — UI Consistency

### Step 4.1 — Create `components/shared/FlatpickrInput.vue`

```vue
<template>
  <input
    ref="inputRef"
    :class="inputClass"
    :placeholder="placeholder || $t('common.selectDate')"
    readonly
    :value="modelValue"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, type PropType } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import type { Instance, DateOption } from 'flatpickr/dist/types/instance';
import { useFormStyles } from '@/composables/useFormStyles';

const props = defineProps({
  modelValue: { type: String as PropType<string>, default: '' },
  placeholder: { type: String, default: '' },
  minDate: { type: [String, Date, null] as PropType<DateOption | null>, default: null },
  maxDate: { type: [String, Date, null] as PropType<DateOption | null>, default: null },
  disable: {
    type: Array as PropType<Array<((date: Date) => boolean) | string | Date>>,
    default: () => [],
  },
});

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { input: inputClass } = useFormStyles();
const inputRef = ref<HTMLInputElement | null>(null);
let instance: Instance | null = null;

const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

onMounted(() => {
  if (!inputRef.value) return;
  instance = flatpickr(inputRef.value, {
    dateFormat: 'Y-m-d',
    defaultDate: props.modelValue || undefined,
    minDate: props.minDate || undefined,
    maxDate: props.maxDate || undefined,
    disable: props.disable,
    onChange: (dates) => {
      const v = dates[0] ? toLocalDateStr(dates[0]) : '';
      emit('update:modelValue', v);
    },
  });
});

watch(
  () => props.modelValue,
  (v) => {
    if (instance && v !== (instance.input.value || '')) {
      instance.setDate(v || '', false);
    }
  },
);

watch(
  () => [props.minDate, props.maxDate, props.disable],
  ([min, max, disable]) => {
    if (!instance) return;
    instance.set('minDate', (min as DateOption) || undefined);
    instance.set('maxDate', (max as DateOption) || undefined);
    instance.set('disable', (disable as any) || []);
  },
);

onBeforeUnmount(() => {
  instance?.destroy();
  instance = null;
});
</script>
```

### Step 4.2 — Create `components/shared/WeekdayPills.vue`

```vue
<template>
  <div class="flex flex-wrap gap-[8px]">
    <button
      v-for="day in days"
      :key="day.value"
      type="button"
      :disabled="disabled"
      :class="[
        'h-[36px] min-w-[44px] px-[12px] rounded-full text-[13px] font-bold transition-colors focus:outline-none',
        isActive(day.value)
          ? 'bg-[#EA021A] text-white border border-[#EA021A]'
          : 'bg-white text-gray-600 border border-[#DFEAF2] hover:border-gray-400 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:border-neutral-400',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click="toggle(day.value)"
    >
      {{ day.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: { type: Array as PropType<number[]>, default: () => [] },
  disabled: { type: Boolean, default: false },
  // Start-of-week index (0=Sun). Only changes visual order, not values.
  startOfWeek: { type: Number as PropType<number>, default: 1 },
});

const emit = defineEmits<{ (e: 'update:modelValue', value: number[]): void }>();

const dayLabels = computed(() => [
  { value: 0, label: t('settings.days.sunday') },
  { value: 1, label: t('settings.days.monday') },
  { value: 2, label: t('settings.days.tuesday') },
  { value: 3, label: t('settings.days.wednesday') },
  { value: 4, label: t('settings.days.thursday') },
  { value: 5, label: t('settings.days.friday') },
  { value: 6, label: t('settings.days.saturday') },
]);

const days = computed(() => {
  const offset = ((props.startOfWeek % 7) + 7) % 7;
  return [...dayLabels.value.slice(offset), ...dayLabels.value.slice(0, offset)];
});

const isActive = (v: number) => props.modelValue.includes(v);

const toggle = (v: number) => {
  if (props.disabled) return;
  const set = new Set(props.modelValue);
  if (set.has(v)) set.delete(v);
  else set.add(v);
  emit('update:modelValue', [...set].sort((a, b) => a - b));
};
</script>
```

Ensure `common.days.*` keys exist in both locales (short three-letter forms). If they already exist (check locales), skip this.

### Step 4.3 — AdminLeaveModal: CustomSelect → CustomMultiSelect + flatpickr

Replace the entire `components/Leaves/AdminLeaveModal.vue` with:

```vue
<template>
  <SharedBaseModal v-model="isOpen">
    <div class="px-[30px] pb-[30px] pt-[10px]">
      <h3 class="text-[20px] font-bold text-black dark:text-white mb-[16px]">
        {{ $t('leaves.admin.recordTitle') }}
      </h3>
      <form class="space-y-[15px]" @submit.prevent="submitForm">
        <div>
          <label :class="labelClass">
            {{ $t('common.employees') }} <span class="text-[#EA021A]">*</span>
          </label>
          <MiscCustomMultiSelect
            v-model="payload.userIds"
            :options="userOptions"
            :placeholder="$t('leaves.admin.selectEmployees')"
          />
        </div>

        <div>
          <label :class="labelClass">{{ $t('settings.leaveType') }}</label>
          <MiscCustomSelect
            v-model="payload.leaveTypeId"
            :options="leaveTypeOptions"
            :placeholder="$t('settings.selectLeaveType')"
            select-id="admin-leave-select"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[15px]">
          <div>
            <label :class="labelClass">
              {{ $t('leaves.fromDate') }} <span class="text-[#EA021A]">*</span>
            </label>
            <SharedFlatpickrInput v-model="payload.startDate" />
          </div>
          <div>
            <label :class="labelClass">
              {{ $t('leaves.toHuman') }} <span class="text-[#EA021A]">*</span>
            </label>
            <SharedFlatpickrInput v-model="payload.endDate" :min-date="payload.startDate" />
          </div>
        </div>

        <div>
          <label :class="labelClass">
            {{ $t('leaves.admin.reasonNotes') }} <span class="text-[#EA021A]">*</span>
          </label>
          <textarea
            v-model="payload.administrativeReason"
            rows="3"
            class="py-[8px] px-[16px] block w-full border border-[#DFEAF2] rounded-[8px] text-[14px] bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-gray-100"
            required
          ></textarea>
        </div>

        <div class="flex justify-end gap-[10px] pt-[8px]">
          <button
            type="button"
            class="inline-flex items-center justify-center py-[10px] px-[20px] rounded-[70px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
            @click="isOpen = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            :class="submitBtnClass"
          >
            {{ $t('leaves.admin.submitBtn') }}
            <span v-if="payload.userIds.length" class="ml-1 text-xs opacity-80">
              ({{ payload.userIds.length }})
            </span>
          </button>
        </div>
      </form>
    </div>
  </SharedBaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '~/stores/centralStore';
import { useAdminStore } from '~/stores/admin';
import { useFormStyles } from '@/composables/useFormStyles';

const { t } = useI18n();
const { $toast } = useNuxtApp() as any;
const { label: labelClass, submitBtn: submitBtnClass } = useFormStyles();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'saved']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const centralStore = useCentralStore();
const adminStore = useAdminStore();
const userStore = centralStore.userStore;
const leavesStore = centralStore.leavesStore;

const loading = computed(() => adminStore.loading);

const payload = ref({
  userIds: [] as (string | number)[],
  leaveTypeId: '' as string | number,
  startDate: '',
  endDate: '',
  administrativeReason: '',
});

const userOptions = computed(() =>
  (userStore.allUsers || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
);

const leaveTypeOptions = computed(() =>
  (leavesStore.leavesData?.leavesTypes || []).map((lt: any) => ({ id: lt.id, name: lt.name })),
);

const canSubmit = computed(
  () =>
    payload.value.userIds.length > 0 &&
    payload.value.startDate &&
    payload.value.endDate &&
    payload.value.administrativeReason.trim(),
);

const submitForm = async () => {
  if (!canSubmit.value) return;
  const results = await Promise.allSettled(
    payload.value.userIds.map((userId) =>
      adminStore.recordAdministrativeLeave({
        userId,
        leaveTypeId: payload.value.leaveTypeId,
        startDate: payload.value.startDate,
        endDate: payload.value.endDate,
        administrativeReason: payload.value.administrativeReason,
      }),
    ),
  );
  const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - fulfilled;
  if (fulfilled) $toast.success(t('leaves.admin.saveSuccessBulk', { count: fulfilled }));
  if (failed) $toast.error(t('errors.leaves.adminSaveFailedBulk', { count: failed }));
  if (fulfilled) {
    emit('saved');
    isOpen.value = false;
    payload.value = {
      userIds: [],
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      administrativeReason: '',
    };
  }
};
</script>
```

Locale additions:

`en.json`:
```json
"common": {
  "employees": "Employees"
},
"leaves": {
  "admin": {
    "selectEmployees": "Select employees",
    "saveSuccessBulk": "{count} leave(s) recorded"
  }
},
"errors": {
  "leaves": {
    "adminSaveFailedBulk": "{count} failed to save"
  }
}
```

`el.json` — add equivalent Greek translations.

### Step 4.4 — NewLeave: native select → CustomSelect

Edit `components/Home/NewLeave.vue:85-111`. Replace the native select block with:

```vue
<!-- First row: Single input -->
<div>
  <MiscCustomSelect
    v-model="leaveType"
    :options="leaveTypeSelectOptions"
    :label="$t('leaves.leaveType') + ' <span class=\'text-[#EA021A]\'>*</span>'"
    :placeholder="$t('leaves.selectLeave')"
    select-id="new-leave-type"
  />
</div>
```

Add to the script section (near `filteredLeavesTypes`):
```ts
const leaveTypeSelectOptions = computed(() =>
  (filteredLeavesTypes.value || []).map((lt: any) => ({
    id: lt.leave_type_id,
    name: lt.leave_type_name,
  })),
);
```

Note: `CustomSelect` emits `string` for `modelValue`. If `leaveType` was previously a number, `String(...)` comparisons should already work (the rest of the form does `==`-style comparisons against `leave_type_id`). Verify nothing relies on `typeof leaveType === 'number'`.

### Step 4.5 — NewLeave date inputs → FlatpickrInput

`NewLeave.vue` already uses flatpickr via direct instantiation on `datePickerStart`/`datePickerEnd` refs. Leave this as-is — it's more specialized (working-day disable logic, hourly toggle). Don't migrate here.

### Step 4.6 — Other date input sites → FlatpickrInput

**`EditUser.vue:171`** — replace:
```vue
<input v-model="formHireDate" type="date" :class="inputClass" />
```
with:
```vue
<SharedFlatpickrInput v-model="formHireDate" />
```
Repeat for the inline-mode occurrence around line 358 if it exists.

**`PublicHolidays.vue:169`** — replace:
```vue
<input v-model="form.date" type="date" :class="inputClass" />
```
with:
```vue
<SharedFlatpickrInput v-model="form.date" />
```

**`TerminateUserModal.vue:16`** — replace the native `<input type="date">` with:
```vue
<SharedFlatpickrInput v-model="terminationDate" :min-date="'today'" />
```

Nuxt auto-imports resolve `SharedFlatpickrInput` from `components/shared/FlatpickrInput.vue`. No explicit import needed.

### Step 4.7 — EditUser workdays → WeekdayPills

Edit `components/Settings/EditUser.vue:174-189`. Replace the block with:

```vue
<div v-if="canEdit && !isNewUser" class="w-full lg:w-full">
  <label :class="labelClass">{{ $t('settings.personalWorkSchedule') }}</label>
  <div class="mt-[6px]">
    <SharedWeekdayPills v-model="formWorkSchedule" :start-of-week="1" />
  </div>
  <p class="text-[12px] text-gray-500 mt-[6px]">
    {{ $t('settings.workScheduleNote') }}
  </p>
</div>
```

Repeat for the inline-mode occurrence (around line 360). `formWorkSchedule` must be `number[]` — if it's currently `string[]`, ensure the toggle in `WeekdayPills` emits numbers; adjust the downstream payload serialization accordingly.

### Step 4.8 — WorkWeekSettings → WeekdayPills

Open `components/Settings/WorkWeekSettings.vue`. Replace the bespoke day-toggle UI with:

```vue
<SharedWeekdayPills v-model="workDays" :disabled="!canModify" :start-of-week="1" />
```

`workDays` must be a `number[]`. Adapt the save handler if needed.

---

## #9 — Phone Input with Country Code

### Step 9.1 — Install

```bash
npm install intl-tel-input
```

### Step 9.2 — Create `components/shared/PhoneInput.vue`

```vue
<template>
  <div class="w-full">
    <label v-if="label" :class="labelClass" v-html="label"></label>
    <div ref="wrapRef" class="phone-wrap">
      <input ref="inputRef" type="tel" :class="inputClass" :placeholder="placeholder" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import { useFormStyles } from '@/composables/useFormStyles';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  initialCountry: { type: String, default: 'gr' },
});
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'valid', valid: boolean): void;
}>();

const { input: inputClass, label: labelClass } = useFormStyles();
const wrapRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
let iti: any = null;

const emitCurrent = () => {
  if (!iti) return;
  const raw = (inputRef.value?.value || '').trim();
  if (!raw) {
    emit('update:modelValue', '');
    emit('valid', false);
    return;
  }
  const e164 = iti.getNumber();
  emit('update:modelValue', e164 || raw);
  emit('valid', iti.isValidNumber());
};

onMounted(() => {
  if (!inputRef.value) return;
  iti = intlTelInput(inputRef.value, {
    initialCountry: props.initialCountry,
    separateDialCode: true,
    formatOnDisplay: true,
    utilsScript:
      'https://cdn.jsdelivr.net/npm/intl-tel-input@latest/build/js/utils.js',
  });
  if (props.modelValue) {
    // Support legacy plain 10-digit numbers by prepending country code.
    const v = props.modelValue.startsWith('+')
      ? props.modelValue
      : `+${iti.getSelectedCountryData().dialCode}${props.modelValue}`;
    iti.setNumber(v);
  }
  inputRef.value.addEventListener('input', emitCurrent);
  inputRef.value.addEventListener('countrychange', emitCurrent);
});

watch(
  () => props.modelValue,
  (v) => {
    if (!iti) return;
    if ((iti.getNumber() || '') !== v) {
      iti.setNumber(v || '');
    }
  },
);

onBeforeUnmount(() => {
  if (iti) {
    inputRef.value?.removeEventListener('input', emitCurrent);
    inputRef.value?.removeEventListener('countrychange', emitCurrent);
    iti.destroy();
    iti = null;
  }
});
</script>

<style scoped>
.phone-wrap :deep(.iti) {
  width: 100%;
}
.phone-wrap :deep(.iti__tel-input) {
  width: 100%;
  height: 40px;
  padding: 8px 16px 8px 92px;
  border-radius: 8px;
}
.phone-wrap :deep(.iti--separate-dial-code .iti__selected-flag) {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
</style>
```

### Step 9.3 — Use in EditUser

Edit `components/Settings/EditUser.vue:115-135`. Replace the phone input with:

```vue
<div class="w-full lg:w-[300px]">
  <SharedPhoneInput
    v-model="formPhone"
    :label="$t('settings.phone')"
    :placeholder="$t('settings.phonePlaceholder')"
  />
</div>
```

Leave `internal_phone` (extension) as the existing numeric input — not a phone number.

### Step 9.4 — Form submission

In the form submit handler (search for `userPhone` / `String(parseInt(formPhone.value)`), change to pass through verbatim:
```ts
const userPhone = (formPhone.value || '').trim();
```
This preserves the E.164 format (`+302101234567`) that the component emits.

### Step 9.5 — Data migration

Existing users have 10-digit numbers. The `PhoneInput` component handles this: on mount, if `modelValue` lacks a `+`, it prepends the initial country's dial code. First update round will store them in E.164.

---

## #6 — Documents with Role-Based Access

### Step 6.1 — Backend migration

Create `database/migrations/2026_XX_XX_add_role_visibility_to_company_documents.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_document_users', function (Blueprint $t) {
            $t->foreignId('document_id')->constrained('company_documents')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->primary(['document_id', 'user_id']);
        });

        Schema::create('company_document_roles', function (Blueprint $t) {
            $t->foreignId('document_id')->constrained('company_documents')->cascadeOnDelete();
            $t->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $t->primary(['document_id', 'role_id']);
        });

        // Backfill: existing target_user_id rows → pivot
        $rows = DB::table('company_documents')
            ->whereNotNull('target_user_id')
            ->select('id', 'target_user_id')->get();
        foreach ($rows as $r) {
            DB::table('company_document_users')->insert([
                'document_id' => $r->id,
                'user_id' => $r->target_user_id,
            ]);
        }

        // Re-name target_type values: 'user' → 'restricted'
        Schema::table('company_documents', function (Blueprint $t) {
            $t->string('target_type_new', 20)->default('all')->after('target_type');
        });
        DB::statement("UPDATE company_documents SET target_type_new = CASE WHEN target_type = 'user' THEN 'restricted' ELSE 'all' END");
        Schema::table('company_documents', function (Blueprint $t) {
            $t->dropColumn('target_type');
        });
        Schema::table('company_documents', function (Blueprint $t) {
            $t->renameColumn('target_type_new', 'target_type');
        });

        Schema::table('company_documents', function (Blueprint $t) {
            $t->dropColumn('target_user_id');
        });
    }

    public function down(): void {
        Schema::table('company_documents', function (Blueprint $t) {
            $t->foreignId('target_user_id')->nullable()->after('target_type');
        });
        DB::statement("UPDATE company_documents SET target_type = 'user' WHERE target_type = 'restricted'");
        Schema::dropIfExists('company_document_roles');
        Schema::dropIfExists('company_document_users');
    }
};
```

Note: the enum→string→enum dance is because MySQL ENUM alteration is awkward. If the column is already a plain string, skip the rename.

### Step 6.2 — Backend model

`app/Models/CompanyDocument.php` — add:
```php
public function targetUsers() {
    return $this->belongsToMany(User::class, 'company_document_users', 'document_id', 'user_id');
}
public function targetRoles() {
    return $this->belongsToMany(Role::class, 'company_document_roles', 'document_id', 'role_id');
}
```

### Step 6.3 — Backend controller

`CompanyDocumentController::index($userId)` — replace the visibility query with:
```php
$user = User::with('roles')->findOrFail($userId);
$roleIds = $user->roles->pluck('id')->toArray();

$docs = CompanyDocument::with(['targetUsers:id,name,email', 'targetRoles:id,name'])
    ->where(function ($q) use ($user, $roleIds) {
        $q->where('target_type', 'all')
          ->orWhereHas('targetUsers', fn($qq) => $qq->where('users.id', $user->id))
          ->orWhereHas('targetRoles', fn($qq) => $qq->whereIn('roles.id', $roleIds));
    })
    ->orderByDesc('created_at')
    ->get();
```

`store()` and `update()` — accept `target_user_ids: int[]` and `target_role_ids: int[]`. Sync both relations:
```php
$doc->targetUsers()->sync($request->input('target_user_ids', []));
$doc->targetRoles()->sync($request->input('target_role_ids', []));
```

### Step 6.4 — Frontend types

Edit `types/document.ts`:
```ts
export type DocumentTargetType = 'all' | 'restricted';

export interface CompanyDocument {
  id: number;
  name: string;
  file: string;
  target_type: DocumentTargetType;
  target_users?: { id: number; name: string; email?: string }[];
  target_roles?: { id: number; name: string }[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentPayload {
  name: string;
  file: string; // base64
  target_type: DocumentTargetType;
  target_user_ids?: number[];
  target_role_ids?: number[];
}
```

### Step 6.5 — Composable + proxy

Already correctly forwards body. No change unless `targetUserId` query param has uses; replace with nothing (server returns scoped list based on auth context).

### Step 6.6 — Store

Edit `stores/documents.ts`. Replace the two computed properties (lines 18-19):
```ts
const companyDocuments = computed(() => documents.value.filter((d) => d.target_type === 'all'));
const personalDocuments = computed(() => documents.value.filter((d) => d.target_type === 'restricted'));
```

(The backend returns only documents the current user can see — so "personal" here really means "restricted and currently visible to me", which by definition are the ones targeting my user or my role.)

### Step 6.7 — UploadDocumentModal

Edit `components/Documents/UploadDocumentModal.vue`. Replace the single target selector with:

```vue
<div>
  <label :class="labelClass">{{ $t('documents.visibility') }}</label>
  <div class="flex gap-[16px] mt-[6px]">
    <label class="flex items-center gap-[6px] text-[14px] cursor-pointer">
      <input v-model="targetType" type="radio" value="all" class="accent-[#EA021A]" />
      {{ $t('documents.visibilityAll') }}
    </label>
    <label class="flex items-center gap-[6px] text-[14px] cursor-pointer">
      <input v-model="targetType" type="radio" value="restricted" class="accent-[#EA021A]" />
      {{ $t('documents.visibilityRestricted') }}
    </label>
  </div>
</div>

<div v-if="targetType === 'restricted'" class="space-y-[12px]">
  <div>
    <label :class="labelClass">{{ $t('documents.targetUsers') }}</label>
    <MiscCustomMultiSelect
      v-model="targetUserIds"
      :options="userOptions"
      :placeholder="$t('documents.targetUsersPlaceholder')"
    />
  </div>
  <div>
    <label :class="labelClass">{{ $t('documents.targetRoles') }}</label>
    <MiscCustomMultiSelect
      v-model="targetRoleIds"
      :options="roleOptions"
      :placeholder="$t('documents.targetRolesPlaceholder')"
    />
  </div>
  <p v-if="!targetUserIds.length && !targetRoleIds.length" class="text-[12px] text-amber-600">
    {{ $t('documents.restrictedWarning') }}
  </p>
</div>
```

Script additions:
```ts
const targetType = ref<'all' | 'restricted'>('all');
const targetUserIds = ref<number[]>([]);
const targetRoleIds = ref<number[]>([]);

const userOptions = computed(() =>
  (userStore.allUsers || []).map((u: any) => ({ id: u.id, name: u.name, email: u.email })),
);
const roleOptions = computed(() => permissionsStore.allRoles.map((r: any) => ({ id: r.id, name: r.name })));

// In save handler, build payload:
const payload: CreateDocumentPayload = {
  name: name.value,
  file: base64.value,
  target_type: targetType.value,
  target_user_ids: targetType.value === 'restricted' ? targetUserIds.value : [],
  target_role_ids: targetType.value === 'restricted' ? targetRoleIds.value : [],
};
```

Validation: if `target_type === 'restricted'` and both ID arrays are empty, block submit.

### Step 6.8 — DocumentCard

Edit `components/Documents/DocumentCard.vue:51-63`. Replace the badge section:

```vue
<div class="flex flex-wrap gap-[6px]">
  <span
    v-if="document.target_type === 'all'"
    class="text-[11px] font-semibold px-[8px] py-[2px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
  >
    {{ $t('documents.visibilityAll') }}
  </span>
  <template v-else>
    <span
      v-if="document.target_users?.length"
      class="text-[11px] font-semibold px-[8px] py-[2px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
    >
      {{ $t('documents.nUsers', { count: document.target_users.length }) }}
    </span>
    <span
      v-if="document.target_roles?.length"
      class="text-[11px] font-semibold px-[8px] py-[2px] rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    >
      {{ $t('documents.nRoles', { count: document.target_roles.length }) }}
    </span>
  </template>
</div>
```

### Step 6.9 — Locale keys

`en.json` additions under `documents`:
```json
"visibility": "Visibility",
"visibilityAll": "Company-wide",
"visibilityRestricted": "Restricted",
"targetUsers": "Specific users",
"targetUsersPlaceholder": "Select users",
"targetRoles": "Specific roles",
"targetRolesPlaceholder": "Select roles",
"restrictedWarning": "Select at least one user or role, otherwise the document will not be visible to anyone.",
"nUsers": "{count} user(s)",
"nRoles": "{count} role(s)"
```

Mirror in `el.json`.

---

## #7 — Reports Tab

Due to scope, this is broken into sub-steps. Build in order.

### Step 7.1 — Install PDF lib

```bash
npm install html2pdf.js
```

### Step 7.2 — Permissions

Extend `stores/permissions.ts`:
```ts
reports: {
  view: ['admin', 'hr-manager'],
  export: ['admin', 'hr-manager'],
},
```

Update `components/Settings/Permissions.vue` matrix — add two rows.

### Step 7.3 — Sidebar link

Edit `components/SidebarTopbar/SidebarMenu.vue`. Before the Settings `<li>` (line 106), insert:

```vue
<li v-if="permissionsStore.can('reports', 'view')">
  <NuxtLink
    class="flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:bg-neutral-700 dark:text-white"
    to="/reports"
    @click="$emit('navigate')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 6-10" />
    </svg>
    {{ $t('common.reports') }}
  </NuxtLink>
</li>
```

Add the script import at the bottom (the file currently has a bare `defineEmits` — extend):
```vue
<script setup>
import { useCentralStore } from '@/stores/centralStore';
defineEmits(['navigate']);
const { permissionsStore } = useCentralStore();
</script>
```

### Step 7.4 — Backend aggregate endpoint

`routes/api.php`:
```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/reports/summary', [ReportsController::class, 'summary'])
        ->middleware('admin_or_hr');
});
```

`app/Http/Middleware/AdminOrHr.php` — gate to roles admin + hr-manager.

`app/Http/Controllers/Api/ReportsController.php`:
```php
public function summary(Request $r) {
    $year = (int) ($r->query('year') ?? now()->year);
    $deptIds = (array) $r->query('dept_ids', []);
    $typeIds = (array) $r->query('leave_type_ids', []);

    $leavesBase = Leave::query()
        ->whereYear('start_date', $year)
        ->when($typeIds, fn($q) => $q->whereIn('leave_type_id', $typeIds))
        ->when($deptIds, fn($q) => $q->whereHas('user', fn($u) => $u->whereIn('department_id', $deptIds)));

    $byMonth = (clone $leavesBase)
        ->selectRaw('MONTH(start_date) as m, SUM(DATEDIFF(end_date, start_date) + 1) as days')
        ->groupBy('m')->orderBy('m')->get();

    $byDept = (clone $leavesBase)
        ->join('users', 'users.id', '=', 'leaves.user_id')
        ->selectRaw('users.department_id, SUM(DATEDIFF(end_date, start_date) + 1) as days')
        ->groupBy('users.department_id')->get();

    $byType = (clone $leavesBase)
        ->selectRaw('leave_type_id, SUM(DATEDIFF(end_date, start_date) + 1) as days')
        ->groupBy('leave_type_id')->get();

    $topUsers = (clone $leavesBase)
        ->selectRaw('user_id, SUM(DATEDIFF(end_date, start_date) + 1) as days')
        ->groupBy('user_id')->orderByDesc('days')->limit(10)
        ->with('user:id,name,email')->get();

    $pending = Leave::where('status', 'pending')->count();
    $headcount = User::whereNull('termination_date')->count();

    return response()->json([
        'year' => $year,
        'by_month' => $byMonth,
        'by_department' => $byDept,
        'by_type' => $byType,
        'top_users' => $topUsers,
        'pending_count' => $pending,
        'headcount' => $headcount,
    ]);
}
```

### Step 7.5 — Nuxt proxy

`server/api/reports/summary.get.ts`:
```ts
import { defineEventHandler, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { token } = event.context;
  const q = getQuery(event);
  const params = new URLSearchParams();
  if (q.year) params.set('year', String(q.year));
  if (Array.isArray(q.dept_ids)) q.dept_ids.forEach((d) => params.append('dept_ids[]', String(d)));
  if (Array.isArray(q.leave_type_ids)) q.leave_type_ids.forEach((t) => params.append('leave_type_ids[]', String(t)));
  return await $fetch(`${config.public.apiBase}/reports/summary?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-CSRF-TOKEN': config.apiSecret,
    },
  });
});
```

### Step 7.6 — Composable + store

`composables/reportsApiComposable.ts`:
```ts
export interface ReportSummary {
  year: number;
  by_month: { m: number; days: number }[];
  by_department: { department_id: number; days: number }[];
  by_type: { leave_type_id: number; days: number }[];
  top_users: { user_id: number; days: number; user: { id: number; name: string; email: string } }[];
  pending_count: number;
  headcount: number;
}

export const getReportSummaryComposable = (
  year: number,
  deptIds: number[] = [],
  leaveTypeIds: number[] = [],
) => {
  const qs = new URLSearchParams();
  qs.set('year', String(year));
  deptIds.forEach((d) => qs.append('dept_ids', String(d)));
  leaveTypeIds.forEach((t) => qs.append('leave_type_ids', String(t)));
  return retryFetch<ReportSummary>(`/api/reports/summary?${qs.toString()}`, { method: 'GET' });
};
```

`stores/reports.ts`:
```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getReportSummaryComposable, type ReportSummary } from '~/composables/reportsApiComposable';

export const useReportsStore = defineStore('reportsStore', () => {
  const summary = ref<ReportSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const { t } = useI18n();

  const fetchSummary = async (year: number, deptIds: number[] = [], typeIds: number[] = []) => {
    loading.value = true;
    error.value = null;
    try {
      summary.value = await getReportSummaryComposable(year, deptIds, typeIds);
    } catch (err) {
      error.value = t('errors.reports.fetchFailed');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { summary, loading, error, fetchSummary };
});
```

Register in `stores/centralStore.ts` — import, initialize, expose as `reportsStore`, reset on logout.

### Step 7.7 — Reports page

`pages/reports.vue`:
```vue
<template>
  <SidebarTopbarSidebar />
  <div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900">
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-end gap-[12px]">
        <div class="w-[160px]">
          <label :class="labelClass">{{ $t('reports.year') }}</label>
          <MiscCustomSelect
            v-model="yearStr"
            :options="yearOptions"
            :placeholder="$t('reports.year')"
            select-id="reports-year"
          />
        </div>
        <div class="min-w-[240px] flex-1">
          <label :class="labelClass">{{ $t('reports.departments') }}</label>
          <MiscCustomMultiSelect
            v-model="selectedDeptIds"
            :options="deptOptions"
            :placeholder="$t('reports.allDepartments')"
          />
        </div>
        <div class="min-w-[240px] flex-1">
          <label :class="labelClass">{{ $t('reports.leaveTypes') }}</label>
          <MiscCustomMultiSelect
            v-model="selectedTypeIds"
            :options="typeOptions"
            :placeholder="$t('reports.allLeaveTypes')"
          />
        </div>
        <button
          type="button"
          class="h-[40px] px-[16px] rounded-[8px] border border-[#DFEAF2] dark:border-neutral-600 text-[14px] font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none"
          @click="customizeOpen = true"
        >
          {{ $t('reports.customize') }}
        </button>
        <button
          v-if="permissionsStore.can('reports', 'export')"
          type="button"
          class="h-[40px] px-[16px] rounded-[8px] bg-[#EA021A] text-white text-[14px] font-bold hover:bg-[#EA021A]/90 focus:outline-none"
          @click="exportPdf"
        >
          {{ $t('reports.exportPdf') }}
        </button>
      </div>

      <!-- Widget grid -->
      <div ref="reportContainerRef" class="grid grid-cols-12 gap-[12px]">
        <div
          v-for="w in visibleWidgets"
          :key="w.key"
          :class="['col-span-12', w.span || 'lg:col-span-6']"
        >
          <component :is="w.component" :summary="reportsStore.summary" :loading="reportsStore.loading" />
        </div>
      </div>
    </div>

    <!-- Customize modal -->
    <SharedBaseModal v-model="customizeOpen">
      <div class="px-[30px] pb-[30px] pt-[10px]">
        <h3 class="text-[20px] font-bold text-black dark:text-white mb-[16px]">
          {{ $t('reports.customize') }}
        </h3>
        <MiscCustomMultiSelect
          v-model="enabledWidgetKeys"
          :options="widgetOptions"
          :placeholder="$t('reports.selectWidgets')"
        />
        <div class="flex justify-end gap-[10px] mt-[20px]">
          <button
            type="button"
            :class="submitBtnClass"
            @click="saveCustomization"
          >
            {{ $t('common.saveChanges') }}
          </button>
        </div>
      </div>
    </SharedBaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, markRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCentralStore } from '@/stores/centralStore';
import { useFormStyles } from '@/composables/useFormStyles';
import { useReportsStore } from '@/stores/reports';
import LeavesByMonth from '@/components/Reports/LeavesByMonth.vue';
import LeavesByDepartment from '@/components/Reports/LeavesByDepartment.vue';
import LeaveTypeShare from '@/components/Reports/LeaveTypeShare.vue';
import TopUsers from '@/components/Reports/TopUsers.vue';
import PendingQueue from '@/components/Reports/PendingQueue.vue';
import Headcount from '@/components/Reports/Headcount.vue';

definePageMeta({ middleware: 'auth' }); // if an auth middleware exists

const { t } = useI18n();
const { label: labelClass, submitBtn: submitBtnClass } = useFormStyles();
const centralStore = useCentralStore();
const { permissionsStore, departmentsStore, leavesStore } = centralStore;
const reportsStore = useReportsStore();

const now = new Date();
const yearStr = ref(String(now.getFullYear()));
const selectedDeptIds = ref<number[]>([]);
const selectedTypeIds = ref<number[]>([]);
const customizeOpen = ref(false);
const reportContainerRef = ref<HTMLElement | null>(null);

const yearOptions = computed(() =>
  Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i).map((y) => ({
    id: String(y),
    name: String(y),
  })),
);
const deptOptions = computed(() =>
  (departmentsStore.departments || []).map((d: any) => ({ id: d.id, name: d.name })),
);
const typeOptions = computed(() =>
  (leavesStore.leavesData?.leavesTypes || []).map((lt: any) => ({ id: lt.id, name: lt.name })),
);

const widgetDefs = [
  { key: 'leavesByMonth',      component: markRaw(LeavesByMonth),     span: 'lg:col-span-8' },
  { key: 'pendingQueue',       component: markRaw(PendingQueue),      span: 'lg:col-span-4' },
  { key: 'leavesByDepartment', component: markRaw(LeavesByDepartment),span: 'lg:col-span-6' },
  { key: 'leaveTypeShare',     component: markRaw(LeaveTypeShare),    span: 'lg:col-span-6' },
  { key: 'topUsers',           component: markRaw(TopUsers),          span: 'lg:col-span-8' },
  { key: 'headcount',          component: markRaw(Headcount),         span: 'lg:col-span-4' },
];

const LS_KEY = 'reports.visibleWidgets';
const enabledWidgetKeys = ref<(string | number)[]>(widgetDefs.map((w) => w.key));

onMounted(() => {
  const saved = localStorage.getItem(LS_KEY);
  if (saved) {
    try {
      enabledWidgetKeys.value = JSON.parse(saved);
    } catch {}
  }
});

const widgetOptions = computed(() =>
  widgetDefs.map((w) => ({ id: w.key, name: t(`reports.widgets.${w.key}`) })),
);
const visibleWidgets = computed(() =>
  widgetDefs.filter((w) => enabledWidgetKeys.value.includes(w.key)),
);
const saveCustomization = () => {
  localStorage.setItem(LS_KEY, JSON.stringify(enabledWidgetKeys.value));
  customizeOpen.value = false;
};

const fetchData = () => {
  reportsStore.fetchSummary(
    Number(yearStr.value),
    selectedDeptIds.value.map(Number),
    selectedTypeIds.value.map(Number),
  );
};

watch([yearStr, selectedDeptIds, selectedTypeIds], fetchData, { immediate: true });

const exportPdf = async () => {
  if (!reportContainerRef.value) return;
  const html2pdf = (await import('html2pdf.js')).default;
  html2pdf()
    .from(reportContainerRef.value)
    .set({
      margin: 10,
      filename: `report-${yearStr.value}-${new Date().toISOString().slice(0, 10)}.pdf`,
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    })
    .save();
};
</script>

<style>
.min-h-dvh-64 {
  min-height: calc(100dvh - 66px);
}
</style>
```

### Step 7.8 — Widget components

Create each under `components/Reports/`. Minimal skeleton pattern — the executing agent can flesh out visuals. Example:

`components/Reports/LeavesByMonth.vue`:
```vue
<template>
  <div class="bg-white dark:bg-neutral-800 rounded-[10px] border border-[#DFEAF2] dark:border-neutral-700 p-[20px] h-full">
    <h4 class="text-[14px] font-bold text-black dark:text-white mb-[12px]">
      {{ $t('reports.widgets.leavesByMonth') }}
    </h4>
    <div v-if="loading" class="h-[200px] animate-pulse bg-gray-100 dark:bg-neutral-700 rounded" />
    <Bar v-else-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else class="text-[13px] text-gray-500 py-[20px] text-center">
      {{ $t('common.noData') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { ReportSummary } from '@/composables/reportsApiComposable';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const { t } = useI18n();
const props = defineProps({
  summary: { type: Object as PropType<ReportSummary | null>, default: null },
  loading: { type: Boolean, default: false },
});

const monthLabel = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });

const chartData = computed(() => {
  if (!props.summary?.by_month?.length) return null;
  return {
    labels: props.summary.by_month.map((r) => monthLabel(r.m)),
    datasets: [
      {
        label: t('reports.widgets.leaveDays'),
        data: props.summary.by_month.map((r) => Number(r.days)),
        backgroundColor: '#EA021A',
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};
</script>
```

Build sibling components with the same shell but different chart types:
- `LeavesByDepartment.vue` — horizontal `Bar` with `indexAxis: 'y'`, map `department_id` → name via `departmentsStore`.
- `LeaveTypeShare.vue` — `Doughnut` (register `ArcElement`), map `leave_type_id` → name via `leavesStore.leavesData.leavesTypes`.
- `TopUsers.vue` — simple ranked list using `SharedUserAvatar`, name, days badge.
- `PendingQueue.vue` — big number + subtitle.
- `Headcount.vue` — big number + subtitle.

### Step 7.9 — Locale keys

`en.json` additions:
```json
"common": {
  "reports": "Reports",
  "noData": "No data"
},
"reports": {
  "year": "Year",
  "departments": "Departments",
  "allDepartments": "All departments",
  "leaveTypes": "Leave types",
  "allLeaveTypes": "All leave types",
  "customize": "Customize",
  "selectWidgets": "Select widgets",
  "exportPdf": "Export PDF",
  "widgets": {
    "leavesByMonth": "Leaves by month",
    "leavesByDepartment": "Leaves by department",
    "leaveTypeShare": "Leave type share",
    "topUsers": "Top users by leave days",
    "pendingQueue": "Pending approvals",
    "headcount": "Active headcount",
    "leaveDays": "Leave days"
  }
},
"errors": {
  "reports": {
    "fetchFailed": "Could not load report data"
  }
}
```

Mirror in `el.json`.

---

## Post-implementation checklist

Per issue, manual smoke test in a browser:
- [ ] #1: Create + edit a leave type with "Monthly Pro-Rata" — saves without error
- [ ] #3: As head role, open `/yearly-leaves` → Record Leave button is absent; as admin/HR → present
- [ ] #8: On holidays page, click next year — network tab shows `year=2027`; moving holidays for that year appear
- [ ] #2: Send invite between admin and HR accounts, log out/in as receiver → sender name + avatar visible
- [ ] #5: Click delete on a user → modal renders with confirmation flow; icon sized consistently with Terminate button
- [ ] #4: AdminLeaveModal allows selecting multiple users; every date input uses flatpickr; EditUser workday pills toggle
- [ ] #9: Phone input shows flag, prefix, formats on type; saves in E.164
- [ ] #6: Upload document restricted to user → visible to that user only; restricted to role → visible to all users of that role; "all" → everyone
- [ ] #7: Reports tab appears for admin/HR only; widgets toggle via Customize; PDF export produces A4-landscape file with charts
- [ ] Both locales (en/el) and both color modes show clean UI

## Cross-cutting verification

- Run `npm run typecheck` (or `nuxt typecheck` — check `package.json`) after each issue. Fix any regressions before proceeding.
- Run existing test suite. No new tests required unless a test you touched breaks.
