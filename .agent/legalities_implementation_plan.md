# Legalities Implementation Plan
## Leave Rules Engine: Full System Implementation

**Date:** 2026-04-03
**Scope:** Backend (Laravel) + Frontend (Nuxt 3)
**Branch:** aris_improvements

---

## 0. Executive Summary

This plan implements all 9 rule generalities from `legalities.md`, plus the **Administrative Action** feature (HR-level manual leave recording). Each section details: what changes, why, how it interacts with other rules, and the exact code/migration needed.

The system is built on:
- A **Rules Engine** at the `LeavesType` level (new columns governing behavior)
- A **Per-User Schedule** override at the `User` level
- A **PublicHoliday Observer** for retroactive refunds
- An **Administrative Leave** pathway for HR+

---

## 1. Pre-Implementation: Baseline Understanding

### Current Leave Flow (what exists)
1. User submits leave → `LeavesController::newLeave()`
2. Dependency check (must exhaust parent type first)
3. FIFO wallet check → if `totalAvailable < days`, reject
4. Deduct from wallets, record in `leave_deductions`
5. Rejection/cancellation refunds via deduction records

### What is Missing (gap analysis per legalities.md)
| # | Feature | Backend Gap | Frontend Gap |
|---|---------|-------------|--------------|
| 1 | Priority override | No `priority_level` column, no overlap detection | No indication of priority |
| 2 | Wallet overflow | Hardcoded block, no auto-split | No overflow option |
| 3 | Public holiday observer | No observer, no retroactive refund | N/A (backend only) |
| 4 | Past cancellation no-cascade | Already correct, needs documentation only | Needs HR warning |
| 5 | Negative balance / pro-rata | No accrual logic, no hire date | No indication |
| 6 | Shift-worker schedule | Company-wide only, no per-user | No per-user schedule UI |
| 7 | Hourly leaves | Integer-only deductions | Date-only picker |
| 8 | Termination action | No terminate endpoint, no future-leave cleanup | No terminate button |
| 9 | Document requirements | No `attachment_required_after_days` column | No conditional file upload |
| — | Administrative Action | No admin-leave endpoint | No admin-leave modal |

---

## 2. Database Migrations

### Migration 1: leaves_types — Rules Engine Columns
**File:** `2026_04_03_000001_add_rules_engine_to_leaves_types_table.php`

```php
Schema::table('leaves_types', function (Blueprint $table) {
    // Rule 1: Priority (lower number = higher priority, 10 = default)
    $table->unsignedTinyInteger('priority_level')->default(10)->after('allow_rollover');

    // Rule 2: Wallet overflow — auto-split into unpaid segment
    $table->boolean('allow_wallet_overflow')->default(false)->after('priority_level');
    $table->unsignedBigInteger('overflow_leave_type_id')->nullable()->after('allow_wallet_overflow');
    $table->foreign('overflow_leave_type_id')
          ->references('id')->on('leaves_types')
          ->nullOnDelete();

    // Rule 5: Accrual type and negative balance
    $table->enum('accrual_type', ['upfront', 'pro_rata_monthly'])->default('upfront')->after('overflow_leave_type_id');
    $table->boolean('allow_negative_balance')->default(false)->after('accrual_type');
    $table->integer('max_negative_balance')->default(0)->after('allow_negative_balance');

    // Rule 7: Hourly leaves
    $table->boolean('is_hourly')->default(false)->after('max_negative_balance');
    $table->decimal('hours_per_day', 4, 2)->default(8.00)->after('is_hourly');

    // Rule 9: Document requirements
    $table->unsignedSmallInteger('attachment_required_after_days')->nullable()->after('hours_per_day');
});
```

### Migration 2: users — Per-User Schedule + Hire Date + Termination
**File:** `2026_04_03_000002_add_schedule_and_employment_to_users_table.php`

```php
Schema::table('users', function (Blueprint $table) {
    // Rule 6: Per-user work schedule (array of ISO weekday numbers: 1=Mon...7=Sun)
    // null = fall back to company work_week setting
    $table->json('work_schedule')->nullable()->after('connected_users');

    // Rule 5 (pro-rata): Employment start date for accrual calculation
    $table->date('hire_date')->nullable()->after('work_schedule');

    // Rule 8: Termination
    $table->date('termination_date')->nullable()->after('hire_date');
});
```

### Migration 3: leaves — Administrative flag + Hourly support + Attachment
**File:** `2026_04_03_000003_add_admin_and_hourly_to_leaves_table.php`

```php
Schema::table('leaves', function (Blueprint $table) {
    // Administrative Action feature
    $table->boolean('is_administrative')->default(false)->after('reason');
    $table->text('administrative_reason')->nullable()->after('is_administrative');

    // Rule 7: Hourly leaves — store total hours for hourly leave types
    $table->decimal('total_hours', 6, 2)->nullable()->after('administrative_reason');
    $table->time('start_time')->nullable()->after('total_hours');
    $table->time('end_time')->nullable()->after('start_time');

    // Rule 9: Attachment path
    $table->string('attachment_path')->nullable()->after('end_time');
});
```

