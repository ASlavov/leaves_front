# Legalities Implementation Plan v2 (Corrected)
## Leave Rules Engine: Full System Implementation

**Date:** 2026-04-03
**Scope:** Backend (Laravel @ `C:\laragon\www\intelligence-back`) + Frontend (Nuxt 3 @ `intelligence/`)
**Branch:** aris_improvements
**Supersedes:** `legalities_implementation_plan.md` (v1 — 26 flaws identified in audit)

---

## 0. Executive Summary

This plan implements all 9 rule generalities from `legalities.md`, plus the **Administrative Action** feature (HR-level manual leave recording). Every section has been validated against the actual codebase.

### Architecture Pillars
- A **Rules Engine** at the `LeavesType` level (new columns governing behavior)
- A **Per-User Schedule** override at the `User` level
- A **PublicHolidayService** (not just an Observer) for retroactive refunds — handles both single and batch creation
- An **Administrative Leave** pathway for HR+
- A reusable **DateSplitter** utility for splitting leave date ranges at arbitrary cut points

### Key Conventions (carry forward from existing system)
- **Day numbering:** `0=Sunday, 1=Monday ... 6=Saturday` everywhere (Carbon `dayOfWeek`, JS `Date.getDay()`, CompanySetting stored values). **NOT ISO weekday.**
- **Holiday handling:** Two-query pattern — moving holidays by exact date, recurring holidays by month-day (`MM-DD`) pattern.
- **CompanySetting access:** Always via `CompanySetting::get($key, $default)` — never raw query + manual json_decode (the model casts `value` to array already).
- **API proxy pattern:** Frontend never hits Laravel directly. Every call goes Component → Store → Composable → Nuxt server route (`server/api/...`) → Laravel API.
- **File uploads:** Base64 encoding in JSON body (existing pattern from profile images). Not multipart/form-data.
- **Leave type field name:** Backend uses `leave_type_name` for create/update requests (existing convention, keep it).

---

## 1. Pre-Implementation: Baseline Understanding

### Current Leave Flow (what exists)
1. User submits leave → `LeavesController::newLeave()`
2. `WorkingDaysHelper::countWorkingDays($start, $end)` counts days (excludes non-working weekdays + public holidays, both moving and recurring)
3. Dependency check (must exhaust parent type first)
4. FIFO wallet check → `EntitlementDay::activeOnDate($date)` scope (requires `remaining_days > 0`)
5. If `totalAvailable < days`, reject
6. Deduct from wallets (FIFO by soonest expiring), record in `leave_deductions`
7. Rejection/cancellation refunds via deduction records

### Gap Analysis
| # | Feature | Status |
|---|---------|--------|
| 1 | Priority override (sick supersedes vacation) | Not implemented |
| 2 | Wallet overflow (auto-split paid/unpaid) | Not implemented |
| 3 | Public holiday retroactive refund | Not implemented |
| 4 | Past cancellation no-cascade | Already correct — needs UI warning only |
| 5 | Negative balance / pro-rata accrual | Not implemented |
| 6 | Per-user work schedule | Not implemented |
| 7 | Hourly leaves | Not implemented |
| 8 | Termination with future leave cleanup | Not implemented |
| 9 | Document/attachment requirements | Not implemented |
| — | Administrative Action (HR records leave) | Not implemented |

---

## 2. Database Migrations

### Migration 1: leaves_types — Rules Engine Columns
**File:** `2026_04_03_000001_add_rules_engine_to_leaves_types_table.php`

```php
public function up(): void
{
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
        $table->unsignedInteger('max_negative_balance')->default(0)->after('allow_negative_balance');

        // Rule 7: Hourly leaves
        $table->boolean('is_hourly')->default(false)->after('max_negative_balance');
        $table->decimal('hours_per_day', 4, 2)->default(8.00)->after('is_hourly');

        // Rule 9: Document requirements
        $table->unsignedSmallInteger('attachment_required_after_days')->nullable()->after('hours_per_day');
    });
}

public function down(): void
{
    Schema::table('leaves_types', function (Blueprint $table) {
        $table->dropForeign(['overflow_leave_type_id']);
        $table->dropColumn([
            'priority_level', 'allow_wallet_overflow', 'overflow_leave_type_id',
            'accrual_type', 'allow_negative_balance', 'max_negative_balance',
            'is_hourly', 'hours_per_day', 'attachment_required_after_days',
        ]);
    });
}
```

