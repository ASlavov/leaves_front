# Entitlement Bulk Add – Fix Plan

## Root Cause

There are **two separate code paths** for adding entitlement days, and they behave differently:

| Condition              | Frontend path                               | Nuxt route                         | Backend method                             | Behaviour                                 |
| ---------------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------- |
| `userIds.length === 1` | `addEntitledDaysForUserComposable`          | `POST /api/entitlement/add`        | `store()` → `updateOrCreate()`             | ✅ Correctly replaces existing record     |
| `userIds.length > 1`   | `addEntitledDaysForMultipleUsersComposable` | `POST /api/entitlement/massLeaves` | `importMassLeaves()` → `create()` per user | ❌ **Attempts to create a new duplicate** |

The split is in `stores/entitlement.ts` line 137:

```typescript
if (userIds.length > 1) {
    await addEntitledDaysForMultipleUsersComposable({ ... });  // broken path
} else {
    await addEntitledDaysForUserComposable({ ... });           // working path
}
```

### What the backend does

**`store()` (single-user, works):**

```php
EntitlementDay::updateOrCreate(
    ['user_id' => ..., 'leave_type_id' => ..., 'year' => ...],
    ['entitled_days' => ..., 'remaining_days' => ..., ...]
);
```

**`importMassLeaves()` (multi-user, broken):**

```php
foreach ($userIds as $userId) {
    EntitlementDay::create([   // ← plain create, no upsert
        'user_id' => $userId, ...
    ]);
}
```

When a user already has an entitlement for the same `(user_id, leave_type_id, year)` tuple:

- The **single path** silently updates it (correct, matches the UI warning).
- The **bulk path** tries to create a second record. Depending on database constraints, this either creates a corrupt duplicate row or throws a 500 error.

The tooltip that reads _"If the user already has entitled days for this year, they will be replaced"_ is therefore **only true when adding for a single person**.

---

## Scope

Triggered whenever the admin selects **2 or more employees** in the "Add Entitlement Days" modal and presses Save.
The `massRemote` endpoint (`importWorkfromhome()`) likely has the same pattern and should be audited at the same time.

---

## Fix

### Primary Fix — Backend (1 file, ~10 lines)

**File:** `intelligence-back/app/Http/Controllers/Api/LeaveEntitlementController.php`

Replace the `foreach` loop inside `importMassLeaves()` so each iteration uses `updateOrCreate()` with the same lookup key as `store()`:

```php
// BEFORE
foreach ($userIds as $userId) {
    EntitlementDay::create([
        'user_id'       => $userId,
        'leave_type_id' => $leaveTypeId,
        'entitled_days' => $entitled_days,
        'remaining_days'=> $entitled_days,
        'year'          => $year,
        'start_from'    => $startDate,
        'end_to'        => $endDate
    ]);
}

// AFTER
foreach ($userIds as $userId) {
    EntitlementDay::updateOrCreate(
        [
            'user_id'       => $userId,
            'leave_type_id' => $leaveTypeId,
            'year'          => $year,
        ],
        [
            'entitled_days' => $entitled_days,
            'remaining_days'=> $entitled_days,
            'start_from'    => $startDate,
            'end_to'        => $endDate
        ]
    );
}
```

This makes the bulk path behave identically to the single-user path: existing records are overwritten, new records are created.

### Secondary Fix — Audit `importWorkfromhome()`

Open `importWorkfromhome()` in the same controller and verify it also uses `updateOrCreate()` rather than `create()`. Apply the same change if it does not.

---

## Optional: UX Improvement (Not Blocking)

The current UI shows a static tooltip warning on the _Entitled Days_ label. A more helpful flow would be:

1. When the admin fills in the form and presses **Save**, before calling the API, the frontend checks `entitledDaysData.savedUsers` in the Pinia store to count how many of the selected users already have an entitlement for the chosen `(leave_type_id, year)` combination.
2. If the count is > 0, show an inline confirmation message: _"X employee(s) already have entitlement for this leave type this year. Their records will be replaced. Continue?"_
3. Only proceed if confirmed.

This is purely additive — it requires no backend changes and improves admin confidence.
**Recommended to implement as a follow-up after the backend fix is verified.**

---

## Files to Change

| File                                                   | Change                                                         | Priority     |
| ------------------------------------------------------ | -------------------------------------------------------------- | ------------ |
| `intelligence-back/.../LeaveEntitlementController.php` | Change `create()` → `updateOrCreate()` in `importMassLeaves()` | **Required** |
| `intelligence-back/.../LeaveEntitlementController.php` | Same audit for `importWorkfromhome()`                          | **Required** |
| `components/Settings/EditEntitlement.vue`              | Optional UX confirmation step                                  | Optional     |

No frontend store or composable changes are needed for the primary fix.

---

## What Does NOT Need Changing

- `stores/entitlement.ts` — the `userIds.length > 1` routing logic is fine; the two endpoints can remain separate.
- `composables/entitlementApiComposable.ts` — no change needed.
- `server/api/entitlement/massLeaves.ts` — the Nuxt proxy route is correct; the bug is entirely in the Laravel controller.
- The single-user path already works correctly.
