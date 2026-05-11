# Leave Policies: Greek Framework & Rule Generalities

To ensure the system works seamlessly for Greek labor law (which interacts closely with the Ergani system and strict e-EFKA rules) while remaining commercially viable for international sales, we must move away from hardcoded logic and introduce a **Rules Engine** attached to `LeaveType` (and `User`).

Here is how the previously discussed scenarios map to Greek Law, and the proposed Database Generalities needed to satisfy any global requirement.

---

### 1. Sick During Vacation (Overlapping Leaves)
* **Greek Law:** Sickness legally supersedes Annual Leave. If an employee falls sick during vacation and provides a doctor's certification, the Annual Leave is interrupted, the sick days are categorized as Sick Leave (for e-EFKA), and the Annual Leave days are refunded.
* **The Generality:** Add a `priority_level` (integer) to `leave_types`. Sick Leave gets Priority 1; Annual Leave gets Priority 2.
  * *Rule:* If an employee requests a Priority 1 leave on dates that overlap with an approved Priority 2 leave, the system executes an automated split and refunds the overlapping days to the Priority 2 wallet.

### 2. Unpaid vs. Paid Mixed Requests
* **Greek Law:** Annual paid leave *cannot* be legally replaced or combined directly with unpaid leave. Unpaid leave represents a formal suspension of the employment contract and requires a mutual agreement document. They must be stringently separated for Ergani.
* **The Generality:** Add a strict validation layer: `allow_wallet_overflow`. 
  * *Rule:* If `false` (Greek compliance), a user cannot request 5 days of Paid Leave if their wallet only has 2 days; they must explicitly request 2 Paid days and a separate request for 3 Unpaid days. If an international client sets this to `true`, the system will auto-split the request into paid and unpaid segments under the hood.

### 3. Late Public Holiday Declaration
* **Greek Law:** Mandatory public holidays and Sundays do not consume annual leave days.
* **The Generality:** Implement a background observer on the `PublicHoliday` model.
  * *Rule:* When an Admin adds a new public holiday, the system queries all `leave_requests` (status: approved/pending) spanning that date. It reduces the `days_deducted` by 1 and refunds the wallet automatically.

### 4. Past Leave Cancellation History
* **Greek Law:** Mistakes happen, and HR can cancel a past leave to correct records.
* **The Generality:** Avoid "smart" historical cascades. If HR cancels an old Paid Leave, the wallet balance increases. If the user later took Unpaid Leave (because their wallet was empty at the time), the system **does not** auto-convert it.
  * *Rule:* Manual conversion by HR remains required for historical changes, ensuring no unexpected payroll anomalies occur without a human in the loop.

### 5. Borrowing from the Future (Negative Balances) & First-Year Accruals
* **Greek Law:** First-year employees accrue leave proportionally (pro-rata) based on months worked (e.g., ~1.66 days/month). While employers *can* voluntarily grant them in advance, the legal entitlement is strict.
* **The Generality:** Add three properties to the Entitlement / LeaveType logic:
  1. `accrual_type`: `upfront` vs. `pro-rata_monthly`
  2. `allow_negative_balance`: `boolean`
  3. `max_negative_balance`: `integer`
  * *Rule:* This allows Greek instances to use `pro-rata` without absolute blocking if the employer is flexible (e.g., `allow_negative_balance: true`), while allowing other jurisdictions strict upfront limits.

### 6. The Shift-Worker Anomaly
* **Greek Law:** Leave calculation strictly depends on whether the employee works a 5-day or 6-day week, or a registered part-time schedule.
* **The Generality:** The current `company-settings/work-week` is insufficient on its own. 
  * *Rule:* Add a `work_schedule` JSON array or relationship to the `User` model. If a user tries to take a week off, the system checks their personal schedule first (e.g., Mon-Wed). Only if this is `null` does it fall back to the company default, ensuring part-time staff are deducted correctly.

### 7. Half-Day and Hourly Deductions
* **Greek Law:** Standard annual leave is granted in full days. However, specific statutory leaves (like school visits for parents or blood donation) can be segmented in hours.
* **The Generality:** Add an `is_hourly` boolean to `LeaveType`.
  * *Rule:* If `true`, the frontend dynamically switches from a date-range picker to a date + hour picker, and deductions are stored as decimals (e.g., `0.5` or `0.125`) in the `leave_deductions` table.

### 8. Resignation with Future Leaves
* **Greek Law:** Upon termination, any unused annual leave MUST be compensated monetarily.
* **The Generality:** Add a standard "Deactivate/Terminate User" action.
  * *Rule:* Alongside deactivating login, this action scans for leaves with a `start_date` > termination date, automatically soft-deletes them, and restores the wallets. This guarantees the final `entitlement_days` query matches the exact payout owed.

### 9. Document Requirements (Medical Certificates)
* **Greek Law:** For sick leave exceeding 3 days, the employer generally needs medical documentation because e-EFKA coverage kicks in. 
* **The Generality:** Add `attachment_required_after_days` (integer) to `LeaveType`.
  * *Rule:* If set to `3`, any request of 4 days or more dynamically makes the file attachment input mandatory on the frontend, blocking submission otherwise. This perfectly abstracts the Greek e-EFKA requirement into a generic rule.
