# Modal Homogenization & EditLeaveType Revamp Plan

## Current State Analysis

### The Inconsistency Problem

There are two visually distinct "styles" of content that get mounted inside the same modal shell:

**Style A — "Form card" components** (EditUser, EditGroup, EditEntitlement):
Each component wraps itself in its own white rounded card:
```
bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800
```
This means inside the modal shell (`bg-white dark:bg-neutral-700 p-2 rounded-lg`),
you get **card inside card** — double padding, double background, double border radius.

**Style B — "Flat" components** (NewLeaves, EditLeaveType):
These use their own card-style wrappers with different conventions:
- `EditLeaveType`: `p-4 bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 shadow-sm max-w-2xl mx-auto mt-8`
- `NewLeaves`: `p-6 bg-white dark:bg-neutral-800 rounded-xl border dark:border-neutral-700 shadow-sm max-w-4xl mx-auto mt-6`

Both have header titles (`h2`) and "Cancel" buttons built into the component, which is
inconsistent with Style A components that have no title or cancel button.

### Modal Shell Inconsistencies (in the list components)

All 5 modal shells are nearly identical, differing only in:
- Which prop they pass to the inner component (`userId`, `groupId`, `entitlementId`, `leaveTypeId`)
- `LeavesTypesList` passes no `@saved` listener — the modal never closes on save
- `LeavesList`'s inner component receives **no props at all**
- `LeavesTypesList` has `newLeaveType()` that passes `selectedLeaveTypeId = null` but
  `EditLeaveType` has `leaveTypeId` as `required: true` — it will error on "Add" mode

### Non-modal instance of EditUser

`ProfileInfo.vue` uses `<EditUser :userId="userId" />` **inline** — not inside a modal.
This is an embedded form directly in the profile page. This instance must not be affected
by modal refactoring.

---

## Phase 1 — Create `BaseModal.vue`

**File:** `components/shared/BaseModal.vue`

This component is purely the shell — overlay, container, close button, optional title.
It uses a default slot for content. It does **not** impose any card styling on the content,
since the content components already provide their own padding and backgrounds.

```vue
<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-white dark:bg-neutral-700 rounded-lg w-full max-w-[900px] relative">
        <!-- Title bar (optional) -->
        <div v-if="title" class="flex items-center justify-between px-4 pt-4 pb-3 border-b dark:border-neutral-600">
          <h2 class="text-lg font-bold dark:text-gray-100">{{ title }}</h2>
          <button @click="$emit('update:modelValue', false)" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <CloseIcon />
          </button>
        </div>
        <!-- Close button when no title -->
        <button
          v-else
          @click="$emit('update:modelValue', false)"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <CloseIcon />
        </button>
        <!-- Content -->
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
});
defineEmits(['update:modelValue']);
</script>
```

Where `CloseIcon` is the same X SVG currently duplicated in every list component:
```html
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none"
     stroke="currentColor" class="hover:stroke-gray-500 dark:hover:stroke-gray-100 dark:stroke-gray-500">
  <path d="M1 16L16 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 16L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Extract this as an inline SVG or a tiny `CloseIcon.vue` in `components/shared/`.

> **`Teleport to="body"`**: Using Teleport avoids z-index stacking context issues since
> the list components use `<template>` root wrappers. This is especially important for
> `LeavesTypesList` and `GroupsList` which currently render the modal div _outside_
> the `<template v-else>` block anyway.

> **`v-model` (`modelValue`)**: Replaces the `showModal` ref in the parent. Clean two-way
> binding: parent sets it true to open, BaseModal emits false to close.

---

## Phase 2 — Normalize content components for modal use

The goal: content components should be **agnostic** about whether they are inside a modal
or rendered inline. They should render their form fields directly without an outer card
wrapper when used in a modal context.

### Strategy

Add an optional `asModal` prop (Boolean, default `false`) to each content component.
When `asModal` is true, the outer card div is stripped (just render the form fields +
action buttons). When false, the existing card wrapper renders as before.

This preserves the inline `ProfileInfo.vue` usage of `EditUser` unchanged.

**Components to update:**
- `EditUser.vue` — has outer `bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800` wrapper
- `EditGroup.vue` — same outer wrapper pattern
- `EditEntitlement.vue` — same outer wrapper pattern

**Components that are modal-only and have their own title/cancel (to be simplified):**
- `EditLeaveType.vue` — see Phase 4 for full revamp
- `NewLeaves.vue` — remove internal card wrapper, header h2, and Cancel button; these become
  the BaseModal's responsibility (title passed as prop, close handled by BaseModal)

### EditUser.vue change (minimal)

```vue
<template>
  <div :class="asModal ? '' : 'bg-white rounded-lg duration-300 p-4 flex-1 flex flex-col dark:bg-neutral-800 dark:text-gray-100'">
    <!-- existing internals unchanged -->
  </div>
