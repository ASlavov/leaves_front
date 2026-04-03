# Legalities Implementation Plan — Full Audit Report
## Critical Review Against Both Codebases

**Date:** 2026-04-03
**Reviewed Plan:** `.agent/legalities_implementation_plan.md`
**Verdict:** Plan has **6 show-stopper flaws**, **8 high-priority flaws**, and **9 medium-priority gaps** that must be corrected before implementation.

---

## SHOW-STOPPERS (will cause runtime errors or data corruption)

### S1. Day Numbering Convention Mismatch — ISO vs Carbon/JS

**The plan says** (Section 4, WorkingDaysHelper):
```php
$isoDay = $current->isoWeekday(); // 1=Mon, 7=Sun
```

**The actual system uses** (WorkingDaysHelper.php:47, workWeek.ts:10):
```php
$dow = $current->dayOfWeek; // 0=Sunday ... 6=Saturday
```
```ts
// 0=Sunday, 1=Monday, ..., 6=Saturday (matches JS Date.getDay())
const days = ref<number[]>([1, 2, 3, 4, 5]);
```

The **entire system** — backend helper, frontend store, CompanySetting stored values, NewLeave.vue date picker — uses the `0=Sun, 1=Mon...6=Sat` convention. The plan introduces ISO `1=Mon...7=Sun` for `User.work_schedule` and the rewritten helper. This would cause:

- **Per-user schedules would mismatch company schedules.** A user with `work_schedule: [1,2,3,4,5]` (meaning Mon-Fri in ISO) would be compared against company settings that mean Mon-Fri in the 0=Sun convention (same numeric values, coincidence). But Sunday = 0 vs Sunday = 7 means the edge case of Sunday workers would **always break**.
- **The PublicHolidayObserver** (Section 5) also uses `isoWeekday()`, inheriting the same bug.
- **Frontend NewLeave.vue** uses `workWeekStore.days` (0=Sun convention) for date exclusion. If a user has a personal `work_schedule` stored in ISO convention, the frontend has no way to use it without conversion.

**Fix:** Use `Carbon::dayOfWeek` (0=Sun) everywhere, matching the existing convention. Store `User.work_schedule` in the same 0=Sun format. Document this clearly.

---

### S2. WorkingDaysHelper Rewrite Drops Recurring Holiday Support

**The plan says** (Section 4):
```php
$holidays = \App\Models\PublicHoliday::whereBetween('date', [$start, $end])
    ->pluck('date')->toArray();
```

**The actual helper** (WorkingDaysHelper.php:28-40) has **two separate queries**:
1. **Moving holidays** (`is_recurring = false`): exact date range match
2. **Recurring holidays** (`is_recurring = true`): month-day pattern match across all years

The plan's single `whereBetween` query only catches holidays whose stored date falls within the range. A recurring holiday stored as `2024-12-25` would NOT match a leave in 2026, because `2024-12-25` is not between `2026-12-20` and `2026-12-31`.

**Impact:** Every recurring holiday (Christmas, Easter Monday, national holidays, etc.) would be silently ignored for all leave calculations. Users would be deducted for days they shouldn't work.

**Fix:** Preserve the existing dual-query pattern: separate moving vs. recurring queries, with the month-day matching for recurring holidays.

---

### S3. CompanySetting Double-Decode Returns Null

**The plan says** (Section 4):
```php
$setting = \App\Models\CompanySetting::where('key', 'work_week')->first();
$workDays = $setting ? json_decode($setting->value, true) : [1,2,3,4,5];
```

**The actual model** (CompanySetting.php:5):
```php
protected $casts = ['value' => 'array'];
```

Since `value` is cast to array, `$setting->value` is **already a PHP array**. Calling `json_decode()` on an array is a type error in PHP 8.2+. Since Laravel 11 requires PHP 8.2, this would throw:
```
TypeError: json_decode(): Argument #1 ($json) must be of type string, array given
```

The existing helper correctly uses `CompanySetting::get('work_week', [1,2,3,4,5])` — the static `get()` method on the model that returns the already-decoded value.

