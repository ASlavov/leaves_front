# Leaves Architecture: Concrete Implementation Plan

All changes are backend-first. Frontend work is listed at the end with brief notes.
The `importMassLeaves` `create()` → `updateOrCreate()` fix is already done and is the baseline for Phase 3.

---

## Phase 1 — Database Migrations (run in order)

### Migration 1: `depends_on_type_id` on `leaves_types`
```bash
php artisan make:migration add_depends_on_type_id_to_leaves_types_table
```
```php
Schema::table('leaves_types', function (Blueprint $table) {
    $table->unsignedBigInteger('depends_on_type_id')->nullable()->after('name');
    $table->foreign('depends_on_type_id')
          ->references('id')->on('leaves_types')
          ->nullOnDelete();
});
```

### Migration 2: `leave_deductions` pivot table
```bash
php artisan make:migration create_leave_deductions_table
```
```php
Schema::create('leave_deductions', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('leave_id');
    $table->unsignedBigInteger('entitlement_id')->nullable();
    $table->integer('days_deducted');
    $table->timestamps();

    $table->foreign('leave_id')
          ->references('id')->on('leaves')
          ->cascadeOnDelete();
    $table->foreign('entitlement_id')
          ->references('id')->on('entitlement_days')
          ->nullOnDelete();
});
```

```bash
php artisan migrate
```

---

## Phase 2 — Model Updates

### `app/Models/LeavesType.php`
- The model already has SoftDeletes (confirmed via `deleted_at` column). No change needed there.
- Add `depends_on_type_id` to `$fillable`.
- Add self-referential relationships:

```php
protected $fillable = ['name', 'depends_on_type_id'];

public function parent(): BelongsTo
{
    return $this->belongsTo(LeavesType::class, 'depends_on_type_id');
}

public function dependents(): HasMany
{
    return $this->hasMany(LeavesType::class, 'depends_on_type_id');
}
```

### `app/Models/EntitlementDay.php`
- Add a named scope for "active wallets on a given date" — used everywhere that FIFO logic runs:

```php
public function scopeActiveOnDate(Builder $query, string $date): Builder
{
    return $query
        ->where('start_from', '<=', $date)
        ->where('end_to', '>=', $date)
        ->where('remaining_days', '>', 0);
}

public function deductions(): HasMany
{
    return $this->hasMany(LeaveDeduction::class, 'entitlement_id');
}
```

### `app/Models/Leave.php`
- Add relationship to deductions:

```php
public function deductions(): HasMany
{
    return $this->hasMany(LeaveDeduction::class, 'leave_id');
}
```

### New: `app/Models/LeaveDeduction.php`
```bash
php artisan make:model LeaveDeduction
```
```php
class LeaveDeduction extends Model
{
    protected $fillable = ['leave_id', 'entitlement_id', 'days_deducted'];

    public function leave(): BelongsTo
    {
        return $this->belongsTo(Leave::class);
    }

    public function entitlement(): BelongsTo
    {
        return $this->belongsTo(EntitlementDay::class, 'entitlement_id');
    }
}
```

---

## Phase 3 — LeaveEntitlementController: Rollover Support

**File:** `app/Http/Controllers/Api/LeaveEntitlementController.php`

### Add rollover handling to `importMassLeaves()`

After the existing `foreach` loop that does `updateOrCreate`, add:

```php
// Rollover: extend previous year's wallets that still have a balance
if ($request->boolean('rollover_previous') && $request->filled('rollover_until')) {
    $previousYear = (int)$year - 1;
    EntitlementDay::where('leave_type_id', $leaveTypeId)
        ->where('year', $previousYear)
        ->whereIn('user_id', $userIds)
        ->where('remaining_days', '>', 0)
        ->update(['end_to' => $request->rollover_until]);
}
```

Also update validation to accept the new optional fields:
```php
'rollover_previous' => 'nullable|boolean',
'rollover_until'    => 'nullable|date|required_if:rollover_previous,true',
```

### Apply the same to `store()` (single-user add/update)
After the `updateOrCreate` call:
```php
if ($request->boolean('rollover_previous') && $request->filled('rollover_until')) {
    $previousYear = (int)$request->year - 1;
    EntitlementDay::where('user_id', $request->user_id)
        ->where('leave_type_id', $request->leave_type_id)
        ->where('year', $previousYear)
        ->where('remaining_days', '>', 0)
        ->update(['end_to' => $request->rollover_until]);
}
```

---

## Phase 4 — LeavesController: FIFO Deduction + Dependency Check

**File:** `app/Http/Controllers/Api/LeavesController.php`

### Replace the entitlement check in `newLeave()`

The current code does:
```php
$entitlement = EntitlementDay::where('user_id', $userId)
    ->where('leave_type_id', $leaveTypeId)
    ->where('year', $year)
    ->first();
if ($entitlement->remaining_days < $leaveDays) { ... }
$entitlement->remaining_days -= $leaveDays;
$entitlement->save();
```

Replace this entire block with:

