# Store & Component Reactivity — Implementation Plan

## 1. Problem Statement

Mutations (edit group, edit user, delete entitlement) complete successfully against the Laravel backend but the Settings UI does not reflect the change until a full page refresh. The root causes are distinct per area and documented below before the fixes.

---

## 2. Root Cause Analysis

### 2.1 GroupsList — Removed user still appears in the group

**Flow when "Edit Group → remove user → Save" is triggered:**
1. `EditGroup.submitForm()` → `departmentsStore.editDepartment()`
2. `editDepartment()` calls `editDepartmentComposable()`, then on success calls `getAll()`
3. `getAll()` re-fetches `/api/departments/getAll` and updates `departmentsData.value` ✓

**Why it still shows the old user:**
`GroupsList.filteredGroups` computes group membership by matching `user?.department.id === department.id` — it reads from **`userStore.allUsers`**, not from the department's own user array. After `editDepartment`, `userStore.allUsers` is **never refreshed**. The user objects inside `allUsers` still carry their old `department.id`, so the user still appears under their previous group.

```
// GroupsList.vue:401 — the bug
users: [...filteredUsers.value.filter(user => user?.department.id === department.id)]
//                                                   ↑ stale, never re-fetched
```

**Fix:** After any department mutation, `userStore.getAllUsers()` must also be called.

---

### 2.2 Modal never closes after a successful save

#### GroupsList / EditGroup
`EditGroup.vue` already defines and fires `emit('saved')` at line 175. However `GroupsList.vue` mounts the component as:
```html
<component :is="modalComponent" :groupId="selectedGroupId" />
```
There is no `@saved="closeModal"` listener — the event is emitted into the void.

#### UsersList / EditUser
`EditUser.vue` has **no `emit` defined at all**. After `userStore.editUser()` succeeds and the toast appears, nothing tells the parent to close the modal.

#### EntitlementDays / EditEntitlement
`EditEntitlement.vue` also has **no `emit` defined**. After `entitlementStore.updateEntitledDaysForUser()` / `addEntitledDays()` succeeds and the toast appears, the modal stays open.

#### EntitlementDays / DeleteEntitlement
Same issue — no emit, parent doesn't close.

---

### 2.3 EntitlementDays toggle watcher is broken

```js
// EntitlementDays.vue:369 — broken
watch(toggledUsers.value, async (newToggledUsers) => { ... })
```

`toggledUsers` is a `ref({ })`. `toggledUsers.value` is the raw plain object. Vue's `watch()` on a plain object (not a `ref` or `reactive`) does not create a deep reactive subscription. When `toggledUsers.value[userId] = true` is assigned, the watcher may not fire, meaning `entitlementStore.getEntitledDaysForUser(userId)` is never called and the expanded row shows empty data.

---

### 2.4 User edit does not refresh department display

`userStore.editUser()` calls `getAllUsers()` (for other-user edits) — users are refreshed ✓.
But `departmentsStore.departmentsData` is **not refreshed**. If a user is moved to a different department, the GroupsList view reads stale `departmentsData` for the old grouping until the next navigation.

This is the mirror of 2.1 — both sides of the user↔department relationship need refreshing whenever either changes.

---

### 2.5 EntitlementDays does not re-fetch after modal close

After an edit/delete entitlement action completes and the modal eventually closes (once we fix 2.2), the expanded user row is still showing the old data. `entitlementStore.getEntitledDaysForUser(userId, true)` **is** called inside the store mutation — this is correct. But the `EntitlementDays` component doesn't know which `userId` was affected when the modal closes, so it can't guarantee the relevant row is re-rendered.

The store data **is** updated correctly. The display problem is that the `getFilteredEntitlements` computed reads from `entitledDaysData.savedUsers[userId]` — once the store updates that key, Vue reactivity should propagate. This will work once the watcher bug (2.3) is fixed and the `forceRefresh = true` path in the store runs correctly. **No additional component changes needed here beyond the watcher fix and the modal emit/close fix.**

