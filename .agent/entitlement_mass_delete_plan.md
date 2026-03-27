# Entitlement Mass Delete — Implementation Plan

## Problem Statement

HR assigns entitlement wallets in bulk. If they pick the wrong leave type (or wrong year), they need a way to undo that entire batch without going through each employee one by one.

---

## Design Decisions

### What can be mass-deleted?
Wallets filtered by **leave type + year**, optionally scoped to a subset of employees. The selector defaults to "all employees" to match the mass-add workflow.

### What about wallets where days have already been used?
`remaining_days < entitled_days` means an employee already submitted a leave that deducted from this wallet. Two sub-cases:
- **Pending/approved leave exists** — deleting the wallet orphans the deduction record (`entitlement_id` goes `null`) and makes the leave un-restorable if later rejected.
- **Leave has been taken** — deleting the wallet is an accounting discrepancy.

**Decision:** Delete only "clean" wallets by default. Wallets where any days have been consumed are **blocked** and shown to HR with the employee name and days used. HR can override with a force-delete checkbox after reading the warning, accepting the data consequence.

### Dry-run first
The frontend calls the endpoint with `dry_run: true` before showing the confirmation step. This gives HR an exact preview ("47 wallets will be deleted, 3 are blocked") without touching data.

---

## Backend

### 1. New method: `massDestroy()` in `LeaveEntitlementController`

```php
public function massDestroy(Request $request)
{
    $validator = Validator::make($request->all(), [
        'leave_type_id' => 'required|exists:leaves_types,id',
        'year'          => 'required|integer|digits:4',
        'user_ids'      => 'nullable|array',
        'user_ids.*'    => 'nullable|exists:users,id',
        'dry_run'       => 'nullable|boolean',
        'force'         => 'nullable|boolean',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $query = EntitlementDay::with('user')
        ->where('leave_type_id', $request->leave_type_id)
        ->where('year', $request->year);

    if ($request->filled('user_ids')) {
        $query->whereIn('user_id', $request->user_ids);
    }

    $wallets = $query->get();

    // Split into safe (untouched) vs blocked (days have been consumed)
    $safe    = $wallets->filter(fn($w) => $w->remaining_days == $w->entitled_days);
    $blocked = $wallets->filter(fn($w) => $w->remaining_days <  $w->entitled_days);

    // Dry run — return preview without touching data
    if ($request->boolean('dry_run')) {
        return response()->json([
            'safe_count'    => $safe->count(),
            'blocked_count' => $blocked->count(),
            'blocked_users' => $blocked->map(fn($w) => [
                'user_id'     => $w->user_id,
                'user_name'   => $w->user?->name,
                'days_used'   => $w->entitled_days - $w->remaining_days,
            ])->values(),
        ]);
    }

    // Actual delete
    $toDelete = $request->boolean('force')
        ? $wallets
        : $safe;

    $toDelete->each->delete();

    return response()->json([
        'deleted' => $toDelete->count(),
        'skipped' => $request->boolean('force') ? 0 : $blocked->count(),
    ]);
}
```

### 2. Register the route in `routes/api.php`

```php
Route::post('mass-delete-entitlements', [LeaveEntitlementController::class, 'massDestroy']);
```

### 3. Ensure `EntitlementDay` model has a `user()` relationship

