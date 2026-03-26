# Leave Management Architecture Revamp: The "Wallet/Bucket" Model

## Overview
The system has outgrown its initial "flat" architecture. The workaround of manually renaming types and creating duplicate "2025" vs. "2026" categories occurs because the data model doesn't natively support "validity periods," "rollover logic," or "dependencies." To resolve this without destroying historical data, the system must shift from a **"Flat Type" model** to a **"Wallet/Bucket" model**.

---

## 1. The Core Shift: The "Wallet/Bucket" Concept
Currently, the `leave_types` table is treated as the source of truth for time and rules. Instead, `leave_types` should be completely static—it should only define the *category* of the leave (e.g., "Paid Leave", "Sick Leave").

All complex logic (years, rollovers, balances) must live in the `entitlements` table. Think of entitlements as individual **Wallets** given to an employee. A single employee can hold multiple wallets for the exact same Leave Type, each with its own expiration date.

---

## 2. Solving Problem 1: Rollovers & Automatic Deductions (FIFO)

### The Backend Schema Change
The backend already has an `entitlements` concept with `year`, `start_from`, and `end_to` dates. You need to start enforcing `start_from` and `end_to` as strict "Validity Windows" rather than just metadata.

### The Logic Flow
1. **No More Renaming:** "Paid Leave" is created once and stays "Paid Leave" forever.
2. **Granting Days:** In 2025, the admin grants 20 days. The system creates a Wallet for the user: Type="Paid Leave", Days=20, Valid=`2025-01-01` to `2025-12-31`.
3. **The Rollover:** When the admin decides to extend unused 2025 days, they *do not* create a new leave type. The backend simply updates the existing 2025 Wallet's `end_to` date to `2026-03-31`. 
4. **The Consumption (FIFO Algorithm):** When the employee requests "Paid Leave" in February 2026, the backend pulls all active Wallets for "Paid Leave." It sorts them by the `end_to` date (First In, First Out) and automatically deducts the days from the Wallet expiring in March first. Spillover deductions apply to the later wallet.

---

## 2.1. The UI/UX Implementation for Rollovers (HR/Admin Experience)

Since the frontend already uses a unified `EditEntitlement.vue` modal for single and mass operations, the rollover process should be seamlessly integrated into the annual "Mass Import" workflow.

### The UI Flow (Inside `EditEntitlement.vue` Modal)
When an Admin selects "Mass Import" (or single edit) to grant the standard days for the *new* year (e.g., granting 20 days of Paid Leave for 2026), they will see the standard fields:
* Users (Multi-select)
* Leave Type (Select)
* Entitled Days (Input)
* Year (Input)
* Start Date / End Date

**The Addition:** Add a toggle switch directly below these fields: 
`[Toggle] Extend remaining balance from the previous year?`

If the admin toggles this to **ON**, a conditional date picker appears:
`Extend until: [ Date Picker (Defaults to March 31st of the selected year) ]`

### The API Payload Shift
When the modal is submitted, the payload sent to `/api/entitlement/massLeaves` is appended with the rollover instructions:

```json
{
  "userIds": [1, 2, 3, 4, 5],
  "leave_type_id": 1,
  "entitled_days": 20,
  "year": 2026,
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "rollover_previous": true,
  "rollover_until": "2026-03-31"
}
```

### Backend Execution
When Laravel receives this payload, it does two things:
1. Creates the new 2026 Wallets for the users.
2. Finds the previous year's wallets (2025) for the same `leave_type_id` and `userIds`. If those wallets have a balance > 0, it updates their `end_to` column to `2026-03-31`.

*UX Result:* The HR Admin accomplishes both tasks (granting new days and extending old ones) in one single modal submission without needing to know who has exactly how many days left.

---

## 3. Solving Problem 2: Sequential / Bonus Leaves
To handle the "Extra 5 days" that can only be taken *after* normal paid leaves are exhausted, you need to introduce dependency mapping.

### The Schema Change
Add a new, nullable column to your `leave_types` table called `depends_on_type_id`.

### The Logic Flow
1. **Setup:** Standard "Paid Leave" (ID: 1). Admin creates "Bonus Leave" (ID: 2) and sets `depends_on_type_id = 1`.
2. **The Check:** When an employee tries to submit a `new_leave` request for the "Bonus Leave," the backend queries all active Wallets for the parent type (ID 1). 
3. **The Validation:** If the user has *any* remaining days in their parent Paid Leave wallets, the API rejects the request with a clean 403/422 error: *"You must exhaust your standard Paid Leaves before requesting Bonus Leaves."*

---

## 4. Solving Problem 3: UI Clutter & Archiving
Hard-deleting a leave type breaks historical records in components like `YearlyLeaves.vue` because the IDs will no longer map to a name.

### The Schema Change
No new column is needed. The `leaves_types` table already has a `deleted_at` column, meaning Laravel's `SoftDeletes` trait is already in the schema. The fix is purely behavioural.

### The Logic Flow
1. **Archive via Soft Delete:** The admin presses "Archive" (renamed from "Delete"). The backend calls `$leaveType->delete()`, which sets `deleted_at` — it does not remove the row.
2. **Frontend Filtering:** The `leaves_types` GET endpoint has two modes:
   - Default (no param): Eloquent's standard query automatically excludes soft-deleted rows → used for new-request dropdowns.
   - `?include_archived=true`: Adds `->withTrashed()` → used for admin management views and historical report joins.
3. **Restore:** The admin management UI gets a "Restore" button for archived types, calling a `restore` endpoint (`PATCH /leave-types/{id}/restore`) which calls `$leaveType->restore()`.
4. **Historical Preservation:** Because the row is never physically removed, all historical `leave_type_id` joins continue to resolve to the correct name.

---

## 5. Deduction Tracking — Required for Correct FIFO Restoration

The current system records which wallet (`entitlement_days` row) was debited by matching `user_id + leave_type_id + year` at the time of rejection/cancellation. This breaks with multiple overlapping wallets (e.g., a rolled-over 2025 wallet coexisting with a 2026 wallet), because a single leave request may debit from two wallets simultaneously.

### The Schema Change
Introduce a `leave_deductions` join table that records exactly which wallet(s) were debited and by how many days for each leave request:

```
leave_deductions
  id
  leave_id          FK → leaves.id (cascade delete)
  entitlement_id    FK → entitlement_days.id (set null on delete)
  days_deducted     integer
  timestamps
```

### The Logic Flow
1. **On Submission:** After the FIFO loop deducts days across one or more wallets, a row is inserted into `leave_deductions` for each wallet touched.
2. **On Rejection/Cancellation:** Instead of re-querying by year, the system iterates `$leave->deductions` and restores `days_deducted` back to the correct wallet.
3. **Accuracy guarantee:** Even if the user has three overlapping wallets and the leave spans all three, every debit is precisely reversed.