**Fix:** Use `CompanySetting::get('work_week', [1,2,3,4,5])` instead of the manual query + decode. This also applies to the same pattern in the PublicHolidayObserver (Section 5).

---

### S4. `activeOnDate` Scope Makes Negative Balance Feature Non-Functional

**The plan says** (Section 6, Rule 5):
```php
$wallets = EntitlementDay::where('user_id', $request->id)
    ->where('leave_type_id', $request->leave_type_id)
    ->activeOnDate($request->start_date)  // <--- THIS
    ->orderBy('end_to', 'asc')
    ->get();
```

**The actual scope** (EntitlementDay.php:37-42):
```php
public function scopeActiveOnDate(Builder $query, string $date): Builder
{
    return $query
        ->where('start_from', '<=', $date)
        ->where('end_to', '>=', $date)
        ->where('remaining_days', '>', 0);  // <--- BLOCKS NEGATIVE
}
```

The scope **requires `remaining_days > 0`**. This means:
1. A wallet at 0 remaining won't be returned, so it can never go negative.
2. The negative balance math later (`$availableDays + $leaveType->max_negative_balance`) adds to the available count, but the FIFO deduction loop iterates over `$wallets` which are **empty** if balance is already zero.
3. If someone has already used all their days and tries to borrow, `$wallets` is empty, `$totalAvailable = 0`, and the leave is rejected BEFORE the negative balance logic runs.

**Impact:** `allow_negative_balance` would never actually permit a negative balance. The feature is dead on arrival.

**Fix:** When `$leaveType->allow_negative_balance` is true, use a modified scope that removes the `remaining_days > 0` filter:
```php
$wallets = EntitlementDay::where('user_id', $request->id)
    ->where('leave_type_id', $request->leave_type_id)
    ->where('start_from', '<=', $request->start_date)
    ->where('end_to', '>=', $request->start_date)
    ->orderBy('end_to', 'asc')
    ->get();
```
The FIFO deduction must also be modified to allow driving `remaining_days` below zero (for the last wallet), clamped at `-max_negative_balance`.

---

### S5. `storeBatch()` Bypasses Eloquent Events — Observer Won't Fire

**The plan says** (Section 5): Register a `PublicHolidayObserver` on the `created` Eloquent event.

**The actual controller** (PublicHolidaysController.php:114):
```php
DB::table('public_holidays')->insertOrIgnore($rows);
```

`insertOrIgnore()` is a **raw DB query** — it does NOT instantiate Eloquent models and does NOT fire model events. So batch-created holidays would **never trigger the observer**. Only single holidays created via `PublicHoliday::create()` (the `store()` method) would fire the refund logic.