```php
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

---

## Nuxt Server Layer

### 4. Add config key in `nuxt.config.ts`

```ts
entitlement: {
    // ... existing keys
    massDelete: '/mass-delete-entitlements',
},
```

### 5. New server route: `server/api/entitlement/massDelete.ts`

```ts
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
    const { token } = event.context;

    if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

    const { leaveTypeId, year, userIds, dryRun, force } = body;

    try {
        return await $fetch(`${config.public.apiBase}${config.public.entitlement.massDelete}`, {
            method: 'POST',
            body: {
                leave_type_id: leaveTypeId,
                year,
                user_ids: userIds?.length ? userIds : undefined,
                dry_run: dryRun ?? true,
                force:   force  ?? false,
            },
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: 'Error deleting entitlements' });
    }
});
```

---

## Frontend

### 6. New composable function in `composables/entitlementApiComposable.ts`

```ts
export const massDeleteEntitlementsComposable = (body: {
    leaveTypeId: string | number;
    year: number;
    userIds?: (string | number)[];
    dryRun?: boolean;
    force?: boolean;
}) => {
    return retryFetch('/api/entitlement/massDelete', {
        method: 'POST',
        body,
    });
};
```

### 7. New store action in `stores/entitlement.ts`

```ts
async function massDeleteEntitlements(
    leaveTypeId: string | number,
    year: number,
    userIds: (string | number)[] = [],
    dryRun = true,
    force = false
) {
    loading.value = true;
    try {
        return await massDeleteEntitlementsComposable({ leaveTypeId, year, userIds, dryRun, force });
    } catch (err) {
        setError(t('errors.entitlement.massDeleteFailed'));
        throw err;
    } finally {
        loading.value = false;
    }
}
```

Add `massDeleteEntitlements` to the store's return object.

---

### 8. New component: `components/Settings/MassDeleteEntitlement.vue`

Three-step flow rendered inline (no sub-routing):

#### Step 1 — Selection
- `CustomSelect` for leave type (required, filters out archived)
- `input[type=number]` for year (required, defaults to current year)
- `CustomMultiSelect` for employees (optional — empty = all)
- "Preview" button → calls `massDeleteEntitlements(…, dryRun: true)` → advances to Step 2

#### Step 2 — Preview
Rendered after the dry-run response:
- **Green summary line:** "X wallets will be deleted"
- **If blocked_count > 0:** amber warning block listing each blocked user with their days-used count. Message: "These wallets cannot be deleted because days have already been consumed. You can force-delete them, but any pending leave requests drawing from these wallets will lose their entitlement reference."
- Checkbox (only shown when blocked_count > 0): "I understand — force-delete all wallets including those with used days"
- "Confirm Delete" button (destructive, red) → calls `massDeleteEntitlements(…, dryRun: false, force: checkbox.value)`
- "Back" button → returns to Step 1

#### Step 3 — Result
Shown after actual deletion:
- "X wallets deleted. Y skipped (days already consumed)." — or if force was used, "X wallets deleted."
- Close button → emits `saved`

---

### 9. Wire into `EntitlementDays.vue`

Add a "Mass Delete" button beside "Add Entitlement Days":

```vue
<button
    v-if="permissionsStore.can('entitlement', 'modify')"
    @click="openMassDelete"
    class="py-3 inline-flex justify-center rounded-3xl border border-gray-300 dark:border-neutral-600 px-4 text-md font-medium text-gray-700 dark:text-neutral-300 shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none">
  {{ $t('settings.massDeleteEntitlements') }}
</button>
```

Open via the existing `SharedBaseModal` with `title="Mass Delete Entitlements"` and `maxWidth="max-w-[600px]"`.

---

## i18n Keys Required

```json
"massDeleteEntitlements": "Mass Delete Entitlements",
"massDeleteStep1": "Select scope",
"massDeleteStep2": "Preview",
"massDeletePreviewSafe": "No issues — {count} wallet(s) ready to delete.",
"massDeletePreviewBlocked": "{count} wallet(s) have already had days consumed and cannot be deleted by default.",
"massDeleteForceWarning": "I understand — force-delete all wallets, including those with used days",
"massDeleteConfirm": "Delete {count} wallet(s)",
"massDeleteSuccess": "{deleted} wallet(s) deleted. {skipped} skipped.",
"massDeleteForceSuccess": "{deleted} wallet(s) deleted."
```

Add matching keys to `el.json`.

Add to `errors.entitlement`:
```json
"massDeleteFailed": "Could not delete entitlements"
```

---

## Implementation Order

```
1. Backend method + route (massDestroy)
2. nuxt.config.ts key
3. server/api/entitlement/massDelete.ts
4. composable function
5. store action
6. MassDeleteEntitlement.vue component
7. EntitlementDays.vue — button + modal wire-up
8. i18n keys (en + el)
```

## Files Changed

| File | Change |
|---|---|
| `LeaveEntitlementController.php` | New `massDestroy()` method |
| `app/Models/EntitlementDay.php` | Confirm/add `user()` belongsTo relationship |
| `routes/api.php` | New route registration |
| `nuxt.config.ts` | `entitlement.massDelete` config key |
| `server/api/entitlement/massDelete.ts` | New proxy route |
| `composables/entitlementApiComposable.ts` | `massDeleteEntitlementsComposable` |
| `stores/entitlement.ts` | `massDeleteEntitlements` action |
| `components/Settings/MassDeleteEntitlement.vue` | New component (3-step flow) |
| `components/Settings/EntitlementDays.vue` | "Mass Delete" button + modal |
| `locales/en.json` + `locales/el.json` | New i18n keys |
