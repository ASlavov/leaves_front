# Manual Testing Guide — Rules Engine (Legalities v2)

## Prerequisites / Setup

- A working local dev environment (Laravel backend + Nuxt frontend both running).
- At least two users: one **Admin/HR** and one **regular user**.
- At least one **approved entitlement wallet** for the regular user before each test.
- Use the **Settings → Leave Types** screen to configure leave types per test.

---

## 1. Leave Type Configuration (EditLeaveType)

**Goal:** Verify the rules-engine fields can be saved and round-trip correctly.

1. Open **Settings → Leave Types**, click to add or edit a leave type.
2. Click **Show Advanced Rules** to expand the collapsible section.
3. Set each of the following and save:
   - `Priority Level` = `5`
   - `Allow Wallet Overflow` = ON → select an "Unpaid" overflow type
   - `Accrual Type` = `Pro-Rata Monthly`
   - `Allow Negative Balance` = ON → set `Max Negative Balance` = `3`
   - `Is Hourly` = ON → set `Hours Per Day` = `8`
   - `Attachment Required After` = `3`
4. Save and reopen the leave type.

**Expected:** All values persist exactly as entered. Overflow type selector is visible only when overflow is ON. Hours per day input is visible only when hourly is ON. Max negative balance input is visible only when negative balance is ON.

---

## 2. Hourly Leaves

**Setup:** Configure a leave type with `is_hourly = true`, `hours_per_day = 8`. Ensure the user has an entitlement wallet for it.

**Test 2a — Basic hourly submission:**
1. Open **Home → New Leave**, select the hourly leave type.
2. Observe: the end-date field disappears; only a single date picker remains.
3. Two time inputs appear (`Start Time`, `End Time`).
4. Enter a valid working day as the date. Enter `09:00` → `13:00`.
5. Observe: a conversion note shows `4 hrs / 8 hrs/day = 0.5 days`.
6. Submit.

**Expected:** Leave created with `total_hours = 4`, `start_time = 09:00`, `end_time = 13:00`. The wallet is deducted by `0.5 days`.

**Test 2b — Multi-day rejection:**
1. Enter a start date and attempt to set an end date on a different day (the UI should prevent this, but confirm the backend rejects it too by tampering via DevTools or Postman: `POST /api/leaves/newLeave` with `start_date ≠ end_date` and `is_hourly = true`).

**Expected:** `422` error — "Hourly leaves must start and end on the same day."

**Test 2c — End time before start time:**
1. Enter `14:00` as start, `09:00` as end.

**Expected:** Form validation blocks submission. Error shown near time inputs.

**Test 2d — Non-working day:**
1. Pick a Saturday or Sunday date (or a public holiday).

**Expected:** `422` error — "Selected date is not a working day."

---

## 3. Attachment Requirement

**Setup:** Configure a leave type with `attachment_required_after_days = 3`. Ensure the user has ≥ 5 days entitlement.

**Test 3a — Below threshold, no attachment needed:**
1. Submit a 2-day leave request of this type.

**Expected:** No file upload UI appears. Submission succeeds without attachment.

**Test 3b — Above threshold, attachment required:**
1. Submit a 4-day leave request of this type.
2. Observe: a file upload input appears automatically.
3. Try to submit **without** uploading a file.

**Expected:** Submission blocked. Error: "Attachment is required for leaves longer than 3 days."

**Test 3c — With attachment:**
1. Upload a `.jpg`, `.png`, or `.pdf` file.
2. Submit.

**Expected:** Leave created. Backend stores `attachment_base64` and `attachment_filename`.

---

## 4. Wallet Overflow (Auto-Split)

**Setup:**
- Create a "Paid Leave" type with `allow_wallet_overflow = true`, `overflow_leave_type_id` pointing to an "Unpaid Leave" type.
- Give the user exactly **3 days** entitlement in "Paid Leave".

**Test 4a — Overflow warning in UI:**
1. Open New Leave → select "Paid Leave".
2. Select a 5-working-day range.
3. Observe: an amber warning banner appears — "3 paid + 2 overflow days".

**Expected:** Warning is visible and mathematically correct.