**Impact:** When HR adds a batch of public holidays (which is the common case — importing a year's holidays at once), zero leave refunds would occur.

**Fix:** Either:
1. Refactor `storeBatch()` to loop `PublicHoliday::create()` (fires observer each time), or
2. Extract the refund logic to a `PublicHolidayService::processRefundsForDate($date)` method, and call it from both the observer AND the batch controller after insert.

---

### S6. Validation `required_if:is_hourly,true` References Non-Existent Request Field

**The plan says** (Section 6):
```php
'start_time' => 'required_if:is_hourly,true|date_format:H:i',
'end_time' => 'required_if:is_hourly,true|date_format:H:i|after:start_time',
```

`required_if:is_hourly,true` checks whether the **request body** contains a field `is_hourly` with value `true`. But `is_hourly` is a property of the **LeaveType model**, not something the client sends. The client sends `leave_type_id`.

**Impact:** `start_time` and `end_time` would NEVER be required by validation. They'd always pass as nullable, and the hourly leave logic below would fail with null values or silently create broken records.

**Fix:** Remove from the Validator rules. Validate programmatically after loading the LeaveType:
```php
$leaveType = LeavesType::findOrFail($request->leave_type_id);
if ($leaveType->is_hourly) {
    $validator = Validator::make($request->all(), [
        'start_time' => 'required|date_format:H:i',
        'end_time' => 'required|date_format:H:i|after:start_time',
    ]);
    if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);
}
```

---

## HIGH-PRIORITY FLAWS (will cause incorrect behavior)

### H1. Wallet Overflow Logic Is Pseudocode — Not Implemented

**The plan says** (Section 6, Rule 2):
```php
// ... (calculate end date for $paidDays from start)
// ... create the main leave with paid days only
```

This is a **placeholder comment**, not code. Splitting a date-range leave into paid and unpaid segments requires:
1. Walking forward from `start_date` through working days, counting `$paidDays`
2. Determining the exact calendar date where the paid portion ends
3. Determining the exact calendar date where the unpaid portion starts (next working day)
4. Creating two leave records with correct non-overlapping date ranges
5. Handling the FIFO deduction only for the paid portion
6. Checking if the overflow leave type has its own wallet requirements

This is a ~50-line algorithm that isn't designed. Without it, wallet overflow is non-functional.

**Fix:** Design and implement the date-splitting algorithm. Also handle the edge case where `overflow_leave_type_id` points to a type that ALSO has `allow_wallet_overflow = true` (infinite recursion guard needed).

---

### H2. No Database Transactions — Risk of Partial Writes

The rewritten `newLeave()` does **multiple dependent writes**:
1. Create leave
2. FIFO deductions (multiple wallet updates + deduction records)
3. Priority override: modify other leaves + their deductions + their wallets
4. Wallet overflow: create a second leave record

If the server crashes or a query fails between steps 2 and 3, the database is left in an inconsistent state: a leave exists with deductions, but the overlapping lower-priority leave hasn't been refunded.

Same issue in:
- `AdminLeaveController::store()` — leave creation + wallet deduction
- `UserTerminationController::terminate()` — multiple leave cancellations + wallet refunds
- `PublicHolidayObserver::created()` — multiple deduction/wallet updates

**Fix:** Wrap each of these in `DB::transaction(function () { ... })`.

---

### H3. Termination Doesn't Handle Leaves That SPAN the Termination Date

**The plan says** (Section 8):
```php
->where('start_date', '>', $terminationDate->toDateString())
```

This only catches leaves that **start** after termination. But a leave from April 5–15 with termination on April 10 would be **missed entirely**. The employee would remain on record as being on leave after their termination date.

**Fix:** Add a second query for spanning leaves:
```php
$spanningLeaves = Leave::where('user_id', $id)
    ->whereIn('status', ['pending', 'approved'])
    ->where('start_date', '<=', $terminationDate)
    ->where('end_date', '>', $terminationDate)
    ->get();
```
These must be split: keep the portion before termination, cancel and refund the portion after. This requires the same date-splitting logic as wallet overflow.

---

### H4. Pro-Rata Accrual Doesn't Distinguish First Year vs. Subsequent Years

**The plan says**:
```php
$monthsWorked = $user->hire_date->diffInMonths(now());
$monthsWorked = min($monthsWorked, 12);
$accrualFraction = $monthsWorked / 12;
```

If someone was hired 3 years ago, `diffInMonths` returns 36, capped at 12. `$accrualFraction = 1.0`, so full entitlement. This is correct for years 2+.

But the problem is subtler: **the pro-rata should apply per entitlement year, not since hire.** If someone was hired November 1st 2025, in their first year they should accrue ~3.3 days (Nov+Dec = 2 months / 12 × 20 days). In 2026, they get the full entitlement. But the plan's formula would give them 12/12 = 100% in 2026 (correct) and 2/12 = 16.7% on day one (also correct). So actually the formula works if hire_date is recent.

**However**, there's a real flaw: the formula uses `$wallets->sum('entitled_days')` as the base, but this is the sum of ALL active wallets. If the user has a current-year wallet (20 days) and a rolled-over previous-year wallet (3 days), the accrual fraction is applied to 23 days. The previous year's rollover should NOT be subject to pro-rata — it was already fully accrued.

**Fix:** Apply pro-rata only to wallets from the current year (filter by `year = Carbon::now()->year`). Previous-year rollovers should be fully available.

---

### H5. PublicHoliday Observer Doesn't Handle Delete or Re-Add (Double Refund Risk)

**Scenario:**
1. Holiday exists for Dec 25. User takes leave Dec 20-31 (Dec 25 excluded, 4 working days deducted that week).
2. Admin deletes Dec 25 holiday. → Leave now covers 5 working days, but only 4 were deducted. **Under-deduction.**
3. Admin re-adds Dec 25. Observer fires, refunds 1 day. → Leave now shows 3 deducted days for 4 actual working days. **Double-refund.**

The observer only handles `created`, not `deleted`. And it doesn't track which holidays were already accounted for when the leave was originally calculated.

**Fix (minimum viable):**
1. Also observe the `deleted` event: when a holiday is removed, find affected leaves and ADD 1 day of deduction (the reverse of the created logic).
2. Add a `holiday_adjustments` log table or a JSON column on the leave to track which holidays were retroactively adjusted, preventing duplicates.

---

### H6. Priority Override String Comparison of Dates is Fragile

**The plan says:**
```php
$overlapStart = max($request->start_date, $existingLeave->start_date);
```

`max()` on date strings works ONLY if the format is `Y-m-d`. While this is the expected format from validation, there is no guarantee that `$existingLeave->start_date` hasn't been mutated by a Cast or Accessor. The Leave model doesn't cast `start_date` to a Date. It's stored and retrieved as a raw string from the database — usually `YYYY-MM-DD`, so this works. But it should use Carbon explicitly:

```php
$overlapStart = Carbon::parse($request->start_date)->max(Carbon::parse($existingLeave->start_date));
```

Similarly, the full-overlap comparison uses `===` which would fail if one side is ever a Carbon instance.

---

### H7. Negative Balance Math is Wrong When Balance is Already Partially Negative

**The plan says:**
```php
$availableDays = $availableDays + $leaveType->max_negative_balance + abs(min(0, $currentBalance));
```

Trace with user who has **already borrowed** 2 of 3 allowed negative days:
- `remaining_days = -2` (but see S4 — wallets at -2 wouldn't even be returned)

Even if S4 is fixed, the math doesn't correctly compute "remaining borrowing capacity":
- `$currentBalance = -2`, `max_negative_balance = 3`
- `abs(min(0, -2)) = 2`
- `$availableDays = 0 + 3 + 2 = 5` ← **WRONG.** Should be 1 (they can borrow 1 more).

**Fix:** Remaining borrowing capacity = `max_negative_balance - abs(min(0, $currentBalance))` = `3 - 2 = 1`. The formula should be:
```php
$negativeBorrowed = abs(min(0, $currentBalance));
$remainingBorrowCapacity = max(0, $leaveType->max_negative_balance - $negativeBorrowed);
$availableDays = max(0, $currentBalance) + $remainingBorrowCapacity;
```

---

### H8. `leave_type_name` vs `name` Field Name Mismatch

**The current backend** (LeavesTypeController.php) uses `leave_type_name` as the request field:
```php
'leave_type_name' => 'required|string|unique:leaves_types,name',
```

**The current frontend proxy** (newLeaveType.ts:20) maps it:
```ts
body: { leave_type_name: name, ... }
```

**The plan's Section 9** shows validation with just `name`:
```php
'name' => 'required|string|max:255',
```

If the backend field name changes to `name`, every frontend proxy route that maps `leave_type_name` would silently send the wrong field. The backend would reject with "name is required."

**Fix:** Either keep the field as `leave_type_name` (match existing convention) or update ALL proxy routes (`newLeaveType.ts`, `updateLeaveType.ts`) simultaneously.

---

## MEDIUM-PRIORITY GAPS (additional work required)

### M1. Missing Nuxt Server Proxy Routes

The frontend **never calls the backend directly**. Every API call goes: Component → Store → Composable → `/api/...` (Nuxt server route) → Laravel backend.

The plan adds 4 new backend endpoints but **doesn't mention** creating the corresponding Nuxt server routes:
- `server/api/admin/leave.post.ts` → maps to `POST /admin-leave`
- `server/api/admin/terminatePreview.ts` → maps to `GET /terminate-user/{id}/preview`
- `server/api/admin/terminate.post.ts` → maps to `POST /terminate-user/{id}`
- `server/api/leaves/attachment.get.ts` → maps to `GET /leave-attachment/{leave_id}`

Without these, the frontend stores/composables have **no route to hit**.

**Also missing:** New proxy routes for the `updateLeaveType` endpoint (to forward the 9 new fields), and for the `editUser` endpoint (to forward `work_schedule` + `hire_date`).

**Fix:** Add to Phase 4: "Create Nuxt server proxy routes for all new and modified endpoints."

---

### M2. File Upload Changes Request Encoding

The current `newLeave` endpoint receives a JSON body via `$fetch()`. Adding file attachment support (`$request->hasFile('attachment')`) requires `multipart/form-data` encoding. This is a fundamental change to:
- The Nuxt proxy route (`server/api/leaves/newLeave.ts`) — must use `readMultipartFormData` instead of `readBody`
- The composable (`newLeaveComposable`) — must send `FormData` instead of JSON
- The `retryFetch` utility — must not set `Content-Type: application/json` for multipart

**Fix:** Either:
1. Use base64 encoding for attachments (like the existing profile image upload), avoiding the encoding change entirely, or
2. Make the Nuxt proxy support both JSON (no attachment) and multipart (with attachment), with clear documentation

Base64 is the simpler path since the project already has this pattern.

---

### M3. `hire_date` Not Added to User Creation Flow

The plan adds `hire_date` to `user_update()` (Section 10) but doesn't mention `UserController::store()`. New employees should have their hire date set at creation time. The `store()` method's validation and `User::create()` call both need updating.

---

### M4. `LeavesTypeController` Update Method Uses Manual Assignment

The current `update_leave_type()` manually sets each field:
```php
$leaveType->name = $request->leave_type_name;
if ($request->has('depends_on_type_id')) { $leaveType->depends_on_type_id = ... }
if ($request->has('allow_rollover')) { $leaveType->allow_rollover = ... }
```

Adding 9 more fields this way means 9 more `if ($request->has(...))` blocks. The plan doesn't show how these fields are actually saved in the update method. A partial update (e.g., just renaming the leave type) would need to **not** overwrite the other fields to null.

**Fix:** Show the full update method. Use `$leaveType->fill($request->only([...validated fields...]))` for the new fields, which respects `$fillable` and handles nulls correctly.

---

### M5. No i18n for New Backend Error Messages

The system uses Greek as the primary language (`@nuxtjs/i18n` with `el` default). Backend emails use Greek text. But all new error messages in the plan are English:
- `"Hire date not set for pro-rata calculation."`
- `"A medical or supporting document is required for this leave duration."`
- `"Administrative Leave Recorded"`

These will appear as English strings in an otherwise Greek UI.

**Fix:** Either use error codes that the frontend translates, or add Greek translations to the backend. The frontend i18n approach is cleaner.

---

### M6. `UpdateLeaveTypePayload` Frontend Type Doesn't Include New Fields

The current `UpdateLeaveTypePayload` in `types/index.ts:227-232`:
```ts
export interface UpdateLeaveTypePayload {
  id: string | number;
  name: string;
  dependsOnTypeId?: string | number | null;
  allowRollover?: boolean;
}
```

This needs 9 new optional fields. The plan's Section 11.1 shows the backend interface but doesn't show the **payload** type that the frontend sends to the proxy.

---

### M7. No `serveAttachment` Endpoint Implementation

Section 19 mentions: `Route::get('/leave-attachment/{leave_id}', [LeavesController::class, 'serveAttachment']);`

But there's no implementation of `serveAttachment()` in the plan. Without it, uploaded attachments can never be downloaded or viewed. Need to implement auth check + `Storage::disk('local')->download()`.

---

### M8. `Entitlement` Store Hardcodes `leave_type_id === 5`

Both `stores/entitlement.ts` and `entliltmentDays()` backend method hardcode `leave_type_id === 5` for Work From Home. This contradicts the plan's "generic rules engine" philosophy. While not directly a plan flaw, the implementation phase should note this as something to address (use a LeaveType flag like `is_monthly_allocation` instead of a magic number).

---

### M9. `EditUserPayload` Doesn't Include New Fields

The `EditUserPayload` type needs `workSchedule?: number[] | null` and `hireDate?: string | null`. The `editUser.ts` proxy route needs to forward these to the backend as `work_schedule` and `hire_date`. The `AddUserPayload` similarly needs `hireDate`.

---

## INTERACTION FLAWS IN THE CROSS-RULE MATRIX

### I1. Priority Override + Wallet Overflow

The plan says these don't conflict, but consider:
1. User requests 10 days Annual Leave but only has 6. `allow_wallet_overflow = true`.
2. System auto-splits: 6 paid + 4 unpaid.
3. Later, user requests 5 days Sick Leave overlapping the annual leave.
4. Priority override refunds 5 days from the annual leave wallet.
5. But the annual leave was already split — which portion gets refunded? The 6-day paid portion or the 4-day unpaid portion? Both? What if only 3 overlap with the paid portion and 2 with the unpaid?

The plan treats overflow leaves as independent records, but the priority override queries ALL leaves for the user. It would find BOTH the paid and unpaid leaves and try to refund both. This could over-refund or refund from the wrong leave type's wallet.

**Fix:** When creating overflow leaves, link them (e.g., `parent_leave_id` on the overflow record). The priority override should treat linked leaves as a single logical unit and refund proportionally.

---

### I2. PublicHoliday Observer + Hourly Leaves

If an hourly leave spans a single day and that day becomes a holiday, the observer refunds 1 full day. But the hourly leave only deducted a fraction of a day (e.g., 0.5). This would **over-refund** the wallet.

**Fix:** The observer needs to check `$leave->leaveType->is_hourly`. If true, refund the fractional amount deducted (from the deduction record), not a flat 1 day.

---

### I3. Administrative Leave + Priority Override

An admin-created leave bypasses all rules. But when a normal user later requests a high-priority leave overlapping an admin-created leave, the priority override would attempt to cancel/split the admin leave. This could undo an intentional HR action.

**Fix:** Exclude `is_administrative = true` leaves from the priority override query.

---

## SUMMARY OF REQUIRED CHANGES

| Category | Count | Examples |
|----------|-------|---------|
| **Show-stoppers** | 6 | Day numbering, recurring holidays, double-decode, activeOnDate scope, batch observer bypass, validation |
| **High-priority** | 8 | Overflow pseudocode, no transactions, spanning termination, pro-rata per-year, holiday delete, date comparison, negative math, field name |
| **Medium-priority** | 9 | Proxy routes, file encoding, hire_date creation, update method, i18n, payload types, attachment endpoint, hardcoded ID 5, EditUserPayload |
| **Interaction flaws** | 3 | Priority+Overflow linked leaves, Observer+Hourly fractional refund, Admin+Priority exclusion |
| **TOTAL** | **26** | |

---

## RECOMMENDED PATH FORWARD

1. **Fix all 6 show-stoppers** in the plan document before writing any code.
2. **Design the date-splitting algorithm** needed by both wallet overflow (H1) and spanning-leave termination (H3) — this is one reusable utility.
3. **Add `DB::transaction()` wrappers** to every multi-write operation (H2).
4. **Redesign negative balance** with a modified scope and correct math (S4, H7).
5. **Extract observer logic to a service** that handles both single and batch operations (S5).
6. **Add the Nuxt proxy layer** as a formal phase between backend and frontend work (M1).
7. **Address the 3 interaction flaws** by adding guards (is_administrative exclusion, hourly fractional refund, overflow parent linking).

Once these 26 items are resolved, the plan will be implementation-ready.
