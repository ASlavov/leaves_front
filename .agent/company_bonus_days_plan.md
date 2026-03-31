# Company Bonus Days — Feature Plan

**Date:** 2026-03-27
**Status:** Planning

---

## 1. Overview

HR grants employees 5 "Company Bonus Days" each year. These days have strict consumption rules:

1. **Consumption order:** Bonus days can only be used _after_ the employee has exhausted all available paid leave — including any prior-year rollover balance still in-window.
2. **No rollover:** Any unused bonus days are forfeited at Dec 31 of the grant year. They cannot be extended or rolled into the next year.
3. **Quantity:** 5 days (subject to change per employee at HR discretion).

---

## 2. Architecture Decision: Hardcode vs. Configurable Dependency

### The question

Paid leave has a stable, predictable ID. Can we hardcode `depends_on_type_id = <paid_leave_id>` in the codebase?

### Recommendation: **Do NOT hardcode. Make it configurable.**

**Reasons:**

- If a future admin renames, recreates, or splits paid leave into multiple types, the hardcoded ID becomes stale silently — no warning, just broken ordering logic.
- The `depends_on_type_id` column is already being added to `leaves_types`. It costs nothing extra to expose it in the EditLeaveType admin UI.
- "The paid leave ID is stable" is an assumption that is true _today_ and could break on any DB migration that truncates and re-seeds.

**Decision:** Store `depends_on_type_id` in the database, set it via the admin UI (EditLeaveType form), and enforce it at submission time via the existing planned chain-check logic. No hardcoding in application code.

---

## 3. The Consumption Chain

```
[Prior-year paid leave wallet (if rolled over, end_to within grace period)]
           ↓  exhausted first (FIFO by end_to)
[Current-year paid leave wallet]
           ↓  depends_on_type_id = paid_leave_id
[Company Bonus Days wallet]
           ↓  end_to = Dec 31 (hard cap, no rollover)
```

The FIFO wallet ordering already handles the "prior-year rollover first" rule naturally — the rolled-over wallet has an earlier `end_to` than the current-year wallet, so it is consumed first.

The `depends_on_type_id` guard then enforces: **Company Bonus Days cannot be touched until paid leave balance reaches zero.**

---

## 4. Schema Changes

### 4a. `leaves_types` table (migration)

```php
// Already planned: depends_on_type_id
$table->unsignedBigInteger('depends_on_type_id')->nullable();
$table->foreign('depends_on_type_id')->references('id')->on('leaves_types')->nullOnDelete();

// NEW: allow_rollover flag
$table->boolean('allow_rollover')->default(true);
```

`allow_rollover = false` means:

- The backend year-end rollover routine **skips** this leave type entirely.
- The frontend **hides/disables** the rollover toggle when this leave type is selected in EditEntitlement.
- `end_to` must be Dec 31 of the grant year (enforced/defaulted by the backend).

### 4b. No other schema changes needed.

---

## 5. Backend Changes

### 5a. `LeavesType` model

- Add `allow_rollover` to `$fillable`.
- Add `depends_on_type_id` to `$fillable` (already planned).
- Accessor / relationship: `dependsOnType()` → `belongsTo(LeavesType::class, 'depends_on_type_id')`.

### 5b. Leave submission — `depends_on_type_id` chain check

When a leave request is submitted for a type that has `depends_on_type_id` set:

1. Sum the employee's remaining balance for the parent leave type (all active wallets for that type, as of today).
2. If remaining balance > 0 → **reject** with error: _"You must exhaust your [Paid Leave] balance before using [Company Bonus Days]."_
3. If remaining balance = 0 → allow submission and deduct from bonus days wallet(s) via FIFO.

This check is recursive if chains are ever nested (e.g., A → B → C), but one level is sufficient for now.

### 5c. Year-end rollover routine

When extending wallets for the new year:

```php
// Skip leave types with allow_rollover = false
$types = LeavesType::where('allow_rollover', true)->get();
```

Bonus Days wallets are never extended — they simply expire.

### 5d. Leave type creation/update endpoint

Accept and persist `depends_on_type_id` and `allow_rollover` from the request body.

### 5e. Entitlement creation (`store` / `importMassLeaves`)

When `allow_rollover = false` on the leave type:

- Force `end_to = YYYY-12-31` where YYYY is derived from `start_from`.
- Ignore any `rollover_previous` / `rollover_until` params even if sent.
- Return a validation error if the client sends an `end_to` beyond Dec 31.

---

## 6. Frontend Changes

### 6a. `types/index.ts`

Add to `LeaveType`:

```ts
allow_rollover?: boolean;
```