**Test 4b — Overflow submission:**
1. Submit the 5-day leave.

**Expected:** Two leaves are created:
- Main leave: `start_date` → end of paid portion (3 days), `leave_type_id` = Paid Leave.
- Overflow child leave: starts the next working day, `leave_type_id` = Unpaid Leave, `parent_leave_id` pointing to main leave.
- Paid wallet deducted to 0. Unpaid wallet deducted by 2.
- API response contains an `overflow_notice` field.

**Test 4c — Overflow disabled:**
1. Turn off `allow_wallet_overflow` on the leave type.
2. Attempt the same 5-day submission.

**Expected:** `422` — "Not enough entitlement days available."

---

## 5. Priority Override

**Setup:**
- Create "Sick Leave" with `priority_level = 1` (high priority).
- Create "Vacation" with `priority_level = 10` (low priority).
- Approve a "Vacation" leave for the user covering next week (e.g. Mon–Fri).
- Ensure the user has wallets for both types.

**Test 5a — Sick leave supersedes vacation:**
1. Log in as the user. Submit a "Sick Leave" for Wednesday of the same week.

**Expected:**
- The Sick Leave is created and approved.
- The overlapping "Vacation" leave is cancelled automatically.
- The Vacation wallet is refunded the cancelled days.
- The user receives a notification about the adjustment.

**Test 5b — Lower priority cannot supersede higher:**
1. Now try submitting a "Vacation" leave that overlaps an existing approved "Sick Leave".

**Expected:** The Vacation leave is created normally without affecting the Sick Leave (lower priority does not cancel higher).

---

## 6. Pro-Rata Accrual

**Setup:**
- Create a leave type with `accrual_type = pro_rata_monthly`.
- Set the user's `hire_date` to a date in the **current year** (e.g. July 1st of this year).
- Grant the user 24 days entitlement for this year.

**Test 6a — Entitlement capped to accrued days:**
1. Open New Leave → select this type.
2. Observe: available days shown is **not** 24 but the pro-rated amount.
   - Hired July 1 = 6 months worked = `6/12 × 24 = 12 days`.
3. Attempt to submit a 13-day leave.

**Expected:** `422` — not enough entitlement (effective available ≈ 12 days, accounting for already-used days).

**Test 6b — Submission within pro-rated cap:**
1. Submit a 5-day leave.

**Expected:** Leave created. Wallet deducted by 5.

**Test 6c — Missing hire date:**
1. Remove `hire_date` from the user's profile.
2. Attempt to submit a leave of this type.

**Expected:** `422` — "Hire date is required for pro-rata accrual types."

---

## 7. Negative Balance

**Setup:**
- Create a leave type with `allow_negative_balance = true`, `max_negative_balance = 3`.
- Give the user **0 days** remaining in this wallet.

**Test 7a — Borrow within limit:**
1. Submit a 2-day leave of this type (wallet is at 0).

**Expected:** Leave created. Wallet goes to `-2` days remaining.

**Test 7b — Borrow at exact limit:**
1. Submit a 1-day leave (wallet now at -2; 1 more borrow remaining before hitting -3 cap).

**Expected:** Leave created. Wallet at `-3`.

**Test 7c — Exceed borrow limit:**
1. Submit a 1-day leave (wallet at -3, cap reached).

**Expected:** `422` — not enough entitlement (borrow capacity exhausted).

---

## 8. Dependency Check

**Setup:**
- "Vacation" type with no dependency.
- "Bonus Days" type with `depends_on_type_id = Vacation`.
- Give user 5 days Vacation and 5 days Bonus Days.

**Test 8a — Parent not exhausted:**
1. Submit a "Bonus Days" leave while the user still has Vacation days remaining.

**Expected:** `422` — "You must exhaust your Vacation balance before using Bonus Days."

**Test 8b — Parent exhausted:**
1. Use all Vacation days first (submit and get a Vacation leave approved).
2. Now submit a "Bonus Days" leave.

**Expected:** Leave created successfully.

---

## 9. Per-User Work Schedule