```php
// 1. Dependency check — must exhaust parent type first
$leaveType = LeavesType::findOrFail($leaveTypeId);
if ($leaveType->depends_on_type_id) {
    $parentBalance = EntitlementDay::where('user_id', $userId)
        ->where('leave_type_id', $leaveType->depends_on_type_id)
        ->activeOnDate($startDate)
        ->sum('remaining_days');

    if ($parentBalance > 0) {
        return response()->json([
            'error' => 'You must exhaust your standard leave balance before requesting this leave type.'
        ], 422);
    }
}

// 2. FIFO wallet check — find all wallets active on the start date, soonest expiring first
$wallets = EntitlementDay::where('user_id', $userId)
    ->where('leave_type_id', $leaveTypeId)
    ->activeOnDate($startDate)
    ->orderBy('end_to', 'asc')
    ->get();

$totalAvailable = $wallets->sum('remaining_days');
if ($totalAvailable < $leaveDays) {
    return response()->json(['error' => 'Not enough entitlement days available'], 422);
}

// 3. Save the leave first to get an ID
$leave->save();

// 4. FIFO deduction — debit wallets in order and record each deduction
$daysLeft = $leaveDays;
foreach ($wallets as $wallet) {
    if ($daysLeft <= 0) break;
    $deduct = min($wallet->remaining_days, $daysLeft);
    $wallet->remaining_days -= $deduct;
    $wallet->save();
    $leave->deductions()->create([
        'entitlement_id' => $wallet->id,
        'days_deducted'  => $deduct,
    ]);
    $daysLeft -= $deduct;
}
```

> **Note on `$startDate`:** The existing `newLeave()` already parses `$leave->start_date`. Use that value as the `$startDate` string passed to `activeOnDate()`.

### Replace the restoration block in `processedLeave()`

The current code:
```php
if ($request->status == 'rejected' || $request->status == 'cancelled') {
    $leaveDays = ...;
    $entitlement = EntitlementDay::where(...)->where('year', $year)->first();
    if ($entitlement) {
        $entitlement->remaining_days += $leaveDays;
        $entitlement->save();
    }
}
```

Replace with:
```php
if ($request->status == 'rejected' || $request->status == 'cancelled') {
    foreach ($leave->deductions()->with('entitlement')->get() as $deduction) {
        if ($deduction->entitlement) {
            $deduction->entitlement->increment('remaining_days', $deduction->days_deducted);
        }
    }
}
```

---

## Phase 5 — LeaveTypeController: Archive Instead of Delete

**File:** `app/Http/Controllers/Api/LeaveTypeController.php` (or wherever CRUD lives)

### `destroy()` — confirm it soft-deletes
The model uses SoftDeletes, so `$leaveType->delete()` already soft-deletes. Verify there is no `forceDelete()` call. If there is, change it to `delete()`.

### `index()` — add `include_archived` query param
```php
public function index(Request $request)
{
    $query = LeavesType::query();

    if ($request->boolean('include_archived')) {
        $query->withTrashed();
    }

    return response()->json($query->get());
}
```

### New: `restore()` endpoint
```php
public function restore($id)
{
    $leaveType = LeavesType::withTrashed()->findOrFail($id);
    $leaveType->restore();
    return response()->json(['message' => 'Leave type restored successfully']);
}
```

Register in `routes/api.php`:
```php
Route::patch('leave-types/{id}/restore', [LeaveTypeController::class, 'restore']);
```

---

## Phase 6 — Frontend (Summary)

These are the corresponding UI changes required. Each maps directly to a backend phase above.

| Component | Change |
|---|---|
| `EditEntitlement.vue` | Add rollover toggle + `rollover_until` date picker; append `rollover_previous` + `rollover_until` to form payload |
| `LeavesTypesList.vue` | Rename "Delete" → "Archive"; add "Restore" button for archived types; call `GET /leave-types?include_archived=true` for the admin list |
| Leave request form | Fetch leave types **without** `include_archived` (default) so archived types don't appear in dropdowns |
| Leave balance display | Show per-wallet breakdown instead of a single total (iterate `entitlementDaysData[userId]` grouped entries) |
| `stores/entitlement.ts` | Pass `rollover_previous` and `rollover_until` through `addEntitledDays` function signature → composable → server route |
| `server/api/entitlement/massLeaves.ts` | Forward the new `rollover_previous` + `rollover_until` fields in the proxy body |

---

## Implementation Order

```
Phase 1 → run migrations first (schema must exist before code references it)
Phase 2 → update models (safe, no behaviour change yet)
Phase 3 → entitlement rollover (additive, non-breaking)
Phase 5 → leave type archive (non-breaking, confirm soft delete already works)
Phase 4 → FIFO deduction (the breaking change — test thoroughly before deploying)
Phase 6 → frontend (can be done in parallel with phases 3–5)
```

Phase 4 is the only change that affects live leave submission logic. Deploy it after verifying Phase 1–3 are stable and the DB is clean (which you've already done).