### 6b. EditLeaveType component (new or extended)

Add two fields to the leave type form:

1. **"Depends on Leave Type"** — optional `CustomSelect` dropdown listing all non-archived leave types (excluding self). Maps to `depends_on_type_id`. Label: _"Only usable after this type is exhausted"_.
2. **"Allow Rollover"** — toggle (same pill switch pattern as other toggles). Default: on. Label: _"Extend unused balance into next year"_. When off, show info text: _"Unused days will be forfeited at year end."_

### 6c. EditEntitlement component

When the selected leave type has `allow_rollover === false`:

- Hide the "Extend remaining balance from previous year" rollover toggle entirely.
- Set `end_to` input to Dec 31 of the year derived from `start_from` and make it read-only (or at minimum warn if changed).

Logic:

```js
const selectedLeaveType = computed(() =>
  leavesStore.leavesData.leavesTypes.find((t) => t.id === leaveTypeId.value),
);
const allowRollover = computed(() => selectedLeaveType.value?.allow_rollover !== false);
```

Show rollover section only when `allowRollover.value` is true.

### 6d. `locales/en.json` + `locales/el.json`

New keys needed:

```json
"settings": {
  "dependsOnLeaveType": "Only usable after",
  "dependsOnLeaveTypePlaceholder": "Select prerequisite leave type (optional)",
  "allowRollover": "Allow rollover to next year",
  "allowRolloverOff": "Unused days forfeited at year end"
}
```

```json
"errors": {
  "leaves": {
    "prerequisiteNotExhausted": "You must use all [type] days before requesting this leave."
  }
}
```

### 6e. `stores/leaves.ts`

Ensure `getLeavesTypes` returns `allow_rollover` and `depends_on_type_id` from backend (they should come through automatically if the model returns them).

---

## 7. HR Workflow — How to Set Up Company Bonus Days

### One-time setup (first use):

1. Go to **Settings → Leave Types → Add new leave type**.
2. Name: _"Company Bonus Days"_ (or equivalent in Greek).
3. Set **"Depends on"** → _"Paid Leave"_.
4. Uncheck **"Allow Rollover"**.
5. Save.

### Each year:

1. Go to **Settings → Leave Days → Add new entitlement**.
2. Select leave type: _Company Bonus Days_.
3. Select employees (or "all" by leaving blank in mass-assign).
4. Set days: 5.
5. Set start date: Jan 1 of the new year.
6. End date is auto-locked to Dec 31 (read-only).
7. No rollover toggle shown (it's disabled for this type).
8. Save.

---

## 8. Risk Assessment

| Risk                                                     | Likelihood           | Mitigation                                                                                                                                                        |
| -------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin changes `depends_on_type_id` mid-year              | Low                  | UI shows clear warning; all existing leave requests already submitted are unaffected                                                                              |
| HR forgets to set `allow_rollover = false`               | Medium               | Default should be `true` (safe); only bonus days type explicitly needs false. Consider adding a guard: if `depends_on_type_id` is set, suggest disabling rollover |
| Employee submits bonus days before exhausting paid leave | Prevented by backend | Chain-check at `newLeave()` rejects with clear message                                                                                                            |
| Bonus days wallet not created for an employee            | HR workflow gap      | No automated grant; HR must manually add entitlement each year (same as paid leave today)                                                                         |
| Dec 31 expiry creates confusion if leave spans year-end  | Edge case            | Leave submission validates `to_date <= end_to` of wallet; already handled by FIFO check                                                                           |

---

## 9. Implementation Order

1. **Migration:** Add `allow_rollover` (+ `depends_on_type_id` if not already added).
2. **Backend model + controller:** `LeavesType` fillable, `dependsOnType` relationship, submission chain-check, rollover routine guard, entitlement creation end_to enforcement.
3. **Server routes (Nuxt):** No new routes needed — leave type create/update endpoints already exist; just pass new fields through.
4. **Frontend types:** Add `allow_rollover` to `LeaveType`.
5. **EditLeaveType:** Add "Depends on" dropdown + "Allow Rollover" toggle.
6. **EditEntitlement:** Conditionally hide rollover section + lock end_to.
7. **i18n:** Add new keys.
8. **Test:** Create the leave type, assign 5 days, verify submission is blocked until paid leave is exhausted, verify Dec 31 expiry, verify no rollover offered.

---

## 10. Out of Scope

- Automatic annual grant of bonus days (would require a scheduled job; HR grants manually for now).
- Notification to employees when bonus days are about to expire (separate feature).
- Partial consumption ordering UI (employees cannot choose which wallet to draw from — FIFO is invisible to them).