**Setup:** Company work week = Mon–Fri. Set one user's `work_schedule` to Mon–Thu only (days `[1,2,3,4]`) via **Settings → Edit User**.

**Test 9a — Excluded day skipped in count:**
1. Submit a leave for this user spanning Mon–Fri (5 calendar working days for normal users).

**Expected:** Leave records `4 working days` (Friday excluded for this user).

**Test 9b — Normal user unaffected:**
1. Submit the same date range for another user with no custom schedule.

**Expected:** Leave records `5 working days`.

---

## 10. Administrative Leave

**Setup:** Log in as Admin or HR Manager.

**Test 10a — Record leave for a user:**
1. Navigate to **Yearly Leaves**.
2. Click the **"Record Leave"** button (visible to Admin/HR only).
3. `AdminLeaveModal` opens. Select an employee, leave type, date range (e.g. 3 days), and enter a reason.
4. Submit.

**Expected:** Leave created with `is_administrative = true` and status `approved`. No entitlement deduction occurs.

**Test 10b — Bypass balance check:**
1. Pick a user with **0 entitlement** for the chosen leave type.
2. Record the leave anyway.

**Expected:** Leave created successfully. No `422` error.

**Test 10c — Regular user cannot access:**
1. Log in as a regular user.

**Expected:** "Record Leave" button is not visible on Yearly Leaves.

---

## 11. User Termination

**Setup:** Log in as Admin or HR. Ensure the target user has at least one future-dated approved or pending leave.

**Test 11a — Preview impact:**
1. Go to **Settings → Users**, edit the target user, click **"Terminate User"** (or however the modal is triggered).
2. Enter a termination date.
3. Click **"Preview Impact"** (step 1 of the modal).

**Expected:** Step 2 shows a list of leaves that will be cancelled (future starts) and any spanning leaves that will be truncated. A worked-days and pro-rated entitlement summary is shown.

**Test 11b — Confirm termination:**
1. Check the confirmation checkbox ("I understand this action is permanent…").
2. Click **"Confirm"** (red button).

**Expected:**
- User's `termination_date` is set and status becomes `inactive`.
- All pending/approved leaves after the termination date are cancelled.
- Spanning leaves (start ≤ termination_date < end) are truncated to termination_date.
- Toast success shown. Page reloads.

**Test 11c — Back button:**
1. In step 2, click **"Back"**.

**Expected:** Returns to date-entry step without making any changes.

---

## 12. Retroactive Public Holiday Refund

**Setup:** Ensure a user has an **approved leave** covering next Thursday. Thursday is currently not a public holiday.

**Test 12a — Add a holiday inside an approved leave:**
1. As Admin, go to **Settings → Public Holidays**.
2. Add next Thursday as a recurring or moving holiday.

**Expected:**
- The approved leave's day count is reduced by 1.
- The entitlement wallet is refunded 1 day.
- A record is created in `holiday_adjustments` (verifiable via DB or API).

**Test 12b — Remove the holiday:**
1. Delete the holiday you just added.

**Expected:**
- The approved leave's day count goes back up by 1.
- The wallet is re-deducted by 1 day.
- A `charge` record is created in `holiday_adjustments`.

**Test 12c — Hourly leave refund is fractional:**
1. Create an approved hourly leave (e.g. 4 hrs = 0.5 days) on a specific date.
2. Add that date as a public holiday.

**Expected:** The wallet is refunded `0.5` days (not a full day).

---

## Edge Cases & Regression Checks

| Scenario | Expected |
|---|---|
| Regular user hits "Record Leave" route directly via URL | Redirected / 403 |
| Submit hourly leave on a public holiday | `422` — not a working day |
| Overflow leave type is deleted after being set | FK set to `null` (nullOnDelete); overflow silently disabled |
| Submit leave with `accrual_type = upfront` (no pro-rata) | Entitlement not pro-rated; full wallet balance available |
| Two users with same leave type — one has custom schedule, one doesn't | Each gets correct working-day count independently |
| Admin leave recorded for user with no wallet | Succeeds (no deduction) |
| Terminate user with no future leaves | Succeeds with "0 future leaves cancelled" in response |