</template>

<script setup>
defineProps({
  userId: { type: [Number, String, null], required: false },
  asModal: { type: Boolean, default: false },
});
```

Apply the same `asModal` pattern to `EditGroup.vue` and `EditEntitlement.vue`.

### NewLeaves.vue change

Remove: outer card div (`p-6 bg-white ...`), the `h2` title, and the cancel `<button>`.
The modal title will be passed via BaseModal's `title` prop. The cancel action will be
provided by BaseModal's close button. Keep the `@cancel` emit for cases where the component
is used outside a modal (there are none currently, but defensive).

> If NewLeaves is never used outside a modal, the cancel button removal is safe.
> Verify with grep before removing.

---

## Phase 3 — Refactor list components to use BaseModal

For each of the 5 list components, replace the inline modal block with BaseModal.

### Pattern (applies to all)

**Before** (repeated in every list component):
```html
<div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="closeModal">
  <div class="bg-white dark:bg-neutral-700 p-2 rounded-lg w-full max-w-[900px] relative">
    <button @click="closeModal" class="absolute top-3 right-3 ...">...</button>
    <component :is="modalComponent" :userId="selectedUserId" @saved="closeModal" />
  </div>
</div>
```

**After**:
```html
<BaseModal v-model="showModal">
  <component :is="modalComponent" :userId="selectedUserId" asModal @saved="showModal = false" />