### Migration 2: users — Per-User Schedule + Hire Date + Termination
**File:** `2026_04_03_000002_add_schedule_and_employment_to_users_table.php`

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Rule 6: Per-user work schedule
        // Array of day numbers using SAME convention as CompanySetting work_week:
        //   0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
        // null = fall back to company work_week setting
        $table->json('work_schedule')->nullable()->after('connected_users');

        // Rule 5 (pro-rata): Employment start date for accrual calculation
        $table->date('hire_date')->nullable()->after('work_schedule');

        // Rule 8: Termination
        $table->date('termination_date')->nullable()->after('hire_date');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['work_schedule', 'hire_date', 'termination_date']);
    });
}
```

### Migration 3: leaves — Administrative flag + Hourly support + Attachment + Overflow link
**File:** `2026_04_03_000003_add_admin_and_hourly_to_leaves_table.php`

```php
public function up(): void
{
    Schema::table('leaves', function (Blueprint $table) {
        // Administrative Action feature
        $table->boolean('is_administrative')->default(false)->after('reason');
        $table->text('administrative_reason')->nullable()->after('is_administrative');

        // Rule 7: Hourly leaves — store total hours for hourly leave types
        $table->decimal('total_hours', 6, 2)->nullable()->after('administrative_reason');
        $table->time('start_time')->nullable()->after('total_hours');
        $table->time('end_time')->nullable()->after('start_time');

        // Rule 9: Attachment (stored as base64 or file path)
        $table->text('attachment_base64')->nullable()->after('end_time');
        $table->string('attachment_filename')->nullable()->after('attachment_base64');

        // Rule 2: Link overflow leaves to their parent
        $table->unsignedBigInteger('parent_leave_id')->nullable()->after('attachment_filename');
        $table->foreign('parent_leave_id')
              ->references('id')->on('leaves')
              ->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('leaves', function (Blueprint $table) {
        $table->dropForeign(['parent_leave_id']);
        $table->dropColumn([
            'is_administrative', 'administrative_reason',
            'total_hours', 'start_time', 'end_time',
            'attachment_base64', 'attachment_filename',
            'parent_leave_id',
        ]);
    });
}
```

### Migration 4: leave_deductions — Decimal days for hourly support
**File:** `2026_04_03_000004_change_days_deducted_to_decimal_in_leave_deductions.php`

```php
public function up(): void
{
    Schema::table('leave_deductions', function (Blueprint $table) {
        $table->decimal('days_deducted', 8, 2)->change();
    });
}

public function down(): void
{
    Schema::table('leave_deductions', function (Blueprint $table) {
        $table->integer('days_deducted')->change();
    });
}
```

### Migration 5: entitlement_days — Decimal for hourly support
**File:** `2026_04_03_000005_change_days_to_decimal_in_entitlement_days.php`

```php
public function up(): void
{
    Schema::table('entitlement_days', function (Blueprint $table) {
        $table->decimal('entitled_days', 8, 2)->change();
        $table->decimal('remaining_days', 8, 2)->change();
    });
}

public function down(): void
{
    Schema::table('entitlement_days', function (Blueprint $table) {
        $table->integer('entitled_days')->change();
        $table->integer('remaining_days')->change();
    });
}
```

### Migration 6: holiday_adjustments — Track retroactive holiday refunds
**File:** `2026_04_03_000006_create_holiday_adjustments_table.php`

```php
public function up(): void
{
    Schema::create('holiday_adjustments', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('leave_id');
        $table->unsignedBigInteger('public_holiday_id');
        $table->enum('action', ['refund', 'charge']); // refund = holiday added, charge = holiday removed
        $table->decimal('days_adjusted', 8, 2);
        $table->timestamps();

        $table->foreign('leave_id')->references('id')->on('leaves')->cascadeOnDelete();
        $table->foreign('public_holiday_id')->references('id')->on('public_holidays')->cascadeOnDelete();

        // Prevent duplicate adjustments
        $table->unique(['leave_id', 'public_holiday_id', 'action']);
    });
}

public function down(): void
{
    Schema::dropIfExists('holiday_adjustments');
}
```

---

## 3. Backend — Models

### 3.1 LeavesType.php

```php
protected $fillable = [
    'name', 'depends_on_type_id', 'allow_rollover',
    // Rules engine:
    'priority_level', 'allow_wallet_overflow', 'overflow_leave_type_id',
    'accrual_type', 'allow_negative_balance', 'max_negative_balance',
    'is_hourly', 'hours_per_day', 'attachment_required_after_days',
];

protected $casts = [
    'allow_rollover'         => 'boolean',
    'allow_wallet_overflow'  => 'boolean',
    'allow_negative_balance' => 'boolean',
    'is_hourly'              => 'boolean',
    'priority_level'         => 'integer',
    'max_negative_balance'   => 'integer',
    'hours_per_day'          => 'decimal:2',
    'attachment_required_after_days' => 'integer',
];

// New relationship
public function overflowType(): BelongsTo
{
    return $this->belongsTo(LeavesType::class, 'overflow_leave_type_id');
}
```

### 3.2 User.php

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
        'password'          => 'hashed',
        'connected_users'   => 'array',
        'work_schedule'     => 'array',   // [0,1,2,3,4,5,6] format — 0=Sun
        'hire_date'         => 'date',
        'termination_date'  => 'date',
    ];
}
```

### 3.3 Leave.php

```php
protected $fillable = [
    'user_id', 'leave_type_id', 'start_date', 'end_date',
    'status', 'reason', 'processed_by', 'processed_at', 'processed_status',
    // New:
    'is_administrative', 'administrative_reason',
    'total_hours', 'start_time', 'end_time',
    'attachment_base64', 'attachment_filename',
    'parent_leave_id',
];

protected $casts = [
    'is_administrative' => 'boolean',
    'total_hours'       => 'decimal:2',
];

// New relationship: overflow children
public function childLeaves(): HasMany
{
    return $this->hasMany(Leave::class, 'parent_leave_id');
}

public function parentLeave(): BelongsTo
{
    return $this->belongsTo(Leave::class, 'parent_leave_id');
}
```

### 3.4 EntitlementDay.php — Add a new scope

Existing `activeOnDate` stays unchanged (it is correct for standard flow). Add a second scope for negative-balance queries:

```php
/**
 * Like activeOnDate but WITHOUT the remaining_days > 0 filter.
 * Used when allow_negative_balance is true.
 */
public function scopeActivePeriodOnDate(Builder $query, string $date): Builder
{
    return $query
        ->where('start_from', '<=', $date)
        ->where('end_to', '>=', $date);
}
```

### 3.5 New Model: HolidayAdjustment.php

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HolidayAdjustment extends Model
{
    protected $fillable = ['leave_id', 'public_holiday_id', 'action', 'days_adjusted'];

    public function leave(): BelongsTo
    {
        return $this->belongsTo(Leave::class);
    }

    public function publicHoliday(): BelongsTo
    {
        return $this->belongsTo(PublicHoliday::class);
    }
}
```

---

## 4. Backend — Utility: WorkingDaysHelper (Corrected)

The existing helper is extended with an optional `$userId` parameter. **Critical:** preserve the existing day numbering convention (0=Sun) and dual holiday query pattern.

```php
<?php

namespace App\Helpers;

use App\Models\CompanySetting;
use App\Models\PublicHoliday;
use App\Models\User;
use Carbon\Carbon;

class WorkingDaysHelper
{
    /**
     * Count the number of working days between two dates (inclusive).
     *
     * Day numbers: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
     * (matches JavaScript Date.getDay() and Carbon's dayOfWeek)
     *
     * @param string   $startDate
     * @param string   $endDate
     * @param int|null $userId  If set, use user's personal work_schedule; fall back to company setting.
     * @return float            Returns float to support future fractional-day calculations.
     */
    public static function countWorkingDays(string $startDate, string $endDate, ?int $userId = null): float
    {
        // 1. Determine working days for this user
        $workingDays = null;
        if ($userId) {
            $user = User::find($userId);
            $workingDays = $user?->work_schedule; // e.g. [1,2,3,4,5] in 0=Sun format
        }
        if (!$workingDays) {
            // Fall back to company setting (already decoded — model casts value to array)
            $workingDays = CompanySetting::get('work_week', [1, 2, 3, 4, 5]);
        }

        // Normalize to integers
        $workingDays = array_map('intval', (array) $workingDays);

        // 2. Moving (year-specific) holidays: match by exact date in range
        $movingHolidays = PublicHoliday::where('is_recurring', false)
            ->whereBetween('date', [$startDate, $endDate])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->flip()
            ->all(); // keyed by date string for O(1) lookup

        // 3. Recurring holidays: match any year by month-day ("MM-DD")
        $recurringMonthDays = PublicHoliday::where('is_recurring', true)
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('m-d'))
            ->flip()
            ->all(); // keyed by "MM-DD" for O(1) lookup

        // 4. Count days
        $count = 0;
        $current = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->startOfDay();

        while ($current->lte($end)) {
            $dow = $current->dayOfWeek; // 0=Sunday ... 6=Saturday
            $dateStr = $current->toDateString();
            $monthDay = $current->format('m-d');

            $isHoliday = isset($movingHolidays[$dateStr]) || isset($recurringMonthDays[$monthDay]);

            if (in_array($dow, $workingDays) && !$isHoliday) {
                $count++;
            }

            $current->addDay();
        }

        return (float) $count;
    }

    /**
     * Given a start date and a number of working days, find the calendar end date.
     * Used for splitting leaves at a specific working-day count.
     *
     * @return string  The calendar date (Y-m-d) on which the Nth working day falls.
     */
    public static function findEndDateForWorkingDays(string $startDate, float $workingDaysNeeded, ?int $userId = null): string
    {
        $workingDays = null;
        if ($userId) {
            $user = User::find($userId);
            $workingDays = $user?->work_schedule;
        }
        if (!$workingDays) {
            $workingDays = CompanySetting::get('work_week', [1, 2, 3, 4, 5]);
        }
        $workingDays = array_map('intval', (array) $workingDays);

        $movingHolidays = PublicHoliday::where('is_recurring', false)->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())->flip()->all();
        $recurringMonthDays = PublicHoliday::where('is_recurring', true)->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('m-d'))->flip()->all();

        $current = Carbon::parse($startDate)->startOfDay();
        $counted = 0;

        while ($counted < $workingDaysNeeded) {
            $dow = $current->dayOfWeek;
            $dateStr = $current->toDateString();
            $monthDay = $current->format('m-d');
            $isHoliday = isset($movingHolidays[$dateStr]) || isset($recurringMonthDays[$monthDay]);

            if (in_array($dow, $workingDays) && !$isHoliday) {
                $counted++;
                if ($counted >= $workingDaysNeeded) {
                    return $current->toDateString();
                }
            }
            $current->addDay();
        }

        return $current->toDateString();
    }

    /**
     * Find the next working day on or after a given date.
     */
    public static function nextWorkingDay(string $date, ?int $userId = null): string
    {
        $workingDays = null;
        if ($userId) {
            $user = User::find($userId);
            $workingDays = $user?->work_schedule;
        }
        if (!$workingDays) {
            $workingDays = CompanySetting::get('work_week', [1, 2, 3, 4, 5]);
        }
        $workingDays = array_map('intval', (array) $workingDays);

        $movingHolidays = PublicHoliday::where('is_recurring', false)->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())->flip()->all();
        $recurringMonthDays = PublicHoliday::where('is_recurring', true)->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('m-d'))->flip()->all();

        $current = Carbon::parse($date)->startOfDay();
        while (true) {
            $dow = $current->dayOfWeek;
            $dateStr = $current->toDateString();
            $monthDay = $current->format('m-d');
            $isHoliday = isset($movingHolidays[$dateStr]) || isset($recurringMonthDays[$monthDay]);

            if (in_array($dow, $workingDays) && !$isHoliday) {
                return $current->toDateString();
            }
            $current->addDay();
        }
    }

    /**
     * Check if a specific date is a working day for a user.
     */
    public static function isWorkingDay(string $date, ?int $userId = null): bool
    {
        return self::countWorkingDays($date, $date, $userId) > 0;
    }
}
```

**Key differences from v1:**
- Uses `Carbon::dayOfWeek` (0=Sun), NOT `isoWeekday()` — **fixes audit S1**
- Uses `CompanySetting::get()`, NOT manual query + json_decode — **fixes audit S3**
- Preserves dual holiday query (moving + recurring) — **fixes audit S2**
- Adds `findEndDateForWorkingDays()` for leave splitting — **fixes audit H1**
- Adds `nextWorkingDay()` and `isWorkingDay()` utilities
- Return type changed to `float` for hourly/fractional support

---

## 5. Backend — New Service: PublicHolidayService (Corrected)

**Why a service instead of just an observer:** The `storeBatch()` method uses `DB::table()->insertOrIgnore()` which bypasses Eloquent events. The service is called from both the Observer (single create) and the controller (batch create). **Fixes audit S5.**

**File:** `app/Services/PublicHolidayService.php`

```php
<?php