### Migration 4: leave_deductions — Decimal days for hourly support
**File:** `2026_04_03_000004_change_days_deducted_to_decimal_in_leave_deductions.php`

```php
// Change days_deducted from integer to decimal(8,2) for hourly fractions
Schema::table('leave_deductions', function (Blueprint $table) {
    $table->decimal('days_deducted', 8, 2)->change();
});
```

### Migration 5: entitlement_days — Decimal remaining_days for hourly support
**File:** `2026_04_03_000005_change_remaining_days_to_decimal_in_entitlement_days.php`

```php
Schema::table('entitlement_days', function (Blueprint $table) {
    $table->decimal('entitled_days', 8, 2)->change();
    $table->decimal('remaining_days', 8, 2)->change();
});
```

---

## 3. Backend — Models

### 3.1 LeavesType.php — Update `$fillable`
Add all new columns to fillable:
```php
protected $fillable = [
    'name', 'depends_on_type_id', 'allow_rollover',
    'priority_level', 'allow_wallet_overflow', 'overflow_leave_type_id',
    'accrual_type', 'allow_negative_balance', 'max_negative_balance',
    'is_hourly', 'hours_per_day', 'attachment_required_after_days',
];

protected $casts = [
    'allow_rollover' => 'boolean',
    'allow_wallet_overflow' => 'boolean',
    'allow_negative_balance' => 'boolean',
    'is_hourly' => 'boolean',
];

// Add relationship for overflow type
public function overflowType(): BelongsTo
{
    return $this->belongsTo(LeavesType::class, 'overflow_leave_type_id');
}
```

### 3.2 User.php — Update `$fillable` and casts
```php
protected $fillable = [
    'name', 'email', 'password', 'user_status',
    'department_id', 'connected_users',
    'work_schedule', 'hire_date', 'termination_date',
];

protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'connected_users' => 'array',
        'work_schedule' => 'array',
        'hire_date' => 'date',
        'termination_date' => 'date',
    ];
}
```

### 3.3 Leave.php — Update `$fillable`
```php
protected $fillable = [
    'user_id', 'leave_type_id', 'start_date', 'end_date',
    'status', 'reason', 'processed_by', 'processed_at', 'processed_status',
    'is_administrative', 'administrative_reason',
    'total_hours', 'start_time', 'end_time', 'attachment_path',
];

protected $casts = [
    'is_administrative' => 'boolean',
];
```

### 3.4 EntitlementDay.php — Update `$fillable` for decimal support
No fillable changes needed, just ensure decimal values are accepted (done by migration).

---

## 4. Backend — WorkingDaysHelper

### Current Behavior
`WorkingDaysHelper::countWorkingDays($start, $end)` uses the company work week setting.

### New Behavior
Add an optional `$userId` parameter. If provided, fetch the user's `work_schedule` first; fall back to company setting only if null.

```php
// WorkingDaysHelper.php
public static function countWorkingDays(string $start, string $end, ?int $userId = null): float
{
    // 1. Determine working days for this user
    $workDays = null;
    if ($userId) {
        $user = \App\Models\User::find($userId);
        $workDays = $user?->work_schedule; // e.g. [1,2,3] for Mon-Wed
    }
    if (!$workDays) {
        // Fall back to company setting
        $setting = \App\Models\CompanySetting::where('key', 'work_week')->first();
        $workDays = $setting ? json_decode($setting->value, true) : [1,2,3,4,5];
    }

    // 2. Fetch all public holidays in range
    $holidays = \App\Models\PublicHoliday::whereBetween('date', [$start, $end])
        ->pluck('date')
        ->toArray();

    // 3. Count days
    $count = 0;
    $current = \Carbon\Carbon::parse($start);
    $endDate = \Carbon\Carbon::parse($end);

    while ($current->lte($endDate)) {
        $isoDay = $current->isoWeekday(); // 1=Mon, 7=Sun
        if (in_array($isoDay, $workDays) && !in_array($current->toDateString(), $holidays)) {
            $count++;
        }
        $current->addDay();
    }

    return $count;
}
```

All calls to `countWorkingDays()` in `LeavesController::newLeave()` must be updated to pass `$request->id`.

---

## 5. Backend — New Observer: PublicHolidayObserver (Rule 3)

**File:** `app/Observers/PublicHolidayObserver.php`