---

## 3. Solution Architecture

The fix is applied at three layers:

| Layer | What changes | Why |
|---|---|---|
| **Stores** | `departments.ts` cross-refreshes `userStore`; `user.ts` cross-refreshes `departmentsStore` | Keeps mutation logic self-contained; components don't have to orchestrate multi-store refreshes |
| **Edit components** | Add `emit('saved')` to `EditGroup`, `EditUser`, `EditEntitlement`, `DeleteEntitlement` | Enables parent to react to a completed save without tight coupling |
| **List components** | Add `@saved="closeModal"` to dynamic `<component>` in `GroupsList`, `UsersList`, `EntitlementDays` | Closes modal and (where needed) triggers any follow-up UI refresh |

---

## 4. Store Changes

### 4.1 `stores/departments.ts`

**Import `useUserStore`** at the top (same pattern already used in `stores/leaves.ts`):
```ts
import { useUserStore } from '@/stores/user';
```

**Inside the store setup function**, get the user store instance:
```ts
const userStore = useUserStore();
```

**In `editDepartment()`**: after `getAll()` succeeds, call `userStore.getAllUsers()`:
```ts
async function editDepartment(...) {
    try {
        const result = await editDepartmentComposable({ groupId, groupName, head, members });
        if (result) {
            await getAll();
            await userStore.getAllUsers(); // ← ADD THIS
        }
    } catch (err) { ... }
}
```

**In `newDepartment()`**: same addition after `getAll()`:
```ts
if (result) {
    await getAll();
    await userStore.getAllUsers(); // ← ADD THIS
}
```

**In `deleteDepartment()`**: same:
```ts
if (result) {
    await getAll();
    await userStore.getAllUsers(); // ← ADD THIS
}
```

**Why this is safe:** `useUserStore()` inside a Pinia setup store returns the same singleton instance. There is no circular dependency: `departments.ts` imports `user.ts`, and `user.ts` does not import `departments.ts` currently.

---

### 4.2 `stores/user.ts`

**Import `useDepartmentsStore`**:
```ts
import { useDepartmentsStore } from '@/stores/departments';
```

**Inside setup**, get the instance:
```ts
const departmentsStore = useDepartmentsStore();
```

**In `editUser()`**: after any successful edit, also refresh departments. The user may have changed department, which makes `departmentsData` stale:
```ts
if (result) {
    if (result.errors) { throw new Error(); }
    if (targetUserId === userId.value) {
        await loadUserProfile();
    } else {
        await getAllUsers();
    }
    await departmentsStore.getAll(); // ← ADD THIS
}
```

**Why `getAll()` and not `init()`:** `init()` has a guard (`if (!departmentsData.value.length)`) that skips the fetch if data already exists. `getAll()` always fetches fresh data.

---

## 5. Edit Component Changes

### 5.1 `components/Settings/EditGroup.vue`

No change needed — `emit('saved')` already exists at line 85 and is called at line 175 after a successful `departmentsStore.newDepartment()` or `editDepartment()`. The fix is entirely in the parent (`GroupsList`).

---

### 5.2 `components/Settings/EditUser.vue`

Add emit definition at the top of `<script setup>`:
```ts
const emit = defineEmits(['saved']);
```

In `submitForm()`, after the success toast:
```ts
$toast.success(t('settings.profileUpdated'), { ... });
emit('saved'); // ← ADD THIS
```

The emit must be called **inside the `try` block, after the success toast**, and **not** in the `catch` block.

---

### 5.3 `components/Settings/EditEntitlement.vue`

Add emit definition:
```ts
const emit = defineEmits(['saved']);
```

In `submitForm()`, after each success toast branch:
```ts
// Edit path:
$toast.success(t('settings.leaveUpdated'), { ... });
emit('saved'); // ← ADD

// New path:
$toast.success(t('settings.leaveAdded'), { ... });
emit('saved'); // ← ADD
```