namespace App\Services;

use App\Helpers\WorkingDaysHelper;
use App\Models\HolidayAdjustment;
use App\Models\Leave;
use App\Models\PublicHoliday;
use Illuminate\Support\Facades\DB;

class PublicHolidayService
{
    /**
     * Process refunds for all approved/pending leaves that span the given holiday date.
     * Called when a new public holiday is created.
     */
    public function processHolidayCreated(int $holidayId, string $holidayDate): void
    {
        $affectedLeaves = Leave::whereIn('status', ['pending', 'approved'])
            ->where('start_date', '<=', $holidayDate)
            ->where('end_date', '>=', $holidayDate)
            ->with(['deductions.entitlement', 'leaveType'])
            ->get();

        foreach ($affectedLeaves as $leave) {
            // Skip if we already processed this holiday for this leave
            $alreadyProcessed = HolidayAdjustment::where('leave_id', $leave->id)
                ->where('public_holiday_id', $holidayId)
                ->where('action', 'refund')
                ->exists();

            if ($alreadyProcessed) continue;

            // Check the holiday date is actually a working day for this user
            if (!WorkingDaysHelper::isWorkingDay($holidayDate, $leave->user_id)) {
                continue;
            }

            // Determine refund amount: fractional for hourly leaves, 1 day for normal
            $refundAmount = 1.0;
            if ($leave->leaveType?->is_hourly && $leave->total_hours !== null) {
                // For hourly leaves, refund the actual fractional deduction
                // (the full day equivalent they were charged)
                $totalDeducted = $leave->deductions->sum('days_deducted');
                // An hourly leave on a single day = total_deducted is the fractional amount
                // We refund ALL of it if the entire leave is on the holiday date
                if ($leave->start_date === $leave->end_date) {
                    $refundAmount = $totalDeducted;
                } else {
                    // Multi-day leave with hourly type — unlikely but handle gracefully
                    // Refund 1 fractional day equivalent
                    $hoursPerDay = $leave->leaveType->hours_per_day ?: 8;
                    $refundAmount = min($totalDeducted, $leave->total_hours / $hoursPerDay);
                }
            }

            DB::transaction(function () use ($leave, $holidayId, $refundAmount) {
                // Refund from the latest deduction (LIFO for refunds)
                $remainingRefund = $refundAmount;
                $deductions = $leave->deductions()
                    ->whereHas('entitlement')
                    ->orderBy('id', 'desc')
                    ->get();

                foreach ($deductions as $deduction) {
                    if ($remainingRefund <= 0) break;
                    $refund = min($deduction->days_deducted, $remainingRefund);
                    $deduction->days_deducted -= $refund;
                    $deduction->save();
                    if ($deduction->entitlement) {
                        $deduction->entitlement->increment('remaining_days', $refund);
                    }
                    $remainingRefund -= $refund;
                }

                // Record the adjustment to prevent duplicates
                HolidayAdjustment::create([
                    'leave_id'          => $leave->id,
                    'public_holiday_id' => $holidayId,
                    'action'            => 'refund',
                    'days_adjusted'     => $refundAmount - $remainingRefund,
                ]);
            });
        }
    }

    /**
     * Process charges for all approved/pending leaves that span a DELETED holiday date.
     * Called when a public holiday is removed — reverses the refund.
     */
    public function processHolidayDeleted(int $holidayId, string $holidayDate): void
    {
        // Find all adjustments that were made for this holiday
        $adjustments = HolidayAdjustment::where('public_holiday_id', $holidayId)
            ->where('action', 'refund')
            ->with(['leave.deductions.entitlement'])
            ->get();

        foreach ($adjustments as $adjustment) {
            $leave = $adjustment->leave;
            if (!$leave || !in_array($leave->status, ['pending', 'approved'])) {
                // Leave was already cancelled/rejected — skip
                continue;
            }

            DB::transaction(function () use ($leave, $adjustment, $holidayId) {
                $chargeAmount = $adjustment->days_adjusted;

                // Re-deduct from wallets (FIFO by soonest expiry)
                $wallets = $leave->user->entitlementDays()
                    ->where('leave_type_id', $leave->leave_type_id)
                    ->where('start_from', '<=', $leave->start_date)
                    ->where('end_to', '>=', $leave->start_date)
                    ->orderBy('end_to', 'asc')
                    ->get();

                $remaining = $chargeAmount;
                foreach ($wallets as $wallet) {
                    if ($remaining <= 0) break;
                    $deduct = min($wallet->remaining_days, $remaining);
                    if ($deduct > 0) {
                        $wallet->remaining_days -= $deduct;
                        $wallet->save();
                        $leave->deductions()->create([
                            'entitlement_id' => $wallet->id,
                            'days_deducted'  => $deduct,
                        ]);
                        $remaining -= $deduct;
                    }
                }

                // Record the reverse adjustment
                HolidayAdjustment::create([
                    'leave_id'          => $leave->id,
                    'public_holiday_id' => $holidayId,
                    'action'            => 'charge',
                    'days_adjusted'     => $chargeAmount - $remaining,
                ]);

                // Remove the original refund record so re-adding the holiday works cleanly
                $adjustment->delete();
            });
        }
    }
}
```

### Observer: PublicHolidayObserver.php (delegates to service)

```php
<?php
namespace App\Observers;

use App\Models\PublicHoliday;
use App\Services\PublicHolidayService;

class PublicHolidayObserver
{
    public function __construct(private PublicHolidayService $service) {}

    public function created(PublicHoliday $holiday): void
    {
        $this->service->processHolidayCreated($holiday->id, $holiday->date);
    }

    public function deleted(PublicHoliday $holiday): void
    {
        $this->service->processHolidayDeleted($holiday->id, $holiday->date);
    }
}
```

**Register in `AppServiceProvider::boot()`:**
```php
public function boot(): void
{
    \App\Models\PublicHoliday::observe(\App\Observers\PublicHolidayObserver::class);
}
```

### Update PublicHolidaysController::storeBatch() — call service after insert

```php
public function storeBatch(Request $request)
{
    // ... existing validation + insertOrIgnore logic unchanged ...

    // After insert, retrieve the actually-created records and process refunds
    $created = PublicHoliday::whereIn('date', $request->dates)->orderBy('date')->get();

    // Fire the service for each (observer doesn't fire for insertOrIgnore)
    $service = app(PublicHolidayService::class);
    foreach ($created as $holiday) {
        $service->processHolidayCreated($holiday->id, $holiday->date);
    }

    return response()->json(['created' => $created->count(), 'holidays' => $created], 201);
}
```

### Update PublicHolidaysController::destroy() — call service before delete

```php
public function destroy($id)
{
    $holiday = PublicHoliday::findOrFail($id);

    // Process reverse-charges BEFORE deleting (observer also fires, but belt-and-suspenders)
    app(PublicHolidayService::class)->processHolidayDeleted($holiday->id, $holiday->date);

    $holiday->delete();

    return response()->json(['message' => 'Holiday deleted successfully']);
}
```

### Update PublicHolidaysController::destroyBatch() — call service for each

```php
public function destroyBatch(Request $request)
{
    // ... existing validation ...

    $holidays = PublicHoliday::whereIn('id', $request->ids)->get();
    $service = app(PublicHolidayService::class);

    foreach ($holidays as $holiday) {
        $service->processHolidayDeleted($holiday->id, $holiday->date);
    }

    $deleted = PublicHoliday::whereIn('id', $request->ids)->delete();

    return response()->json(['deleted' => $deleted]);
}
```

**Key differences from v1:**
- Service class, not just observer — handles batch operations — **fixes S5**
- Uses `WorkingDaysHelper::isWorkingDay()` which uses `dayOfWeek` (0=Sun) — **fixes S1**
- Handles `deleted` event (reverse-charges) — **fixes H5**
- `HolidayAdjustment` log prevents double-refund on re-add — **fixes H5**
- Wraps each modification in `DB::transaction()` — **fixes H2**
- Checks `is_hourly` for fractional refunds — **fixes I2**

---

## 6. Backend — LeavesController: Rewrite `newLeave()` (Corrected)

### Pipeline Overview

```
VALIDATION (basic fields)
  ↓
LOAD LEAVE TYPE (with all new columns)
  ↓
[Rule 7] IF is_hourly: validate start_time/end_time programmatically, compute fractional days
  ↓
[Rule 6] Compute leaveDays using user's work_schedule (via updated WorkingDaysHelper)
  ↓
[Rule 9] IF attachment_required_after_days AND days > threshold: validate attachment present
  ↓
[Existing] Dependency check (exhaust parent type first)
  ↓
[Rule 5] WALLET QUERY:
         IF allow_negative_balance: use activePeriodOnDate (no remaining > 0 filter)
         ELSE: use activeOnDate (standard)
  ↓