</BaseModal>
```

**Changes per file:**

| File | Current prop passed | `@saved` wired? | Notes |
|------|--------------------|----|-------|
| `UsersList.vue` | `:userId="selectedUserId"` | Yes | Add `asModal` prop |
| `GroupsList.vue` | `:groupId="selectedGroupId"` | Yes | Add `asModal` prop |
| `EntitlementDays.vue` | `:entitlementId="selectedEntitlementId"` | Yes | Add `asModal` prop |
| `LeavesTypesList.vue` | `:leaveTypeId="selectedLeaveTypeId"` | **No — bug** | Fix: wire `@saved="showModal = false"` |
| `LeavesList.vue` | none | No | See note below |

**LeavesList fix**: The modal component currently receives no props and no `@saved` handler.
The inner `NewLeaves` component emits `saved` — wire it: `@saved="showModal = false"`.

**`closeModal` cleanup**: Each list component has a `closeModal` function that resets
`showModal`, `selectedId`, and `modalType`. This function can stay as-is; just also
use `showModal = false` inline in BaseModal's `@update:modelValue` event or use the
`closeModal` function as the v-model setter:
```js
// In script
const showModal = ref(false);
// v-model on BaseModal automatically calls showModal = false on close
// But closeModal also resets selectedId and modalType, so keep the function
// and pass it:
<BaseModal :modelValue="showModal" @update:modelValue="val => { if (!val) closeModal(); }">
```

**Simpler approach**: keep `showModal` as a ref, use `@update:modelValue` to call the
existing `closeModal()`. This way all the cleanup logic stays in one place.

---

## Phase 4 — EditLeaveType Full Revamp (Add + Edit, No Delete)

### Current Problems

1. `EditLeaveType.vue` has `leaveTypeId` as `required: true` — it crashes in "Add" mode
   (`newLeaveType()` passes `null`).
2. `LeavesTypesList.vue::modalComponent` returns `EditLeaveType` for both `'edit'` case —
   the switch `return modalType.value === 'edit' ? EditLeaveType : EditLeaveType` is a copy-paste
   bug (both branches are identical).
3. The delete action (`deleteLeaveType()`) exists in `LeavesTypesList` but has no corresponding
   delete component — and per requirements, deletion should be **removed entirely** since it
   would orphan entitled days and leave history.
4. Styling divergence: `EditLeaveType` uses `border dark:border-neutral-700 shadow-sm max-w-2xl
   mx-auto mt-8` inside the modal — the `max-w-2xl mx-auto mt-8` causes misalignment inside
   the already-constrained `max-w-[900px]` modal container.

### Revamp Plan

#### 4a — Rename and update `EditLeaveType.vue`

The component handles both Add and Edit — the internal title hardcodes `"editLeaveType"` key.
Fix the title to be conditional:

```vue
<h2> {{ leaveTypeId ? $t('settings.editLeaveType') : $t('settings.addLeaveType') }} </h2>
```

Change `leaveTypeId` prop to not be required (same pattern as other components):
```js
defineProps({
  leaveTypeId: { type: [Number, String, null], required: false },
});
```

When `leaveTypeId` is null/undefined → Add mode: `onMounted` skips the lookup,
form starts empty, save calls `leavesStore.createLeaveType(name)` (new store action).
When `leaveTypeId` is provided → Edit mode: existing behavior unchanged.

Remove the outer card wrapper (apply `asModal` pattern same as Phase 2), or since
`EditLeaveType` is **only ever used in a modal**, strip the wrapper entirely and just
render the form fields directly (simpler — no `asModal` prop needed).

Also remove the internal Cancel button — BaseModal's close button handles that.
Keep the `cancel` emit for defensive compat but stop rendering the button.

#### 4b — Add `createLeaveType` store action

In `leavesStore`, add:
```js
async function createLeaveType(name) {
    // calls POST /api/new_leave_type via composable
    await leavesApiComposable.newLeaveType(name);
    await fetchLeaveTypes(); // refresh
}
```

Check `leavesStore` and the corresponding composable/server route to verify the
`new_leave_type` endpoint is already wired — per `API_REPORT.md` it is:
`POST /api/new_leave_type` requires `leave_type_name`.

#### 4c — Update `LeavesTypesList.vue`

1. Remove `deleteLeaveType()` function and anything referencing `modalType === 'delete'`.
2. Remove the delete button from the list row (currently not rendered — the row only has
   "Edit Leave Type" link, so the delete button may already be absent in the template,
   but the `deleteLeaveType` function and `modalType = 'delete'` code should be cleaned up).
3. Fix `modalComponent` computed — currently `EditLeaveType : EditLeaveType` (no-op).
   Simplify: since there's now only one modal component, remove the computed entirely and
   use `EditLeaveType` directly in the template.
4. Add `@saved="showModal = false"` (currently missing — **modal never closes on save**).
5. Wire BaseModal.

#### 4d — i18n

Ensure `settings.addLeaveType` key exists in all locale files (it's already used as the
button label in `LeavesTypesList`, so it likely exists — but the modal title may use a
different key, verify).

---

## Phase 5 — Verify Non-Modal EditUser Instance

`ProfileInfo.vue` renders `<EditUser :userId="userId" />` inline — no `asModal` prop.
Since `asModal` defaults to `false`, the outer card wrapper renders as before.
**No change needed in `ProfileInfo.vue`.**

Verify there are no other inline usages of `EditGroup` or `EditEntitlement` before
removing their wrappers in Phase 2. Based on current grep results, both are only used
inside their respective list components' modals.

---

## Execution Order

1. Create `components/shared/BaseModal.vue` (new file)
2. Update `EditUser.vue`, `EditGroup.vue`, `EditEntitlement.vue` — add `asModal` prop
3. Revamp `EditLeaveType.vue` — remove required constraint, add/edit mode, strip card wrapper
4. Add `createLeaveType` store action in `leavesStore`
5. Update `NewLeaves.vue` — strip internal card wrapper and header
6. Refactor `UsersList.vue` — use BaseModal
7. Refactor `GroupsList.vue` — use BaseModal
8. Refactor `EntitlementDays.vue` — use BaseModal
9. Refactor `LeavesTypesList.vue` — use BaseModal, fix `@saved` bug, remove delete logic
10. Refactor `LeavesList.vue` — use BaseModal, wire `@saved`

---

## Files Touched Summary

| File | Action |
|------|--------|
| `components/shared/BaseModal.vue` | **Create** |
| `components/shared/CloseIcon.vue` | **Create** (optional — can be inline SVG in BaseModal) |
| `components/Settings/EditUser.vue` | Add `asModal` prop, conditional wrapper class |
| `components/Settings/EditGroup.vue` | Add `asModal` prop, conditional wrapper class |
| `components/Settings/EditEntitlement.vue` | Add `asModal` prop, conditional wrapper class |
| `components/Settings/EditLeaveType.vue` | Remove `required`, add/edit mode, strip card, remove cancel button |
| `components/Settings/NewLeaves.vue` | Strip outer card, h2 title, cancel button |
| `components/Settings/UsersList.vue` | Replace inline modal block with `<BaseModal>` |
| `components/Settings/GroupsList.vue` | Replace inline modal block with `<BaseModal>` |
| `components/Settings/EntitlementDays.vue` | Replace inline modal block with `<BaseModal>` |
| `components/Settings/LeavesTypesList.vue` | Replace inline modal block, fix `@saved`, remove delete code |
| `components/Settings/LeavesList.vue` | Replace inline modal block, wire `@saved` |
| `stores/leavesStore` (or equivalent) | Add `createLeaveType` action |

**Not touched:** `components/Home/ProfileInfo.vue`, `pages/settings.vue`