---

### 5.4 `components/Settings/DeleteEntitlement.vue`

Add emit definition:
```ts
const emit = defineEmits(['saved']);
```

After the delete operation succeeds and toast fires:
```ts
emit('saved'); // ← ADD
```

---

## 6. List Component Changes

### 6.1 `components/Settings/GroupsList.vue`

**Add `@saved` listener on the dynamic component** (line 281):
```html
<!-- Before -->
<component :is="modalComponent" :groupId="selectedGroupId" />

<!-- After -->
<component :is="modalComponent" :groupId="selectedGroupId" @saved="closeModal" />
```

That's all. `closeModal()` already exists and correctly sets `showModal.value = false` and clears `selectedGroupId`. The list will automatically re-render because:
- `departmentsStore.editDepartment()` called `getAll()` → `departmentsData` updated ✓
- Now also calls `userStore.getAllUsers()` → `allUsers` updated ✓
- `filteredGroups` computed depends on both → re-evaluates ✓

---

### 6.2 `components/Settings/UsersList.vue`

**Add `@saved` listener on the dynamic component** (line 275):
```html
<!-- Before -->
<component :is="modalComponent" :userId="selectedUserId" />

<!-- After -->
<component :is="modalComponent" :userId="selectedUserId" @saved="closeModal" />
```

The list will automatically re-render because:
- `userStore.editUser()` calls `getAllUsers()` → `userStore.allUsers` updated ✓
- `UsersList`'s `watch(() => userStore.allUsers, ...)` fires → `allUsers` ref updated ✓
- `filteredUsers` computed re-evaluates ✓

---

### 6.3 `components/Settings/EntitlementDays.vue`

#### Fix 1: Broken toggle watcher (line 369)

```ts
// Before — watches plain object, unreliable
watch(toggledUsers.value, async (newToggledUsers) => {
    ...
});

// After — watches the ref with deep option
watch(toggledUsers, async (newToggledUsers) => {
    const usersToFetch = Object.keys(newToggledUsers.value);
    for (const userId of usersToFetch) {
        await entitlementStore.getEntitledDaysForUser(userId);
    }
}, { deep: true });
```