```php
<?php
namespace App\Observers;

use App\Models\Leave;
use App\Models\PublicHoliday;
use App\Models\LeaveDeduction;

class PublicHolidayObserver
{
    public function created(PublicHoliday $holiday): void
    {
        $holidayDate = $holiday->date;

        // Find all pending or approved leaves that span this holiday date
        $affectedLeaves = Leave::whereIn('status', ['pending', 'approved'])
            ->where('start_date', '<=', $holidayDate)
            ->where('end_date', '>=', $holidayDate)
            ->with(['deductions.entitlement', 'leaveType'])
            ->get();

        foreach ($affectedLeaves as $leave) {
            // Check the holiday date was actually a working day for this user
            // (based on their work_schedule or company default)
            $userId = $leave->user_id;
            $user = \App\Models\User::find($userId);
            $workDays = $user?->work_schedule;

            if (!$workDays) {
                $setting = \App\Models\CompanySetting::where('key', 'work_week')->first();
                $workDays = $setting ? json_decode($setting->value, true) : [1,2,3,4,5];
            }

            $dayOfWeek = \Carbon\Carbon::parse($holidayDate)->isoWeekday();
            if (!in_array($dayOfWeek, $workDays)) {
                continue; // This day wasn't a working day anyway, no refund needed
            }

            // Refund 1 day from the latest deduction record (LIFO for refunds)
            $lastDeduction = $leave->deductions()
                ->whereHas('entitlement')
                ->orderBy('id', 'desc')
                ->first();

            if ($lastDeduction && $lastDeduction->days_deducted > 0) {
                $lastDeduction->days_deducted -= 1;
                $lastDeduction->save();

                if ($lastDeduction->entitlement) {
                    $lastDeduction->entitlement->increment('remaining_days', 1);
                }
            }
        }
    }
}
```

**Register in `AppServiceProvider::boot()`:**
```php
\App\Models\PublicHoliday::observe(\App\Observers\PublicHolidayObserver::class);
```

---

## 6. Backend — LeavesController: Rewrite `newLeave()`

The `newLeave()` method must be significantly extended. Here is the full new logic in order:

```
VALIDATION
  ↓
LEAVE TYPE LOAD (with new columns)
  ↓
[Rule 7] IF is_hourly: validate start_time/end_time, compute total_hours, convert to decimal days
  ↓
[Rule 9] IF attachment_required_after_days set AND days > threshold: require attachment field
  ↓
[Rule 2] Dependency check (unchanged)
  ↓
[Rule 6] Compute leaveDays using user's work_schedule (via updated WorkingDaysHelper)
  ↓
[Rule 5] Compute available balance:
         IF accrual_type = 'pro_rata_monthly': restrict to accrued days
         IF allow_negative_balance: extend by max_negative_balance
  ↓
[Rule 2] Wallet overflow check:
         IF allow_wallet_overflow = false: hard block if leaveDays > available
         IF allow_wallet_overflow = true AND overflow_leave_type_id set: auto-create overflow leave
  ↓
[Rule 1] Priority check: scan for overlapping approved/pending leaves of lower priority
         IF found: auto-split + refund + create action log
  ↓
CREATE LEAVE (with is_administrative=false, attachment_path if uploaded)
  ↓
FIFO DEDUCTION (unchanged core logic)
  ↓
NOTIFICATIONS (unchanged)
```

### Validation additions:
```php
$rules = [
    'id' => 'required|exists:users,id',
    'leave_type_id' => 'required|exists:leaves_types,id',
    'start_date' => 'required|date',
    'end_date' => 'required|date|after_or_equal:start_date',
    'reason' => 'nullable|string',
    // Rule 7: hourly
    'start_time' => 'required_if:is_hourly,true|date_format:H:i',
    'end_time' => 'required_if:is_hourly,true|date_format:H:i|after:start_time',
    // Rule 9: attachment
    'attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
];
```

### Rule 5 (Pro-Rata Accrual) logic:
```php
$availableDays = $totalAvailable; // existing FIFO sum

if ($leaveType->accrual_type === 'pro_rata_monthly') {
    if (!$user->hire_date) {
        return response()->json(['error' => 'Hire date not set for pro-rata calculation.'], 422);
    }
    $monthsWorked = $user->hire_date->diffInMonths(now());
    // Cap at 12 months for the current year cycle
    $monthsWorked = min($monthsWorked, 12);
    $accrualFraction = $monthsWorked / 12;
    $accrued = $wallets->sum('entitled_days') * $accrualFraction;
    $taken = $wallets->sum('entitled_days') - $totalAvailable;
    $availableDays = max(0, $accrued - $taken);
}

if ($leaveType->allow_negative_balance) {
    $currentBalance = $wallets->sum('remaining_days');
    $availableDays = $availableDays + $leaveType->max_negative_balance + abs(min(0, $currentBalance));
    // Clamp: can't borrow more than max_negative_balance total
    $availableDays = min($availableDays, $wallets->sum('entitled_days') + $leaveType->max_negative_balance);
}

if ($leaveDays > $availableDays) {
    $msg = $leaveType->allow_wallet_overflow
        ? null // handled below
        : 'Not enough entitlement days available.';
    if ($msg) return response()->json(['error' => $msg], 422);
}
```