[Rule 5] Compute effective available:
         IF accrual_type = pro_rata_monthly AND in first year: pro-rata cap
         IF allow_negative_balance: add remaining borrow capacity
  ↓
[Rule 2] Balance check:
         IF allow_wallet_overflow AND overflow_leave_type_id set: split into paid + overflow
         ELSE: hard reject if insufficient
  ↓
DB::transaction {
  CREATE LEAVE
  ↓
  FIFO DEDUCTION (supports fractional, supports driving negative)
  ↓
  [Rule 2] IF overflow: create child leave record (linked via parent_leave_id)
  ↓
  [Rule 1] Priority override: scan for lower-priority overlapping leaves (exclude is_administrative)
           IF found: refund overlapping days, cancel/annotate
}
  ↓
NOTIFICATIONS
```

### Full Implementation

```php
public function newLeave(Request $request)
{
    // ── Step 1: Basic validation ──────────────────────────────────────────
    $validator = Validator::make($request->all(), [
        'id'            => 'required|exists:users,id',
        'leave_type_id' => 'required|exists:leaves_types,id',
        'start_date'    => 'required|date',
        'end_date'      => 'required|date|after_or_equal:start_date',
        'reason'        => 'nullable|string',
        // Hourly fields are validated programmatically below
        // Attachment is validated programmatically below
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = User::findOrFail($request->id);
    $leaveType = LeavesType::withTrashed()->findOrFail($request->leave_type_id);

    // ── Step 2: Rule 7 — Hourly leave validation ──────────────────────────
    // (FIXES S6: validate programmatically, not via required_if on non-existent field)
    $leaveDays = 0;
    $totalHours = null;

    if ($leaveType->is_hourly) {
        $hourlyValidator = Validator::make($request->all(), [
            'start_time' => 'required|date_format:H:i',
            'end_time'   => 'required|date_format:H:i|after:start_time',
        ]);
        if ($hourlyValidator->fails()) {
            return response()->json(['errors' => $hourlyValidator->errors()], 422);
        }

        // Enforce same-day for hourly leaves
        if ($request->start_date !== $request->end_date) {
            return response()->json(['error' => 'Hourly leaves must be on a single day.'], 422);
        }

        // Check the date is a working day for this user
        if (!WorkingDaysHelper::isWorkingDay($request->start_date, $request->id)) {
            return response()->json(['error' => 'The selected date is not a working day.'], 422);
        }

        $start = Carbon::createFromFormat('H:i', $request->start_time);
        $end = Carbon::createFromFormat('H:i', $request->end_time);
        $totalHours = $end->floatDiffInHours($start);
        $hoursPerDay = $leaveType->hours_per_day ?: 8;
        $leaveDays = round($totalHours / $hoursPerDay, 2);
    } else {
        // ── Step 3: Rule 6 — Compute working days with user's schedule ──────
        $leaveDays = WorkingDaysHelper::countWorkingDays(
            $request->start_date,
            $request->end_date,
            $request->id  // Uses user's work_schedule, falls back to company setting
        );
    }

    if ($leaveDays <= 0) {
        return response()->json(['error' => 'No working days in the selected range.'], 422);
    }

    // ── Step 4: Rule 9 — Attachment requirement ───────────────────────────
    if ($leaveType->attachment_required_after_days !== null
        && $leaveDays > $leaveType->attachment_required_after_days) {
        if (!$request->filled('attachment_base64')) {
            return response()->json([
                'error' => "A supporting document is required for leaves longer than {$leaveType->attachment_required_after_days} days."
            ], 422);
        }
    }

    // ── Step 5: Dependency check (unchanged) ──────────────────────────────
    if ($leaveType->depends_on_type_id) {
        $parentBalance = EntitlementDay::where('user_id', $request->id)
            ->where('leave_type_id', $leaveType->depends_on_type_id)
            ->activeOnDate($request->start_date)
            ->sum('remaining_days');

        if ($parentBalance > 0) {
            $parentName = LeavesType::withTrashed()->find($leaveType->depends_on_type_id)->name ?? 'parent leave';
            return response()->json([
                'error' => "You must exhaust your {$parentName} balance before using {$leaveType->name}."
            ], 422);
        }
    }

    // ── Step 6: Wallet query ──────────────────────────────────────────────
    // (FIXES S4: use activePeriodOnDate when negative balance is allowed)
    if ($leaveType->allow_negative_balance) {
        $wallets = EntitlementDay::where('user_id', $request->id)
            ->where('leave_type_id', $request->leave_type_id)
            ->activePeriodOnDate($request->start_date)  // No remaining_days > 0 filter
            ->orderBy('end_to', 'asc')
            ->get();
    } else {
        $wallets = EntitlementDay::where('user_id', $request->id)
            ->where('leave_type_id', $request->leave_type_id)
            ->activeOnDate($request->start_date)
            ->orderBy('end_to', 'asc')
            ->get();
    }

    $totalAvailable = $wallets->sum('remaining_days');

    // ── Step 7: Rule 5 — Pro-rata accrual ─────────────────────────────────
    // (FIXES H4: only apply pro-rata to current-year wallets, not rollovers)
    $effectiveAvailable = $totalAvailable;

    if ($leaveType->accrual_type === 'pro_rata_monthly') {
        if (!$user->hire_date) {
            return response()->json([
                'error' => 'Employment start date not set. Contact HR to enable pro-rata leave.'
            ], 422);
        }

        $currentYear = Carbon::parse($request->start_date)->year;
        $hireYear = $user->hire_date->year;

        // Only apply pro-rata in the hire year
        if ($currentYear === $hireYear) {
            $monthsWorked = $user->hire_date->diffInMonths(Carbon::parse($request->start_date)->endOfMonth());
            $monthsWorked = max(1, min($monthsWorked, 12));
            $accrualFraction = $monthsWorked / 12;

            // Apply pro-rata only to current-year wallets (not rollovers)
            $currentYearEntitled = $wallets->where('year', $currentYear)->sum('entitled_days');
            $currentYearRemaining = $wallets->where('year', $currentYear)->sum('remaining_days');
            $rolloverRemaining = $wallets->where('year', '!=', $currentYear)->sum('remaining_days');

            $accruedThisYear = round($currentYearEntitled * $accrualFraction, 2);
            $usedThisYear = $currentYearEntitled - $currentYearRemaining;
            $availableThisYear = max(0, $accruedThisYear - $usedThisYear);

            $effectiveAvailable = $availableThisYear + max(0, $rolloverRemaining);
        }
        // If not hire year, full entitlement is available (effectiveAvailable = totalAvailable)
    }

    // ── Step 8: Rule 5 — Negative balance extension ──────────────────────
    // (FIXES H7: correct math for remaining borrow capacity)
    if ($leaveType->allow_negative_balance) {
        $currentBalance = $totalAvailable; // can be 0 or even negative if previous borrows exist
        $negativeBorrowed = abs(min(0, $currentBalance));
        $remainingBorrowCapacity = max(0, $leaveType->max_negative_balance - $negativeBorrowed);
        $effectiveAvailable = max(0, $currentBalance) + $remainingBorrowCapacity;
    }

    // ── Step 9: Rule 2 — Balance check & overflow split ──────────────────
    $overflowDays = 0;
    $paidDays = $leaveDays;

    if ($leaveDays > $effectiveAvailable) {
        if ($leaveType->allow_wallet_overflow && $leaveType->overflow_leave_type_id) {
            // Split: paid portion uses available, rest overflows
            $paidDays = max(0, $effectiveAvailable);
            $overflowDays = $leaveDays - $paidDays;
        } else {
            return response()->json(['error' => 'Not enough entitlement days available.'], 422);
        }
    }

    // ── Step 10: Transactional create + deduct + overflow + priority ──────
    // (FIXES H2: DB::transaction wraps all writes)
    $leave = null;
    $overflowLeave = null;

    DB::transaction(function () use (
        $request, $user, $leaveType, $wallets,
        $paidDays, $overflowDays, $leaveDays, $totalHours,
        &$leave, &$overflowLeave
    ) {
        // ── Create main leave ────────────────────────────────────────
        $leave = Leave::create([
            'user_id'                => $request->id,
            'leave_type_id'          => $request->leave_type_id,
            'start_date'             => $request->start_date,
            'end_date'               => $request->end_date,
            'status'                 => 'pending',
            'reason'                 => $request->reason,
            'is_administrative'      => false,
            'total_hours'            => $totalHours,
            'start_time'             => $request->start_time,
            'end_time'               => $request->end_time,
            'attachment_base64'      => $request->attachment_base64,
            'attachment_filename'    => $request->attachment_filename,
        ]);

        // ── FIFO deduction ───────────────────────────────────────────
        // Supports driving a wallet negative when allow_negative_balance is true
        $daysLeft = $paidDays;
        foreach ($wallets as $wallet) {
            if ($daysLeft <= 0) break;

            if ($leaveType->allow_negative_balance) {
                // Can deduct even if remaining is 0; the last wallet absorbs the negative
                $deduct = $daysLeft; // Take it all from this wallet if needed
                if ($wallet->remaining_days > 0) {
                    $deduct = min($wallet->remaining_days, $daysLeft);
                }
                // If this is the last wallet and we still need more, let it go negative
                // (capped by max_negative_balance which was checked in Step 8)
            } else {
                $deduct = min($wallet->remaining_days, $daysLeft);
            }

            if ($deduct > 0 || ($leaveType->allow_negative_balance && $daysLeft > 0 && $wallet->remaining_days <= 0)) {
                // For negative balance: if all wallets are exhausted, use the last one
                if ($deduct <= 0 && $leaveType->allow_negative_balance) {
                    $deduct = $daysLeft;
                }

                $wallet->remaining_days -= $deduct;
                $wallet->save();

                $leave->deductions()->create([
                    'entitlement_id' => $wallet->id,
                    'days_deducted'  => $deduct,
                ]);

                $daysLeft -= $deduct;
            }
        }

        // ── Rule 2: Create overflow leave if needed ──────────────────
        if ($overflowDays > 0) {
            // Calculate date split: find where paid portion ends
            $paidEndDate = $request->end_date; // default
            $overflowStartDate = $request->start_date; // default

            if ($paidDays > 0) {
                $paidEndDate = WorkingDaysHelper::findEndDateForWorkingDays(
                    $request->start_date, $paidDays, $request->id
                );
                // Overflow starts on the next working day after paid portion
                $overflowStartDate = WorkingDaysHelper::nextWorkingDay(
                    Carbon::parse($paidEndDate)->addDay()->toDateString(),
                    $request->id
                );
            }

            // Update main leave's end date to the paid portion only
            if ($paidDays > 0) {
                $leave->end_date = $paidEndDate;
                $leave->save();
            }

            $overflowLeave = Leave::create([
                'user_id'         => $request->id,
                'leave_type_id'   => $leaveType->overflow_leave_type_id,
                'start_date'      => $paidDays > 0 ? $overflowStartDate : $request->start_date,
                'end_date'        => $request->end_date,
                'status'          => 'pending',
                'reason'          => $request->reason,
                'parent_leave_id' => $leave->id, // Link to parent
            ]);
            // Note: overflow leave is NOT auto-deducted here.
            // It goes through its own approval flow for the overflow leave type.
        }

        // ── Rule 1: Priority override ────────────────────────────────
        // (FIXES I3: exclude is_administrative leaves from override)
        $overlappingLeaves = Leave::where('user_id', $request->id)
            ->whereIn('status', ['approved', 'pending'])
            ->where('id', '!=', $leave->id)
            ->where('is_administrative', false)  // Never override admin-created leaves
            ->where('start_date', '<=', $request->end_date)
            ->where('end_date', '>=', $request->start_date)
            ->whereHas('leaveType', function ($q) use ($leaveType) {
                $q->where('priority_level', '>', $leaveType->priority_level);
            })
            ->with(['deductions.entitlement', 'leaveType'])
            ->get();

        foreach ($overlappingLeaves as $existingLeave) {
            // Also skip overflow children of the current leave
            if ($existingLeave->parent_leave_id === $leave->id) continue;

            $overlapStart = max($request->start_date, $existingLeave->start_date);
            $overlapEnd = min($request->end_date, $existingLeave->end_date);

            $overlapDays = WorkingDaysHelper::countWorkingDays($overlapStart, $overlapEnd, $request->id);
            if ($overlapDays <= 0) continue;

            // Refund overlap days (LIFO)
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

            // Full overlap = cancel; partial = annotate
            $existingStart = $existingLeave->start_date;
            $existingEnd = $existingLeave->end_date;

            if ($overlapStart <= $existingStart && $overlapEnd >= $existingEnd) {
                $existingLeave->status = 'cancelled';
                $existingLeave->processed_reason = "Automatically cancelled: superseded by higher-priority {$leaveType->name}.";
                $existingLeave->processed_at = now();
                $existingLeave->save();

                // Also cancel any overflow children
                Leave::where('parent_leave_id', $existingLeave->id)
                    ->whereIn('status', ['pending', 'approved'])
                    ->update([
                        'status' => 'cancelled',
                        'processed_reason' => 'Parent leave cancelled due to priority override.',
                        'processed_at' => now(),
                    ]);
            } else {
                $existingLeave->processed_reason = ($existingLeave->processed_reason ?? '') .
                    " [Partial override: {$overlapDays} day(s) superseded by {$leaveType->name}.]";
                $existingLeave->save();
            }

            // Notify
            \App\Helpers\AppHelper::instance()->notifyUser(
                $existingLeave->user_id,
                'Leave adjusted',
                "{$overlapDays} day(s) of {$existingLeave->leaveType->name} refunded due to {$leaveType->name}.",
                null,
                $existingLeave->id
            );
        }
    }); // end DB::transaction

    // ── Notifications (outside transaction — non-critical) ────────────────
    $title = "New Leave Request";
    $message = "New leave request from {$request->start_date} to {$request->end_date}";
    \App\Helpers\AppHelper::instance()->notifyUser($request->id, $title, $message, null, $leave->id);

    $usersAdminIds = User::whereHas('roles', function ($query) {
        $query->where('role_id', 1);
    })->pluck('id');
    $userName = $user->name;

    foreach ($usersAdminIds as $adminId) {
        \App\Helpers\AppHelper::instance()->notifyUser(
            $adminId,
            "New Leave Request for {$userName}",
            "Leave request from {$request->start_date} to {$request->end_date} for {$userName}",
            null,
            $leave->id
        );
    }

    $response = ['message' => 'Leave request created successfully', 'leave' => $leave];
    if ($overflowLeave) {
        $response['overflow_leave'] = $overflowLeave;
        $overflowTypeName = LeavesType::find($leaveType->overflow_leave_type_id)?->name ?? 'overflow';
        $response['overflow_notice'] = "{$overflowDays} day(s) automatically assigned as {$overflowTypeName}.";
    }

    return response()->json($response, 201);
}
```

---

## 7. Backend — AdminLeaveController (Corrected)

**File:** `app/Http/Controllers/Api/AdminLeaveController.php`

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\EntitlementDay;
use App\Models\User;
use App\Helpers\WorkingDaysHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminLeaveController extends Controller
{
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

        $walletWarning = null;
        $wallets = collect();

        if (!$request->boolean('skip_wallet_deduction')) {
            $wallets = EntitlementDay::where('user_id', $request->user_id)
                ->where('leave_type_id', $request->leave_type_id)
                ->activeOnDate($request->start_date)
                ->orderBy('end_to', 'asc')
                ->get();

            $totalAvailable = $wallets->sum('remaining_days');
            if ($totalAvailable < $leaveDays) {
                $walletWarning = "Warning: Insufficient balance ({$totalAvailable} available, {$leaveDays} requested). Leave recorded administratively.";
            }
        }

        $leave = null;

        DB::transaction(function () use (
            $request, $userAuth, $status, $leaveDays, $wallets, &$leave
        ) {
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
        });

        \App\Helpers\AppHelper::instance()->notifyUser(
            $request->user_id,
            'Administrative Leave Recorded',
            "An administrative leave has been recorded: {$request->start_date} to {$request->end_date}.",
            null,
            $leave->id
        );

        return response()->json([
            'message' => 'Administrative leave recorded successfully.',
            'leave'   => $leave,
            'warning' => $walletWarning,
        ], 201);
    }
}
```

---

## 8. Backend — UserTerminationController (Corrected)

Handles both **future leaves** (start after termination) and **spanning leaves** (start before, end after termination). **Fixes audit H3.**

**File:** `app/Http/Controllers/Api/UserTerminationController.php`

```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\User;
use App\Helpers\WorkingDaysHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UserTerminationController extends Controller
{
    public function preview(Request $request, $id)
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
        $terminationDate = $request->termination_date;

        // Leaves that start AFTER termination (will be fully cancelled)
        $futureLeaves = Leave::where('user_id', $id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date', '>', $terminationDate)
            ->with('leaveType')
            ->get()
            ->map(fn($l) => [
                'id' => $l->id, 'leave_type' => $l->leaveType?->name,
                'start_date' => $l->start_date, 'end_date' => $l->end_date,
                'status' => $l->status, 'action' => 'cancel',
            ]);

        // Leaves that SPAN the termination date (will be truncated)
        $spanningLeaves = Leave::where('user_id', $id)
            ->whereIn('status', ['pending', 'approved'])
            ->where('start_date', '<=', $terminationDate)
            ->where('end_date', '>', $terminationDate)
            ->with('leaveType')
            ->get()
            ->map(fn($l) => [
                'id' => $l->id, 'leave_type' => $l->leaveType?->name,
                'start_date' => $l->start_date, 'end_date' => $l->end_date,
                'status' => $l->status, 'action' => 'truncate',
                'new_end_date' => $terminationDate,
            ]);

        return response()->json([
            'user' => ['id' => $user->id, 'name' => $user->name],
            'termination_date'  => $terminationDate,
            'future_leaves'     => $futureLeaves,
            'spanning_leaves'   => $spanningLeaves,
            'total_affected'    => $futureLeaves->count() + $spanningLeaves->count(),
        ]);
    }

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
        $terminationDate = $request->termination_date;

        $cancelledCount = 0;
        $truncatedCount = 0;

        DB::transaction(function () use ($id, $terminationDate, $userAuth, $user, &$cancelledCount, &$truncatedCount) {
            // 1. Cancel future leaves (start > termination date)
            $futureLeaves = Leave::where('user_id', $id)
                ->whereIn('status', ['pending', 'approved'])
                ->where('start_date', '>', $terminationDate)
                ->with('deductions.entitlement')
                ->get();

            foreach ($futureLeaves as $leave) {
                foreach ($leave->deductions()->with('entitlement')->get() as $deduction) {
                    if ($deduction->entitlement) {
                        $deduction->entitlement->increment('remaining_days', $deduction->days_deducted);
                    }
                }
                $leave->status = 'cancelled';
                $leave->processed_reason = "Cancelled: employee termination on {$terminationDate}.";
                $leave->processed_at = now();
                $leave->processed_by = $userAuth->id;
                $leave->save();
                $cancelledCount++;
            }

            // 2. Truncate spanning leaves (start <= termination date < end)
            $spanningLeaves = Leave::where('user_id', $id)
                ->whereIn('status', ['pending', 'approved'])
                ->where('start_date', '<=', $terminationDate)
                ->where('end_date', '>', $terminationDate)
                ->with('deductions.entitlement')
                ->get();

            foreach ($spanningLeaves as $leave) {
                // Calculate new working days (start to termination date)
                $newDays = WorkingDaysHelper::countWorkingDays(
                    $leave->start_date, $terminationDate, $id
                );
                $originalDays = $leave->deductions->sum('days_deducted');
                $refundDays = $originalDays - $newDays;

                if ($refundDays > 0) {
                    // Refund excess days (LIFO)
                    $remaining = $refundDays;
                    $deductions = $leave->deductions()->orderBy('id', 'desc')->get();
                    foreach ($deductions as $deduction) {
                        if ($remaining <= 0) break;
                        $refund = min($deduction->days_deducted, $remaining);
                        $deduction->days_deducted -= $refund;
                        $deduction->save();
                        if ($deduction->entitlement) {
                            $deduction->entitlement->increment('remaining_days', $refund);
                        }
                        $remaining -= $refund;
                    }
                }

                $leave->end_date = $terminationDate;
                $leave->processed_reason = ($leave->processed_reason ?? '') .
                    " [Truncated: original end date was {$leave->getOriginal('end_date')}, adjusted for termination on {$terminationDate}.]";
                $leave->save();
                $truncatedCount++;
            }

            // 3. Set termination date on user
            $user->termination_date = $terminationDate;
            $user->save();
        });

        return response()->json([
            'message' => "User terminated. {$cancelledCount} leave(s) cancelled, {$truncatedCount} leave(s) truncated.",
            'user_id' => $id,
            'termination_date' => $terminationDate,
            'cancelled_leaves' => $cancelledCount,
            'truncated_leaves' => $truncatedCount,
        ]);
    }
}
```

---

## 9. Backend — LeavesTypeController (Corrected)

**Key fix (H8):** Keep the `leave_type_name` field name for backward compatibility with the existing frontend proxy.

### `new_leave_type()` — add new fields

```php
public function new_leave_type(Request $request)
{
    // ... existing auth check ...

    $validator = Validator::make($request->all(), [
        'leave_type_name'                => 'required|string|unique:leaves_types,name',
        'depends_on_type_id'             => 'nullable|exists:leaves_types,id',
        'allow_rollover'                 => 'nullable|boolean',
        // New fields:
        'priority_level'                 => 'nullable|integer|min:1|max:100',
        'allow_wallet_overflow'          => 'nullable|boolean',
        'overflow_leave_type_id'         => 'nullable|exists:leaves_types,id',
        'accrual_type'                   => 'nullable|in:upfront,pro_rata_monthly',
        'allow_negative_balance'         => 'nullable|boolean',
        'max_negative_balance'           => 'nullable|integer|min:0',
        'is_hourly'                      => 'nullable|boolean',
        'hours_per_day'                  => 'nullable|numeric|min:0.5|max:24',
        'attachment_required_after_days' => 'nullable|integer|min:1',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $leaveType = LeavesType::create([
        'name'                           => $request->leave_type_name,
        'depends_on_type_id'             => $request->depends_on_type_id,
        'allow_rollover'                 => $request->has('allow_rollover') ? $request->boolean('allow_rollover') : true,
        'priority_level'                 => $request->input('priority_level', 10),
        'allow_wallet_overflow'          => $request->boolean('allow_wallet_overflow'),
        'overflow_leave_type_id'         => $request->overflow_leave_type_id,
        'accrual_type'                   => $request->input('accrual_type', 'upfront'),
        'allow_negative_balance'         => $request->boolean('allow_negative_balance'),
        'max_negative_balance'           => $request->input('max_negative_balance', 0),
        'is_hourly'                      => $request->boolean('is_hourly'),
        'hours_per_day'                  => $request->input('hours_per_day', 8),
        'attachment_required_after_days' => $request->attachment_required_after_days,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Leave type created successfully!',
        'data'    => $leaveType
    ], 201);
}
```

### `update_leave_type()` — use `fill()` for new fields (fixes M4)

```php
public function update_leave_type(Request $request)
{
    // ... existing auth check + validation (same rules as create, plus leave_type_id) ...

    $leaveType = LeavesType::find($request->leave_type_id);
    if (!$leaveType) {
        return response()->json(['error' => 'Leave type not found'], 404);
    }

    // Core fields (manual for backward compat)
    $leaveType->name = $request->leave_type_name;
    if ($request->has('depends_on_type_id')) {
        $leaveType->depends_on_type_id = $request->depends_on_type_id;
    }
    if ($request->has('allow_rollover')) {
        $leaveType->allow_rollover = $request->boolean('allow_rollover');
    }

    // New fields — fill only those present in the request (partial update safe)
    $newFields = [
        'priority_level', 'allow_wallet_overflow', 'overflow_leave_type_id',
        'accrual_type', 'allow_negative_balance', 'max_negative_balance',
        'is_hourly', 'hours_per_day', 'attachment_required_after_days',
    ];
    $leaveType->fill($request->only($newFields));

    $leaveType->save();

    return response()->json([
        'success' => true,
        'message' => 'Leave type updated successfully!',
        'data'    => $leaveType
    ], 200);
}
```

---

## 10. Backend — UserController Updates

### `user_update()` — add work_schedule + hire_date

Add to the existing method, after the `$user->save()` call:

```php
// Work schedule (Rule 6) + Hire date (Rule 5)
if ($request->has('work_schedule')) {
    $user->work_schedule = $request->work_schedule; // array|null
    $user->save();
}
if ($request->has('hire_date')) {
    $user->hire_date = $request->hire_date;
    $user->save();
}
```

Add validation rules:
```php
'work_schedule' => 'nullable|array',
'work_schedule.*' => 'integer|min:0|max:6',
'hire_date' => 'nullable|date',
```

### `store()` — add hire_date to user creation (fixes M3)

In the `store()` method, add to validation:
```php
'hire_date' => 'nullable|date',
```

And after `User::create()`, set the hire_date:
```php
if ($request->filled('hire_date')) {
    $user->hire_date = $request->hire_date;
    $user->save();
}
```

---

## 11. Backend — Routes

Add to `routes/api.php` inside the `auth:sanctum` group:

```php
use App\Http\Controllers\Api\AdminLeaveController;
use App\Http\Controllers\Api\UserTerminationController;

// Administrative Leave
Route::post('/admin-leave', [AdminLeaveController::class, 'store'])->middleware('auth:sanctum');

// User Termination
Route::get('/terminate-user/{id}/preview', [UserTerminationController::class, 'preview'])->middleware('auth:sanctum');
Route::post('/terminate-user/{id}', [UserTerminationController::class, 'terminate'])->middleware('auth:sanctum');
```

---

## 12. Frontend — Nuxt Server Proxy Routes (NEW SECTION — fixes M1)

Every new/modified backend endpoint needs a corresponding Nuxt server route.

### New proxy routes to create:

**`server/api/admin/leave.post.ts`**
```ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

  const response = await $fetch(`${config.public.apiBase}/admin-leave`, {
    method: 'POST',
    body: {
      user_id: body.userId,
      leave_type_id: body.leaveTypeId,
      start_date: body.startDate,
      end_date: body.endDate,
      reason: body.reason,
      administrative_reason: body.administrativeReason,
      status: body.status,
      skip_wallet_deduction: body.skipWalletDeduction,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
});
```

**`server/api/admin/terminatePreview.post.ts`**
```ts
// POST (not GET, to carry body) → GET /terminate-user/{id}/preview
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

  const response = await $fetch(`${config.public.apiBase}/terminate-user/${body.userId}/preview`, {
    method: 'GET',
    params: { termination_date: body.terminationDate },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
});
```

**`server/api/admin/terminate.post.ts`**
```ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { token } = event.context;
  if (!token) throw createError({ statusCode: 403, statusMessage: 'Not authenticated' });

  const response = await $fetch(`${config.public.apiBase}/terminate-user/${body.userId}`, {
    method: 'POST',
    body: { termination_date: body.terminationDate },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response;
});
```

### Modified proxy routes:

**`server/api/leaves/newLeave.ts`** — forward new fields:
```ts
// Add to the body mapping:
attachment_base64: body.attachmentBase64 ?? null,
attachment_filename: body.attachmentFilename ?? null,
start_time: body.startTime ?? null,
end_time: body.endTime ?? null,
```

**`server/api/leaves/newLeaveType.ts`** — forward rules engine fields:
```ts
const {
  name, dependsOnTypeId, allowRollover,
  priorityLevel, allowWalletOverflow, overflowLeaveTypeId,
  accrualType, allowNegativeBalance, maxNegativeBalance,
  isHourly, hoursPerDay, attachmentRequiredAfterDays,
} = body;

const response = await $fetch(`...newLeaveType`, {
  method: 'POST',
  body: {
    leave_type_name: name,
    depends_on_type_id: dependsOnTypeId ?? null,
    allow_rollover: allowRollover !== false,
    priority_level: priorityLevel ?? 10,
    allow_wallet_overflow: allowWalletOverflow ?? false,
    overflow_leave_type_id: overflowLeaveTypeId ?? null,
    accrual_type: accrualType ?? 'upfront',
    allow_negative_balance: allowNegativeBalance ?? false,
    max_negative_balance: maxNegativeBalance ?? 0,
    is_hourly: isHourly ?? false,
    hours_per_day: hoursPerDay ?? 8,
    attachment_required_after_days: attachmentRequiredAfterDays ?? null,
  },
  headers: { Authorization: `Bearer ${token}` },
});
```

**`server/api/leaves/updateLeaveType.ts`** — same new fields as above.

**`server/api/user/editUser.ts`** — forward new user fields:
```ts
// Add to the body mapping:
work_schedule: body.workSchedule ?? undefined,
hire_date: body.hireDate ?? undefined,
```

**`server/api/user/addUser.ts`** — forward hire_date:
```ts
hire_date: body.hireDate ?? undefined,
```

---

## 13. Frontend — Types (`types/index.ts`)

### Updated interfaces:

```ts
export interface LeaveType {
  id: number | string;
  name: string;
  depends_on_type_id?: number | string | null;
  allow_rollover?: boolean;
  // Rules engine:
  priority_level?: number;
  allow_wallet_overflow?: boolean;
  overflow_leave_type_id?: number | string | null;
  accrual_type?: 'upfront' | 'pro_rata_monthly';
  allow_negative_balance?: boolean;
  max_negative_balance?: number;
  is_hourly?: boolean;
  hours_per_day?: number;
  attachment_required_after_days?: number | null;
  deleted_at?: string | null;
  [key: string]: any;
}

export interface Leave {
  id: number | string;
  user_id: number | string;
  leave_type_id: number | string;
  start_date: string;
  end_date: string;
  reason?: string;
  status_id?: number | string;
  status?: string;
  // New:
  is_administrative?: boolean;
  administrative_reason?: string | null;
  total_hours?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  attachment_base64?: string | null;
  attachment_filename?: string | null;
  parent_leave_id?: number | string | null;
  [key: string]: any;
}

export interface User {
  id: number | string;
  email: string;
  name?: string;
  roles?: Role[];
  department_id?: number | string;
  department?: { id: number | string; name: string };
  profile?: UserProfile;
  // New:
  work_schedule?: number[] | null;
  hire_date?: string | null;
  termination_date?: string | null;
  leaves?: Leave[];
  [key: string]: any;
}

// New payloads:
export interface UpdateLeaveTypePayload {
  id: string | number;
  name: string;
  dependsOnTypeId?: string | number | null;
  allowRollover?: boolean;
  // Rules engine:
  priorityLevel?: number;
  allowWalletOverflow?: boolean;
  overflowLeaveTypeId?: string | number | null;
  accrualType?: 'upfront' | 'pro_rata_monthly';
  allowNegativeBalance?: boolean;
  maxNegativeBalance?: number;
  isHourly?: boolean;
  hoursPerDay?: number;
  attachmentRequiredAfterDays?: number | null;
}

export interface AdminLeavePayload {
  userId: string | number;
  leaveTypeId: string | number;
  startDate: string;
  endDate: string;
  reason?: string;
  administrativeReason: string;
  status?: 'approved' | 'pending';
  skipWalletDeduction?: boolean;
}

export interface TerminationPreviewResponse {
  user: { id: number; name: string };
  termination_date: string;
  future_leaves: any[];
  spanning_leaves: any[];
  total_affected: number;
}

export interface EditUserPayload {
  userId: string | number;
  userName?: string;
  userEmail?: string;
  userDepartment?: string | number;
  userRole?: string | number | any[];
  userPhone?: string;
  userInternalPhone?: string;
  userTitle?: string;
  userTitleDescription?: string;
  userImage?: any;
  // New:
  workSchedule?: number[] | null;
  hireDate?: string | null;
}

export interface AddUserPayload {
  userName: string;
  userEmail: string;
  userDepartment: string | number;
  userRole: string | number;
  userPassword: string;
  userPhone?: string;
  userInternalPhone?: string;
  userTitle?: string;
  userTitleDescription?: string;
  userImage?: string;
  // New:
  hireDate?: string | null;
}
```

---

## 14. Frontend — Stores

### 14.1 New composables

**`composables/adminApiComposable.ts`**
```ts
export const recordAdminLeaveComposable = (body: AdminLeavePayload) =>
  retryFetch('/api/admin/leave', { method: 'POST', body });

export const previewTerminationComposable = (userId: string | number, terminationDate: string) =>
  retryFetch('/api/admin/terminatePreview', { method: 'POST', body: { userId, terminationDate } });

export const terminateUserComposable = (userId: string | number, terminationDate: string) =>
  retryFetch('/api/admin/terminate', { method: 'POST', body: { userId, terminationDate } });
```

### 14.2 New store: `stores/admin.ts`
```ts
export const useAdminStore = defineStore('adminStore', () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function recordAdministrativeLeave(payload: AdminLeavePayload) { ... }
  async function previewTermination(userId: string | number, terminationDate: string) { ... }
  async function terminateUser(userId: string | number, terminationDate: string) { ... }

  return { loading, error, recordAdministrativeLeave, previewTermination, terminateUser };
});
```

### 14.3 Update `leavesApiComposable.ts` — extend newLeaveComposable and leaveType composables

The `newLeaveComposable` payload type (`LeaveActionPayload`) needs new optional fields:
```ts
export interface LeaveActionPayload {
  userId: string | number;
  leaveId?: string | number;
  leaveTypeId?: string | number;
  startDate?: string;
  endDate?: string;
  reason?: string;
  status?: string | number;
  // New:
  startTime?: string;
  endTime?: string;
  attachmentBase64?: string;
  attachmentFilename?: string;
}
```

The `newLeaveTypeComposable` and `updateLeaveTypeComposable` body types need the rules engine fields (matching `UpdateLeaveTypePayload`).

---

## 15. Frontend — UI Components

### 15.1 EditLeaveType.vue — "Advanced Rules" section

Add a collapsible section below existing fields:

**Priority & Overflow (Rules 1 & 2)**
- Priority Level: number input (1–100, default 10). Helper: "Lower = higher priority."
- Allow Wallet Overflow: toggle. Helper: "Users can request more days than balance."
- Overflow Leave Type: select (shown if overflow toggle is on). Helper: "Excess days assigned to this type."

**Accrual (Rule 5)**
- Accrual Type: radio (Upfront | Monthly Pro-Rata). Helper: "Pro-rata for first-year employees."
- Allow Negative Balance: toggle (shown for any accrual type).
- Max Negative Balance: number (shown if negative toggle is on).

**Schedule & Document (Rules 7 & 9)**
- Hourly Leave: toggle. Helper: "Time range picker instead of date range."
- Hours Per Day: number (shown if hourly is on, default 8).
- Attachment Required After: number (days). Helper: "e.g. 3 = certificate needed for 4+ days."

### 15.2 EditUser.vue — work schedule + hire date

Add to the admin/HR-visible section:
- **Hire Date**: date picker (nullable). Label: "Employment Start Date".
- **Personal Work Schedule**: multi-select checkboxes for Mon–Sun (using 0=Sun values). Helper: "Leave blank to use company default."

### 15.3 NewLeave.vue — dynamic behavior

**Hourly (Rule 7):** When selected leave type has `is_hourly`:
- Hide end date, show single date picker
- Show start time + end time inputs
- Show computed: "= X hours (Y days)"

**Attachment (Rule 9):** When `attachment_required_after_days` is set:
- Watch computed day count reactively
- If days > threshold: show file input (required), hint about requirement

**Pro-rata (Rule 5):** If `accrual_type === 'pro_rata_monthly'` and user is in first year:
- Show adjusted "Available Balance" with accrual note

**Overflow (Rule 2):** If `allow_wallet_overflow` and days > available:
- Show amber banner: "X paid days + Y [Overflow Type] days"

### 15.4 AdminLeaveModal.vue

Location: Leaves Management page (admin/HR visible).

Fields: Employee (search select), Leave Type, Start/End Date, Reason (optional), Administrative Reason (required, min 10 chars), Status (Approved/Pending default Approved), Skip Wallet Deduction toggle.

### 15.5 TerminateUserModal.vue

Location: User Management page, per-user action menu.

Two-step flow:
1. **Date picker** → "Preview Impact"
2. **Impact table** showing future leaves (to cancel) and spanning leaves (to truncate) → "Confirm Termination"

---

## 16. Cross-Rule Interaction Matrix (Corrected)

| Interaction | Resolution |
|-------------|------------|
| Priority + Holiday Observer | Independent operations. Observer uses `HolidayAdjustment` log to prevent duplicates. No conflict. |
| Priority + Wallet Overflow | Overflow leaves are linked via `parent_leave_id`. Priority override finds the parent, cancels both parent and children as a unit. **Fixed via I1.** |
| Priority + Admin Action | Admin-created leaves (`is_administrative = true`) are excluded from priority override queries. **Fixed via I3.** |
| Pro-Rata + Negative Balance | Pro-rata restricts current-year wallets only. Negative balance extends from there. Math: `availableThisYear + rolloverRemaining + borrowCapacity`. |
| Pro-Rata + Rollover | Pro-rata applies only to current-year wallets (`where('year', $currentYear)`). Previous-year rollovers are fully available. **Fixed via H4.** |
| Work Schedule + Holiday Observer | Observer calls `WorkingDaysHelper::isWorkingDay()` which checks user's personal schedule. Consistent. |
| Work Schedule + Hourly | Hourly leave validates date is a working day for the user via `isWorkingDay()`. |
| Hourly + Holiday Observer | Observer checks `is_hourly` and refunds fractional amount, not flat 1 day. **Fixed via I2.** |
| Hourly + Attachment | `attachment_required_after_days` compared against `total_hours / hours_per_day` (fractional days). |
| Termination + All | Termination handles both future (cancel) and spanning (truncate) leaves. Uses standard refund mechanism. **Fixed via H3.** |
| Admin Action + All | Bypasses all rules. Wallet deducted by default (skip flag available). Clearly logged with `is_administrative = true`. |

---

## 17. Implementation Order

```
Phase 1 — Database (reversible, non-breaking)
  1. Migration 1: rules engine columns on leaves_types
  2. Migration 2: work_schedule + hire_date + termination_date on users
  3. Migration 3: admin + hourly + attachment + parent_leave_id on leaves
  4. Migration 4: decimal days_deducted in leave_deductions
  5. Migration 5: decimal entitled/remaining in entitlement_days
  6. Migration 6: holiday_adjustments table

Phase 2 — Backend Models (non-breaking additions)
  7. Update LeavesType.php (fillable, casts, overflowType relationship)
  8. Update User.php (fillable, casts)
  9. Update Leave.php (fillable, casts, childLeaves/parentLeave relationships)
  10. Add EntitlementDay::scopeActivePeriodOnDate()
  11. Create HolidayAdjustment model

Phase 3 — Backend Services & Helpers
  12. Refactor WorkingDaysHelper (add userId param + new utility methods)
  13. Create PublicHolidayService
  14. Create PublicHolidayObserver + register in AppServiceProvider
  15. Update PublicHolidaysController (storeBatch, destroy, destroyBatch call service)

Phase 4 — Backend Controllers
  16. Rewrite LeavesController::newLeave() with all rules
  17. Update LeavesTypeController (new fields in create + fill-based update)
  18. Update UserController (work_schedule + hire_date in store + user_update)
  19. Create AdminLeaveController
  20. Create UserTerminationController
  21. Add new routes to api.php

Phase 5 — Frontend Proxy Layer
  22. Create server/api/admin/leave.post.ts
  23. Create server/api/admin/terminatePreview.post.ts
  24. Create server/api/admin/terminate.post.ts
  25. Update server/api/leaves/newLeave.ts (new fields)
  26. Update server/api/leaves/newLeaveType.ts (rules engine fields)
  27. Update server/api/leaves/updateLeaveType.ts (rules engine fields)
  28. Update server/api/user/editUser.ts (work_schedule, hire_date)
  29. Update server/api/user/addUser.ts (hire_date)

Phase 6 — Frontend Types, Composables & Stores
  30. Update types/index.ts (all new interfaces + payload types)
  31. Create composables/adminApiComposable.ts
  32. Update composables/leavesApiComposable.ts (new payload fields)
  33. Update composables/userApiComposable.ts (new payload fields)
  34. Create stores/admin.ts
  35. Update stores/leaves.ts (new LeaveType fields awareness)

Phase 7 — Frontend UI
  36. Update EditLeaveType.vue (Advanced Rules section)
  37. Update EditUser.vue (hire date + work schedule)
  38. Update NewLeave.vue (hourly picker, attachment, overflow banner, pro-rata display)
  39. Create AdminLeaveModal.vue
  40. Add "Record Administrative Leave" button to Leaves management page
  41. Create TerminateUserModal.vue (two-step flow)
  42. Add "Terminate Employee" to user action menu

Phase 8 — Testing
  43. Unit: WorkingDaysHelper with custom user schedules
  44. Unit: PublicHolidayService (create + delete + batch + hourly leaves)
  45. Unit: Negative balance math (zero balance, partial borrow, max borrow)
  46. Integration: Priority override (full overlap, partial overlap, admin exclusion)
  47. Integration: Wallet overflow (split dates, linked leaves, parent cancellation)
  48. Integration: Termination (future cancel, spanning truncate)
  49. Integration: Pro-rata accrual (first year vs subsequent, with rollovers)
  50. E2E: Admin leave modal + termination flow
```

---

## 18. Notes & Edge Cases

1. **Rule 4 (Past Cancellation No-Cascade):** Already correct in current code. Add a UI warning: "Cancelling will restore X days. Unpaid leaves taken after exhaustion will NOT be auto-converted."

2. **Attachment storage:** Uses base64 in JSON body (matching existing profile image pattern). Stored in `attachment_base64` column. For very large files, consider a future migration to file storage. **Fixes M2** by avoiding multipart encoding.

3. **Hourly leaves are single-day:** Enforced in validation. `start_date === end_date`.

4. **Admin reason visibility:** `administrative_reason` visible to admin/HR only. Frontend hides it for regular users based on role check.

5. **Termination vs. deactivation:** Setting `termination_date` does NOT change `user_status`. HR must separately deactivate. This is intentional (payroll date vs. access revocation).

6. **Error messages:** All backend error messages use English keys. The frontend should map these to i18n translations in the error handling layer. **Addresses M5** — add error code mapping over time rather than blocking on full i18n.

7. **Overflow recursion guard:** If `overflow_leave_type_id` points to a type that also has `allow_wallet_overflow = true`, the overflow leave is created as a simple pending leave — it does NOT auto-split recursively. Only the original request triggers the split.

8. **Decimal precision:** `decimal(8,2)` throughout. Round to 2 decimal places in all calculations.

9. **Hardcoded leave_type_id === 5:** Noted as tech debt. Should be replaced with a `is_monthly_allocation` flag on `LeavesType` in a future iteration.