Note: Inside the callback, access `newToggledUsers.value` (it's the new ref value object) OR restructure to watch `() => toggledUsers.value` with `{ deep: true }` — both are equivalent:
```ts
watch(() => toggledUsers.value, async (newToggledUsers) => {
    const usersToFetch = Object.keys(newToggledUsers);
    for (const userId of usersToFetch) {
        await entitlementStore.getEntitledDaysForUser(userId);
    }
}, { deep: true });
```

#### Fix 2: Add `@saved` and re-fetch on modal close

The modal close needs to know which user's entitlements to re-fetch. Add a `selectedUserId` tracking mechanism — when opening an entitlement edit/delete, find the user that owns that entitlement and store them:

```ts
// New ref to track which user owns the open entitlement
const selectedEntitlementUserId = ref<string | number | null>(null);
```

In `editEntitlement()` and `deleteEntitlement()`, also set the user ID:
```ts
const editEntitlement = (entitlementId) => {
    selectedEntitlementId.value = entitlementId;
    // Find which user owns this entitlement from the cached store data
    const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers)
        .flatMap(Object.values)
        .flat();
    const target = allEntitlements.find(e => e.id === entitlementId);
    selectedEntitlementUserId.value = target?.user_id ?? null;
    modalType.value = 'edit';
    showModal.value = true;
};

const deleteEntitlement = (entitlementId) => {
    selectedEntitlementId.value = entitlementId;
    const allEntitlements = Object.values(entitlementStore.entitledDaysData.savedUsers)
        .flatMap(Object.values)
        .flat();
    const target = allEntitlements.find(e => e.id === entitlementId);
    selectedEntitlementUserId.value = target?.user_id ?? null;
    modalType.value = '';
    showModal.value = true;
};
```

Update `closeModal()` to force-refresh the affected user's entitlements:
```ts
const closeModal = async () => {
    showModal.value = false;
    // If the user's row is still toggled open, force a re-fetch so the row reflects the change
    if (selectedEntitlementUserId.value && toggledUsers.value[selectedEntitlementUserId.value]) {
        await entitlementStore.getEntitledDaysForUser(selectedEntitlementUserId.value, true);
    }
    selectedEntitlementId.value = null;
    selectedEntitlementUserId.value = null;
};
```

Add `@saved` to the dynamic component:
```html
<component :is="modalComponent" :entitlementId="selectedEntitlementId" @saved="closeModal" />
```

---

## 7. Change Summary by File

| File | Change Type | Description |
|---|---|---|
| `stores/departments.ts` | Modify | Import `useUserStore`; call `userStore.getAllUsers()` after `editDepartment`, `newDepartment`, `deleteDepartment` |
| `stores/user.ts` | Modify | Import `useDepartmentsStore`; call `departmentsStore.getAll()` after `editUser` success |
| `components/Settings/EditUser.vue` | Modify | Add `defineEmits(['saved'])`; call `emit('saved')` after success toast |
| `components/Settings/EditEntitlement.vue` | Modify | Add `defineEmits(['saved'])`; call `emit('saved')` after both success paths |
| `components/Settings/DeleteEntitlement.vue` | Modify | Add `defineEmits(['saved'])`; call `emit('saved')` after success |
| `components/Settings/GroupsList.vue` | Modify | Add `@saved="closeModal"` to `<component>` |
| `components/Settings/UsersList.vue` | Modify | Add `@saved="closeModal"` to `<component>` |
| `components/Settings/EntitlementDays.vue` | Modify | Fix toggle watcher (deep); add `selectedEntitlementUserId` tracking; update `closeModal` to force-refresh; add `@saved="closeModal"` to `<component>` |
| `components/Settings/EditGroup.vue` | No change | Already emits `'saved'` correctly |

---

## 8. Reactivity Flow After Fix

### Group edit (remove a user)

```
EditGroup.submitForm()
  → departmentsStore.editDepartment()
      → editDepartmentComposable()    [API call]
      → departmentsStore.getAll()     [refreshes departmentsData]
      → userStore.getAllUsers()        [refreshes allUsers ← NEW]
  → emit('saved')
GroupsList receives @saved
  → closeModal()
GroupsList.filteredGroups recomputes:
  - departmentsData updated ✓
  - allUsers updated (user has new department.id) ✓
  - removed user no longer matches old department → disappears from list ✓
```

### User edit

```
EditUser.submitForm()
  → userStore.editUser()
      → editUserComposable()          [API call]
      → userStore.getAllUsers()        [refreshes allUsers]
      → departmentsStore.getAll()     [refreshes departmentsData ← NEW]
  → emit('saved')                     [← NEW]
UsersList receives @saved
  → closeModal()
UsersList.watch(userStore.allUsers) fires → allUsers ref updated
UsersList.filteredUsers recomputes ✓
```

### Entitlement edit/delete

```
EditEntitlement.submitForm()
  → entitlementStore.updateEntitledDaysForUser()
      → updateEntitledDaysForUserComposable()  [API call]
      → entitlementStore.getEntitledDaysForUser(userId, true)  [re-fetches ← already existed]
  → emit('saved')   [← NEW]
EntitlementDays receives @saved
  → closeModal()
      → entitlementStore.getEntitledDaysForUser(selectedEntitlementUserId, true) [← NEW guard]
EntitlementDays.getFilteredEntitlements recomputes from updated store data ✓
```

---

## 9. Risks & Edge Cases

| Scenario | Risk | Mitigation |
|---|---|---|
| `userStore.getAllUsers()` fails inside `departments.ts` | Department edit succeeds but user list stale | Wrap in its own try/catch; log the error; don't let it propagate to the parent mutation's catch block |
| `departmentsStore.getAll()` fails inside `user.ts` | User edit succeeds but department list stale | Same — isolate the refresh call in its own try/catch |
| User row in EntitlementDays is toggled closed when modal saves | `closeModal` guard `toggledUsers.value[userId]` is falsy | Guard already prevents unnecessary API call; no action needed |
| Multiple users selected in new entitlement (mass add) | `selectedEntitlementUserId` is a single ref | For new entitlements (no `entitlementId`), `closeModal` can skip the re-fetch — the rows will re-fetch when toggled next time. The new entitlement watcher fires when the user opens the row. OR: after new-entitlement save, clear cache for all `formUserIds` and re-fetch each toggled user (more complex, optional) |
| Circular store dependency warning from Pinia | `departments` → `user` AND `user` → `departments` | Pinia setup stores resolve lazily; both stores are singletons. This is the same pattern already used in `leaves.ts` (which imports `userStore`). No actual circular dependency at import time because both files import from separate paths |

---

## 10. Implementation Checklist

### Stores
- [ ] `departments.ts`: import `useUserStore`
- [ ] `departments.ts`: `editDepartment` — add `await userStore.getAllUsers()` after `getAll()`
- [ ] `departments.ts`: `newDepartment` — same addition
- [ ] `departments.ts`: `deleteDepartment` — same addition
- [ ] `departments.ts`: wrap each `userStore.getAllUsers()` call in its own try/catch
- [ ] `user.ts`: import `useDepartmentsStore`
- [ ] `user.ts`: `editUser` — add `await departmentsStore.getAll()` after the existing refresh branch
- [ ] `user.ts`: wrap `departmentsStore.getAll()` in its own try/catch

### Edit Components
- [ ] `EditUser.vue`: add `defineEmits(['saved'])`
- [ ] `EditUser.vue`: add `emit('saved')` after success toast in `submitForm`
- [ ] `EditEntitlement.vue`: add `defineEmits(['saved'])`
- [ ] `EditEntitlement.vue`: add `emit('saved')` after edit-path success toast
- [ ] `EditEntitlement.vue`: add `emit('saved')` after new-path success toast
- [ ] `DeleteEntitlement.vue`: add `defineEmits(['saved'])`
- [ ] `DeleteEntitlement.vue`: add `emit('saved')` after delete success

### List Components
- [ ] `GroupsList.vue`: add `@saved="closeModal"` to `<component :is="modalComponent">`
- [ ] `UsersList.vue`: add `@saved="closeModal"` to `<component :is="modalComponent">`
- [ ] `EntitlementDays.vue`: fix toggle watcher to use `watch(() => toggledUsers.value, ..., { deep: true })`
- [ ] `EntitlementDays.vue`: add `selectedEntitlementUserId` ref
- [ ] `EntitlementDays.vue`: populate `selectedEntitlementUserId` in `editEntitlement()` and `deleteEntitlement()`
- [ ] `EntitlementDays.vue`: update `closeModal()` to force-refresh affected user's entitlements
- [ ] `EntitlementDays.vue`: add `@saved="closeModal"` to `<component :is="modalComponent">`

### Verify
- [ ] Edit group → remove user → save → modal closes → user gone from group ← primary bug
- [ ] Edit group → add user → save → modal closes → user appears in group
- [ ] New group → save → modal closes → group appears in list
- [ ] Delete group → confirm → modal closes → group gone from list
- [ ] Edit user → change department → save → modal closes → user appears in new group in GroupsList
- [ ] Edit entitlement → save → modal closes → updated value shows in expanded row
- [ ] Delete entitlement → confirm → modal closes → row removed from expanded list
- [ ] New entitlement → save → modal closes
- [ ] Toggle open a user in EntitlementDays → entitlements load (watcher fix)
- [ ] Navigate away from Settings and back → data is current (existing `getAll()` calls handle this)