### Rule 1 (Priority Override) logic — runs AFTER current leave is saved:
```php
// After $leave is created, check for lower-priority overlapping leaves
$overlappingLeaves = Leave::where('user_id', $request->id)
    ->whereIn('status', ['approved', 'pending'])
    ->where('id', '!=', $leave->id)
    ->where('start_date', '<=', $request->end_date)
    ->where('end_date', '>=', $request->start_date)
    ->whereHas('leaveType', function ($q) use ($leaveType) {
        $q->where('priority_level', '>', $leaveType->priority_level);
    })
    ->with(['deductions.entitlement', 'leaveType'])
    ->get();

foreach ($overlappingLeaves as $existingLeave) {
    // Find overlap range
    $overlapStart = max($request->start_date, $existingLeave->start_date);
    $overlapEnd = min($request->end_date, $existingLeave->end_date);

    $overlapDays = WorkingDaysHelper::countWorkingDays($overlapStart, $overlapEnd, $request->id);

    if ($overlapDays <= 0) continue;

    // Refund overlap days to the existing leave's wallets (LIFO order)
    $remainingRefund = $overlapDays;
    $deductions = $existingLeave->deductions()->orderBy('id', 'desc')->get();

    foreach ($deductions as $deduction) {
        if ($remainingRefund <= 0) break;
        $refundAmount = min($deduction->days_deducted, $remainingRefund);
        $deduction->days_deducted -= $refundAmount;
        $deduction->save();
        if ($deduction->entitlement) {
            $deduction->entitlement->increment('remaining_days', $refundAmount);
        }
        $remainingRefund -= $refundAmount;
    }

    // If the entire existing leave is within the overlap, cancel it
    if ($overlapStart === $existingLeave->start_date && $overlapEnd === $existingLeave->end_date) {
        $existingLeave->status = 'cancelled';
        $existingLeave->processed_reason = "Automatically cancelled: superseded by higher-priority {$leaveType->name} leave.";
        $existingLeave->processed_at = now();
        $existingLeave->save();
    } else {
        // Partial overlap: we can't easily split a leave record in two;
        // add a note to the existing leave that it was partially superseded
        $existingLeave->processed_reason = ($existingLeave->processed_reason ?? '') .
            " [Partial override: {$overlapDays} day(s) on {$overlapStart} to {$overlapEnd} superseded by {$leaveType->name}.]";
        $existingLeave->save();
    }

    // Notify the user
    \App\Helpers\AppHelper::instance()->notifyUser(
        $existingLeave->user_id,
        'Leave automatically adjusted',
        "{$overlapDays} day(s) of your {$existingLeave->leaveType->name} leave have been refunded due to a higher-priority {$leaveType->name} leave request.",
        null,
        $existingLeave->id
    );
}
```

### Rule 2 (Wallet Overflow) — auto-create unpaid segment:
```php
if ($leaveDays > $totalAvailable && $leaveType->allow_wallet_overflow && $leaveType->overflow_leave_type_id) {
    $paidDays = $totalAvailable;
    $unpaidDays = $leaveDays - $totalAvailable;

    // Create main leave for the paid portion (adjusted end date)
    // ... (calculate end date for $paidDays from start)
    // ... create the main leave with paid days only

    // Create secondary leave for the overflow portion
    // ... calculate start date for overflow (day after paid portion ends)
    Leave::create([
        'user_id' => $request->id,
        'leave_type_id' => $leaveType->overflow_leave_type_id,
        'start_date' => $overflowStart, // calculated
        'end_date' => $request->end_date,
        'status' => 'pending',
        'reason' => "[Auto-generated overflow from {$leaveType->name}] " . $request->reason,
    ]);
    // Note: overflow leave goes through its own entitlement check for the overflow type's wallets
}
```

### Rule 7 (Hourly Leaves):
```php
if ($leaveType->is_hourly) {
    // start_date == end_date for hourly leaves (single day)
    $hoursRequested = /* Carbon parse of start_time to end_time */;
    $fractionalDays = $hoursRequested / $leaveType->hours_per_day;
    $leaveDays = $fractionalDays; // Use decimal for FIFO deduction

    $leave->total_hours = $hoursRequested;
    $leave->start_time = $request->start_time;
    $leave->end_time = $request->end_time;
    $leave->save();
}
```

### Rule 9 (Attachment):
```php
if ($leaveType->attachment_required_after_days !== null && $leaveDays > $leaveType->attachment_required_after_days) {
    if (!$request->hasFile('attachment')) {
        return response()->json(['error' => 'A medical or supporting document is required for this leave duration.'], 422);
    }
    $path = $request->file('attachment')->store('leave-attachments', 'local');
    // Store $path in $leave->attachment_path after creation
}
```

---

## 7. Backend — New Controller: AdminLeaveController (Administrative Action)

**File:** `app/Http/Controllers/Api/AdminLeaveController.php`

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\LeavesType;
use App\Models\EntitlementDay;
use App\Models\User;
use App\Helpers\WorkingDaysHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminLeaveController extends Controller
{
    /**
     * POST /admin-leave
     * HR-manager or admin can record a leave on behalf of any user.
     * Bypasses approval workflow; defaults to 'approved' status.
     * Still deducts from wallet (unless override flag set).
     */
    public function store(Request $request)
    {
        $userAuth = $request->user();
        if (!$userAuth->roles->contains('name', 'admin') && !$userAuth->roles->contains('name', 'hr-manager')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'                => 'required|exists:users,id',
            'leave_type_id'          => 'required|exists:leaves_types,id',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date|after_or_equal:start_date',
            'reason'                 => 'nullable|string',
            'administrative_reason'  => 'required|string|min:10',
            'status'                 => 'nullable|in:approved,pending',
            'skip_wallet_deduction'  => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = $request->input('status', 'approved');
        $leaveDays = WorkingDaysHelper::countWorkingDays(
            $request->start_date,
            $request->end_date,
            $request->user_id
        );

        // Wallet deduction (unless explicitly skipped)
        if (!$request->boolean('skip_wallet_deduction')) {
            $wallets = EntitlementDay::where('user_id', $request->user_id)
                ->where('leave_type_id', $request->leave_type_id)
                ->activeOnDate($request->start_date)
                ->orderBy('end_to', 'asc')
                ->get();

            $totalAvailable = $wallets->sum('remaining_days');

            // Warn but do not block — admin has authority to override
            // The response will include a warning if balance is insufficient
            $walletWarning = null;
            if ($totalAvailable < $leaveDays) {
                $walletWarning = "Warning: Insufficient balance ({$totalAvailable} days available, {$leaveDays} requested). Leave recorded administratively.";
            }
        }

        $leave = Leave::create([
            'user_id'                => $request->user_id,
            'leave_type_id'          => $request->leave_type_id,
            'start_date'             => $request->start_date,
            'end_date'               => $request->end_date,
            'status'                 => $status,
            'reason'                 => $request->reason,
            'is_administrative'      => true,
            'administrative_reason'  => $request->administrative_reason,
            'processed_by'           => $userAuth->id,
            'processed_at'           => now(),
        ]);

        if (!$request->boolean('skip_wallet_deduction')) {
            $daysLeft = $leaveDays;
            foreach ($wallets as $wallet) {
                if ($daysLeft <= 0) break;
                $deduct = min($wallet->remaining_days, $daysLeft);
                if ($deduct > 0) {
                    $wallet->remaining_days -= $deduct;
                    $wallet->save();
                    $leave->deductions()->create([
                        'entitlement_id' => $wallet->id,
                        'days_deducted'  => $deduct,
                    ]);
                    $daysLeft -= $deduct;
                }
            }
        }

        // Notify the user
        \App\Helpers\AppHelper::instance()->notifyUser(
            $request->user_id,
            'Administrative Leave Recorded',
            "An administrative leave has been recorded for you: {$request->start_date} to {$request->end_date}.",
            null,
            $leave->id
        );

        return response()->json([
            'message' => 'Administrative leave recorded successfully.',
            'leave' => $leave,
            'warning' => $walletWarning ?? null,
        ], 201);
    }
}
```

**Route:** `POST /admin-leave` → `AdminLeaveController@store`

---

## 8. Backend — New Controller: UserTerminationController (Rule 8)

**File:** `app/Http/Controllers/Api/UserTerminationController.php`

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UserTerminationController extends Controller
{
    /**
     * GET /terminate-user/{id}/preview
     * Returns a preview of what will be cancelled before confirming.
     */
    public function preview(Request $request, $id)
    {
        $userAuth = $request->user();
        if (!$userAuth->roles->contains('name', 'admin') && !$userAuth->roles->contains('name', 'hr-manager')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make(['termination_date' => $request->termination_date], [
            'termination_date' => 'required|date',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $terminationDate = Carbon::parse($request->termination_date);

        $futureleaves = Leave::where('user_id', $id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date', '>', $terminationDate->toDateString())
            ->with('leaveType')
            ->get()
            ->map(fn($l) => [
                'id' => $l->id,
                'leave_type' => $l->leaveType?->name,
                'start_date' => $l->start_date,
                'end_date' => $l->end_date,
                'status' => $l->status,
            ]);

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name],
            'termination_date' => $terminationDate->toDateString(),
            'leaves_to_cancel' => $futureleaves,
            'leaves_count' => $futureleaves->count(),
        ]);
    }

    /**
     * POST /terminate-user/{id}
     * Terminates user: sets termination_date, cancels future leaves, refunds wallets.
     */
    public function terminate(Request $request, $id)
    {
        $userAuth = $request->user();
        if (!$userAuth->roles->contains('name', 'admin') && !$userAuth->roles->contains('name', 'hr-manager')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'termination_date' => 'required|date',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $terminationDate = Carbon::parse($request->termination_date);

        // Find and cancel all future leaves
        $futureLeaves = Leave::where('user_id', $id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date', '>', $terminationDate->toDateString())
            ->with('deductions.entitlement')
            ->get();

        $cancelledCount = 0;
        foreach ($futureLeaves as $leave) {
            // Refund wallet
            foreach ($leave->deductions()->with('entitlement')->get() as $deduction) {
                if ($deduction->entitlement) {
                    $deduction->entitlement->increment('remaining_days', $deduction->days_deducted);
                }
            }
            $leave->status = 'cancelled';
            $leave->processed_reason = "Automatically cancelled due to employee termination on {$terminationDate->toDateString()}.";
            $leave->processed_at = now();
            $leave->processed_by = $userAuth->id;
            $leave->save();
            $cancelledCount++;
        }

        // Set termination date on user (do NOT change user_status here; HR can do that separately)
        $user->termination_date = $terminationDate->toDateString();
        $user->save();

        return response()->json([
            'message' => "User terminated. {$cancelledCount} future leave(s) cancelled and wallets refunded.",
            'user_id' => $id,
            'termination_date' => $terminationDate->toDateString(),
            'cancelled_leaves' => $cancelledCount,
        ]);
    }
}
```

**Routes:**
```php
Route::get('/terminate-user/{id}/preview', [UserTerminationController::class, 'preview']);
Route::post('/terminate-user/{id}', [UserTerminationController::class, 'terminate']);
```

---

## 9. Backend — LeavesTypeController: Update validation rules

Add all new fields to the create/update validation in `LeavesTypeController`:

```php
$rules = [
    'name' => 'required|string|max:255',
    'depends_on_type_id' => 'nullable|exists:leaves_types,id',
    'allow_rollover' => 'nullable|boolean',
    // New fields:
    'priority_level' => 'nullable|integer|min:1|max:100',
    'allow_wallet_overflow' => 'nullable|boolean',
    'overflow_leave_type_id' => 'nullable|exists:leaves_types,id',
    'accrual_type' => 'nullable|in:upfront,pro_rata_monthly',
    'allow_negative_balance' => 'nullable|boolean',
    'max_negative_balance' => 'nullable|integer|min:0',
    'is_hourly' => 'nullable|boolean',
    'hours_per_day' => 'nullable|numeric|min:0.5|max:24',
    'attachment_required_after_days' => 'nullable|integer|min:1',
];
```

---

## 10. Backend — UserController: Add work_schedule + hire_date to user update

In `user_update()`, add to the update call:
```php
'work_schedule' => $request->work_schedule, // array|null
'hire_date' => $request->hire_date,
```

---

## 11. Frontend — Stores

### 11.1 leaveTypes store — add new fields to type definition
```ts
interface LeaveType {
  id: number
  name: string
  depends_on_type_id: number | null
  allow_rollover: boolean
  // New fields:
  priority_level: number        // default 10
  allow_wallet_overflow: boolean
  overflow_leave_type_id: number | null
  accrual_type: 'upfront' | 'pro_rata_monthly'
  allow_negative_balance: boolean
  max_negative_balance: number
  is_hourly: boolean
  hours_per_day: number         // default 8
  attachment_required_after_days: number | null
  deleted_at: string | null
}
```

### 11.2 leaves store — add new fields to Leave interface
```ts
interface Leave {
  // existing fields...
  is_administrative: boolean
  administrative_reason: string | null
  total_hours: number | null
  start_time: string | null
  end_time: string | null
  attachment_path: string | null
}
```

### 11.3 New: adminLeaveStore.ts
Handles POST `/admin-leave` and the termination endpoints:
```ts
export const useAdminLeaveStore = defineStore('adminLeave', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function recordAdministrativeLeave(payload: AdminLeavePayload) { ... }
  async function previewTermination(userId: number, terminationDate: string) { ... }
  async function terminateUser(userId: number, terminationDate: string) { ... }

  return { loading, error, recordAdministrativeLeave, previewTermination, terminateUser }
})
```

---

## 12. Frontend — LeaveType Form (NewLeaveType / EditLeaveType)

Add a new collapsible **"Advanced Rules"** section below existing fields.

### New fields to add:

**Priority & Overflow (Rule 1 & 2)**
```
Priority Level (number input, 1-100, default 10)
  Helper: "Lower number = higher priority. Sick Leave = 1, Annual = 10."

Allow Wallet Overflow (toggle)
  Helper: "If enabled, users can request more days than their balance."

Overflow Leave Type (select — only shown if Allow Wallet Overflow = true)
  Helper: "Days exceeding the balance will be automatically assigned to this leave type (e.g., Unpaid Leave)."
```

**Accrual (Rule 5)**
```
Accrual Type (radio: Upfront | Monthly Pro-Rata)
  Helper: "Pro-Rata grants leave proportional to months worked (for first-year employees)."

Allow Negative Balance (toggle — only shown if Accrual Type = Pro-Rata)
  Max Negative Balance (number — only shown if Allow Negative Balance = true)
```

**Schedule & Document (Rules 7 & 9)**
```
Hourly Leave Type (toggle)
  Helper: "Users pick a time range instead of a date range."

Hours Per Day (number — only shown if Hourly = true, default 8)
  Helper: "Used to convert hours to fractional days for deduction."

Attachment Required After (number, days)
  Helper: "Leave requests longer than this require a file upload (e.g., 3 = medical cert needed for 4+ days)."
```

---

## 13. Frontend — User Form (EditUser / Profile)

### Add to the existing "Work Info" or "Personal" section:

**Hire Date (Rule 5)**
```
Hire Date (date picker, nullable)
  Helper: "Required for pro-rata monthly accrual calculations."
  Visible to: Admin, HR-Manager only
```

**Work Schedule (Rule 6)**
```
Personal Work Schedule (multi-select of weekdays: Mon–Sun)
  Helper: "Leave blank to use the company work week. Set for part-time or shift workers."
  Visible to: Admin, HR-Manager only
```

---

## 14. Frontend — NewLeave Form (Dynamic Behavior)

When a user opens the new leave request form, the selected leave type governs the dynamic behavior:

### Rule 7: Hourly Leave
```
IF leaveType.is_hourly:
  - Hide "End Date" field
  - Show "Date" (single date), "Start Time", "End Time"
  - Show calculated hours: e.g. "= 4 hours (0.5 days)"
  - Validate: start_time < end_time
```

### Rule 9: Attachment Required
```
IF leaveType.attachment_required_after_days !== null:
  - Watch calculated day count reactively
  - IF days > threshold: show file upload input (required)
  - Show hint: "Medical certificate required for leaves longer than {threshold} days"
```

### Rule 5: Pro-Rata Balance Display
```
IF leaveType.accrual_type === 'pro_rata_monthly':
  - Adjust displayed "Available Balance" to show accrued-to-date figure
  - Show "Accrual note: X days accrued as of today based on hire date."
```

### Rule 2: Wallet Overflow Warning
```
IF leaveType.allow_wallet_overflow && requested_days > available:
  - Show informational banner: "You are requesting X days but only Y are available.
    The remaining Z days will be automatically recorded as [Overflow Type Name]."
```

---

## 15. Frontend — Administrative Action Modal

### Location
Add to the HR/Admin **Leaves Management** page (the page where all users' leaves are visible). Add a button: **"Record Administrative Leave"** (visible only to role: admin, hr-manager).

### Modal: AdminLeaveModal.vue

```
Title: "Administrative Leave Entry"

Fields:
  - Employee (searchable select — all users)
  - Leave Type (select)
  - Start Date / End Date (date pickers)
  - Reason (optional text — the employee's reason)
  - Administrative Reason (required textarea, min 10 chars)
    Placeholder: "e.g. Correcting historical records — employee was on sick leave 01/03/2026
                  but submitted a paper form."
  - Status (select: Approved | Pending, defaults to Approved)
  - Skip Wallet Deduction (toggle, default OFF)
    Helper: "Enable only for pure record-keeping entries that should not affect the balance."

Footer:
  [Cancel] [Record Leave →]

Post-submission:
  - If backend returns a `warning` (insufficient balance), show it in an amber alert
  - Show success notification
  - Refresh leaves list
```

---

## 16. Frontend — User Termination Flow (Rule 8)

### Location
In the **User Management** page, in the per-user action menu (the dropdown that has Edit, etc.), add: **"Terminate Employee"** (visible only to admin, hr-manager).

### Flow:

**Step 1 — Termination Date Modal**
```
Title: "Terminate Employee"
Fields:
  - Termination Date (date picker, defaults to today)
Button: "Preview Impact →"
```

**Step 2 — Impact Preview Modal (after API call to preview endpoint)**
```
Title: "Termination Impact Preview"
Shows:
  - Employee name
  - Termination date
  - List of future leaves to be cancelled (table: leave type, dates, status)
  - Warning: "This action will cancel X future leave(s) and restore the associated wallet balances."
  - Note: "This does NOT automatically deactivate the user account.
           Please update the user status separately."
Buttons:
  [Back] [Confirm Termination]
```

**Step 3 — Success**
```
Toast: "Employee terminated. X leave(s) cancelled and wallets refunded."
Refresh user list.
```

---

## 17. Cross-Rule Interaction Matrix

| Rule | Interacts With | Behavior |
|------|---------------|----------|
| 1 (Priority) | 3 (Holiday Observer) | Both modify deductions independently. Holiday refund applies after priority override already adjusted deductions. No conflict. |
| 1 (Priority) | 2 (Wallet Overflow) | Priority refund restores the lower-priority leave's wallet. The refunded days are available for future use per their own wallet rules. |
| 2 (Overflow) | 5 (Pro-Rata) | Available days for overflow split are calculated after pro-rata accrual is applied. Overflow check uses adjusted available figure. |
| 5 (Pro-Rata) | 5 (Negative Balance) | `allow_negative_balance` extends the pro-rata available days by `max_negative_balance`. Implemented as: `effective_limit = accrued + max_negative_balance`. |
| 6 (Work Schedule) | 3 (Holiday Observer) | Observer uses the user's work schedule to determine if the holiday date was a working day before issuing a refund. |
| 6 (Work Schedule) | 7 (Hourly) | Hourly leave validation checks that the requested date is within the user's personal working days. |
| 7 (Hourly) | 9 (Attachment) | `attachment_required_after_days` is compared against total_hours / hours_per_day (fractional days). |
| 8 (Termination) | 1 (Priority) | Termination cancellation uses the standard refund mechanism, which correctly handles any priority-interleaved deductions. |
| Admin Action | All rules | Admin action bypasses all validation rules. Wallet is still deducted by default (skip flag available). This is intentional — HR has authority. |

---

## 18. Implementation Order (Dependencies)

Execute in this sequence to avoid breaking existing functionality:

```
Phase 1 — Database (no code changes, reversible)
  1. Migration 1: rules engine columns on leaves_types
  2. Migration 2: work_schedule + hire_date + termination_date on users
  3. Migration 3: is_administrative + hourly + attachment on leaves
  4. Migration 4: decimal days_deducted in leave_deductions
  5. Migration 5: decimal entitled_days/remaining_days in entitlement_days

Phase 2 — Backend Models (non-breaking additions)
  6. Update LeavesType.php fillable + casts
  7. Update User.php fillable + casts
  8. Update Leave.php fillable + casts

Phase 3 — Backend Logic
  9. Refactor WorkingDaysHelper to accept userId
  10. Create PublicHolidayObserver + register it
  11. Rewrite newLeave() with all rule integrations
  12. Update LeavesTypeController validation rules
  13. Update UserController to save work_schedule + hire_date
  14. Create AdminLeaveController + route
  15. Create UserTerminationController + routes

Phase 4 — Frontend Types & Stores
  16. Update LeaveType interface + leaves_types store
  17. Update Leave interface + leaves store
  18. Create adminLeaveStore.ts

Phase 5 — Frontend UI
  19. Update LeaveType form (new Advanced Rules section)
  20. Update User form (hire date + work schedule)
  21. Update NewLeave form (dynamic hourly/attachment/overflow behavior)
  22. Create AdminLeaveModal.vue
  23. Add "Record Administrative Leave" button to Leaves management page
  24. Create TerminateUserModal.vue
  25. Add "Terminate Employee" to user action menu

Phase 6 — Testing
  26. Unit test WorkingDaysHelper with custom schedules
  27. Integration test priority override with overlapping leaves
  28. Integration test public holiday observer refund
  29. Integration test termination flow
  30. E2E test administrative leave modal
```

---

## 19. API Route Summary (New + Changed)

```php
// New routes to add to api.php (inside auth:sanctum middleware group):

// Administrative Leave
Route::post('/admin-leave', [AdminLeaveController::class, 'store']);

// User Termination
Route::get('/terminate-user/{id}/preview', [UserTerminationController::class, 'preview']);
Route::post('/terminate-user/{id}', [UserTerminationController::class, 'terminate']);

// Attachment serving (if needed)
Route::get('/leave-attachment/{leave_id}', [LeavesController::class, 'serveAttachment']);
```

---

## 20. Notes & Edge Cases

1. **Rule 4 (Past Cancellation No-Cascade):** The current system already handles this correctly. When a past leave is cancelled, only its deductions are refunded. No other leaves are affected. Add a UI warning in the cancellation confirmation: *"Cancelling this leave will restore {X} days to the wallet. Any unpaid leaves the employee took after exhausting this balance will NOT be automatically converted to paid leave. Manual adjustment is required."*

2. **Rule 9 + File Storage:** Attachments are stored in `storage/app/leave-attachments/` (not public). Access requires an authenticated API endpoint. Consider a `GET /leave-attachment/{leave_id}` endpoint that validates auth and returns the file.

3. **Hourly Leave Scope:** For hourly leave types (`is_hourly = true`), `start_date` and `end_date` should be the same date. Enforce `end_date == start_date` in validation if `is_hourly`.

4. **Hire Date for Pro-Rata:** If a user's `hire_date` is null and `accrual_type = pro_rata_monthly`, the system should reject the leave request with a clear message: *"Contact HR to set your employment start date before requesting this leave type."*

5. **Administrative Reason Visibility:** The `administrative_reason` field should be visible in the leave details for admin/HR users but hidden from regular employees (the `is_administrative` flag controls this on the frontend).

6. **Termination Date vs. User Status:** Termination sets `termination_date` but does NOT auto-deactivate the account. HR must separately set `user_status` to inactive. This is intentional — separation of concerns (payroll calculation moment vs. system access revocation).

7. **Decimal Precision:** All deduction amounts stored as `decimal(8,2)`. For hourly leaves, minimum granularity is 0.01 days (≈ 5 minutes in an 8-hour day). In practice, round to 2 decimal places.
