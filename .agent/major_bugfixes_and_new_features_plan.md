# Major Bugfixes & New Features — Implementation Plan

This plan addresses 9 issues: 5 bugs, 3 UX/consistency improvements, and 1 new feature (reporting). Each section lists the root cause, exact files + line numbers, and the fix. Backend work is flagged where required.

---

## 1. Accrual Type Validation Error

### Root Cause

Frontend sends `"pro_rata_monthly"` / `"upfront"` (EditLeaveType.vue:127,131,346 → newLeaveType.ts:39 / updateLeaveType.ts:43). Backend validation rule rejects one of them. Needs direct inspection of Laravel's `LeavesTypeController::store/update` enum rule to confirm the expected string — likely `"pro_rata"` vs `"pro_rata_monthly"` drift.

### Fix

1. **Backend (Laravel)** — open `LeavesTypeController` and inspect the `accrual_type` `in:` validation rule. Align with the migration enum defined in `AGENT_CHANGES.md §19` (`upfront` / `pro_rata_monthly`). If migration is already `pro_rata_monthly`, fix the validation rule. If the migration itself deviates, either:
   - (a) write a migration that changes the enum, **or**
   - (b) change frontend to match backend — but only if the value is semantically equivalent (`pro_rata_monthly` is clearer, keep it).
2. **Frontend verification** — no change needed if backend is fixed. Run a create + update roundtrip to confirm.
3. **Locale keys** — keep `settings.accrualType.monthlyProRata` (presentation) decoupled from the value `pro_rata_monthly` (transport). Current setup is fine.

### Files

- `LeavesTypeController.php` (backend)
- `components/Settings/EditLeaveType.vue:127,131,346`
- `server/api/leaves/newLeaveType.ts:39`, `updateLeaveType.ts:43`

---

## 2. Invitation Sender Details Intermittently Missing

### Root Cause

`Invitations.vue:113-120` reads `inv.sender?.name` / `inv.sender?.profile?.profile_image_base64` with silent optional chains. When the backend response omits the `sender` relation (not always eager-loaded), the UI renders a blank avatar + empty name. `Invitation.sender` is typed optional in `types/models.ts` so TypeScript doesn't catch it.

There is no frontend fallback to hydrate from the already-loaded `userStore.allUsers` array via `user_id_from`.

### Fix

**Primary (backend):** ensure `InvitationController::list()` always eager-loads both relations:
```php
Invitation::with(['sender.profile', 'receiver.profile'])->...
```
Include `profile` so `profile_image_base64` is available.

**Secondary (frontend — defense in depth):** in `Invitations.vue`, add a computed helper that falls back to `userStore.allUsers.find(u => u.id === inv.user_id_from)` when `inv.sender` is missing. Same for `receiver` → `user_id_to`. This guards against future regressions.

**Tertiary (types):** leave `sender?` optional (backend might theoretically omit if user deleted), but the fallback lookup handles that case cleanly.

### Files

- `InvitationController.php` (backend — eager load relations)
- `components/Settings/Invitations.vue:113-120`
- `types/models.ts` (no change, but document the fallback contract)

---

## 3. Admin Leave Button — Restrict to HR + Admin Only

### Root Cause

`pages/yearly-leaves.vue` (the Record Leave button) currently gates on `permissionsStore.can('profile_leave_balance', 'accept_leave')`, which in `stores/permissions.ts:20` is allowed for `['admin', 'hr-manager', 'head']`. This leaks admin leave creation to department heads.

### Fix

Add a dedicated permission entry in `stores/permissions.ts`:
```ts
leaves: {
  ...existing,
  record_admin_leave: ['admin', 'hr-manager'],
}
```
Update `pages/yearly-leaves.vue` button `v-if` to `permissionsStore.can('leaves', 'record_admin_leave')`.

Add the new key to the `Permissions.vue` settings matrix so the UI reflects it. Update both locales with the label.

### Files

- `stores/permissions.ts` (add permission)
- `pages/yearly-leaves.vue` (change `v-if`)
- `components/Settings/Permissions.vue` (add row to matrix)
- `locales/en.json` + `locales/el.json` (add permission label)

---

## 4. UI Consistency — Inputs, Dates, Workdays

Four sub-fixes, all touching well-defined files.

### 4a. AdminLeaveModal user picker → MultiSelect

`components/Leaves/AdminLeaveModal.vue:12-18` uses `CustomSelect` for a single user. Use case (HR slapping admin leaves on company-closed days) needs bulk assignment.

**Fix:** swap to `CustomMultiSelect`, change `selectedUserId` ref to `selectedUserIds: number[]`. In `submitForm`, loop over IDs and call `adminLeave` once per user. Show aggregate success/error toast.

### 4b. NewLeave.vue — native select → CustomSelect

`components/Home/NewLeave.vue:93-109` uses native `<select>` for leave type. Replace with `CustomSelect` following the `EditUser.vue:150` pattern. Map `leaveTypes` to `{ label, value }` options.

### 4c. All date inputs → flatpickr

Six native `<input type="date">` exist:
- `AdminLeaveModal.vue:39,45`
- `EditUser.vue:171,358` (hire_date, both modes)
- `PublicHolidays.vue:169` (form.date)
- `TerminateUserModal.vue:16`

**Fix:** create a shared `FlatpickrInput.vue` in `components/shared/` wrapping flatpickr initialization with the same token styling (`useFormStyles.input`). Accept `modelValue`, `minDate`, `maxDate`, `disable`, `placeholder` props. Emit `update:modelValue` with local-time `YYYY-MM-DD` (reuse the `toLocalDateStr` helper from `NewLeave.vue` to avoid the UTC bug documented in `AGENT_CHANGES.md §12`).

Replace all six occurrences with `<FlatpickrInput v-model="..." />`.

### 4d. EditUser workdays → toggle pills

`EditUser.vue:174-189` (modal) and `360-375` (inline) render native checkboxes for `work_schedule`.

**Fix:** build a `WeekdayPills.vue` component in `components/shared/` — 7 buttons (Sun–Sat), each a pill with two states: active (primary red `bg-[#EA021A] text-white`) and inactive (border `border-[#DFEAF2] text-gray-500 dark:border-neutral-600`). Click toggles inclusion in the `work_schedule` array. This doubles as a reusable component for the WorkWeek settings page which currently has its own bespoke day toggle — unify both.

### Files

- `components/Leaves/AdminLeaveModal.vue`
- `components/Home/NewLeave.vue`
- `components/shared/FlatpickrInput.vue` (new)
- `components/shared/WeekdayPills.vue` (new)
- `components/Settings/EditUser.vue`
- `components/Settings/PublicHolidays.vue`
- `components/Settings/TerminateUserModal.vue`
- `components/Settings/WorkWeekSettings.vue` (migrate to shared pill)

---

## 5. Delete User — Icon Size + Empty Modal

### Root Cause

- Delete icon in `UsersList.vue:352-366` is `16×19`, visually dwarfed by the new Terminate button added in change #19.
- Delete modal opens an empty `BaseModal` because `modalComponent` computed (`UsersList.vue:568`) returns `null` for `modalType === 'delete'` — there's no `DeleteUserModal` component.

### Fix

1. Create `components/Settings/DeleteUserModal.vue` following the `TerminateUserModal.vue` pattern:
   - Shows user name, email, avatar
   - Warning: "This will permanently delete the user and all their leave records. Consider using Terminate instead if the user is simply leaving the company."
   - Confirmation text input (type user's name to confirm) — prevents mis-clicks
   - Red `useFormStyles.submitBtn` for final action
2. Wire into `UsersList.vue:568` `modalComponent` computed.
3. Normalize icon sizing: make both Terminate and Delete buttons same visual weight — use 20×20 icons inside `h-[32px] w-[32px]` button containers with hover background. Apply consistent spacing in the action column.

### Files

- `components/Settings/DeleteUserModal.vue` (new)
- `components/Settings/UsersList.vue:352-366,394-402,568`
- `locales/en.json` + `locales/el.json` (delete confirmation strings)

---

## 6. Documents — Role-Based Access Alongside User-Based

### Root Cause

Current schema has `target_type` enum (`'all' | 'user'`) + `target_user_id`. No way to say "visible to all admins + HR".

Requirement: role restrictions are a **separate filter**, not a shortcut for user-selection.

### Fix

**Data model change (backend):** rather than expand the enum, introduce a pivot table pattern that cleanly supports OR-ing both filters:

```
company_documents
  - id, file, name, uploaded_by, created_at
  - target_type enum('all', 'restricted')  ← rename 'user' to 'restricted'

company_document_users (pivot)
  - document_id, user_id

company_document_roles (pivot)
  - document_id, role_id
```

Visibility rule for user X (role R):
```
target_type = 'all'
  OR exists(company_document_users where document_id=D and user_id=X)
  OR exists(company_document_roles  where document_id=D and role_id=R)
```

Migration script needed: existing `target_user_id` rows → one row in `company_document_users`; `target_type` values remapped (`'user'` → `'restricted'`).

**Frontend:**
- `types/document.ts`: update `DocumentTargetType = 'all' | 'restricted'`, add `target_user_ids: number[]`, `target_role_ids: number[]` to `CompanyDocument`.
- `UploadDocumentModal.vue`: replace the single `CustomSelect` target picker with:
  - Radio/toggle: `All` | `Restricted`
  - When `Restricted`: two `CustomMultiSelect`s side-by-side — **Users** and **Roles** — both optional, at least one must have a selection. Validation message if both empty.
- `DocumentCard.vue`: badge now shows composite — `All`, or `N users`, `M roles`, or both.
- `stores/documents.ts`: visibility split remains (company vs. personal) but `personalDocuments` predicate becomes "current user ID in target_user_ids OR current user role in target_role_ids".

### Files

- Backend: migration + `CompanyDocumentController` + model relations
- `types/document.ts`
- `components/Documents/UploadDocumentModal.vue`
- `components/Documents/DocumentCard.vue`
- `stores/documents.ts`
- `composables/documentsApiComposable.ts`
- `locales/en.json` + `locales/el.json`

---

## 7. Reports Tab (Admin + HR Only)

### Scope

New sidebar entry → new page → dashboard with toggleable widgets → PDF export.

### Permissions

`stores/permissions.ts`:
```ts
reports: {
  view:   ['admin', 'hr-manager'],
  export: ['admin', 'hr-manager'],
}
```
Add row to `Permissions.vue` matrix + locale labels.

### Sidebar

`SidebarMenu.vue`: add a `<li v-if="permissionsStore.can('reports', 'view')">` with `NuxtLink to="/reports"`, icon, and locale label.

### Page Structure — `pages/reports.vue`

Top bar:
- Year selector (`CustomSelect` with years, e.g., 2024–2028)
- Department filter (`CustomMultiSelect`, optional)
- Leave type filter (`CustomMultiSelect`, optional)
- "Customize" button → opens a `BaseModal` with a `CustomMultiSelect` of widget names — user picks which widgets to show
- "Export PDF" button (only if `can('reports', 'export')`)

Widget grid (12-col, each widget declares span):

| Widget | Visualization | Reuses |
|---|---|---|
| Leaves by month (total days) | bar chart | Chart.js (already installed) |
| Leaves by department | horizontal bar chart | Chart.js |
| Leave type usage share | donut / pie | Chart.js |
| Headcount over time | line chart | Chart.js |
| Top users by leave days | ranked list with `UserAvatar` | native |
| Pending approvals queue depth | single large number + `RadialBarChart` | existing |
| Upcoming terminations | list with `UserAvatar` | native |
| Balance depletion risk | list (users with high usage %) | existing `RadialBarChart` |

Each widget is a self-contained component in `components/Reports/*.vue`, accepts filters as props, owns its own data fetch via a composable. Widget visibility preferences persist to `localStorage` per user (same pattern as dashboard customization — reuse or parallel the `DashboardCustomizer` logic).

### Backend

One aggregate endpoint per widget, or a single `/reports/summary?year=&dept_ids=&leave_type_ids=` that returns all aggregates. Prefer the latter to minimize round-trips. Backend: new `ReportsController` with methods per aggregate, SUM/COUNT/GROUP BY queries over `leaves`, `leave_deductions`, `entitlement_days`. Gate route with a middleware checking admin/HR role.

### PDF Export

Install `html2pdf.js` (html-to-pdf, client-side, simplest). On export click:
1. Clone the visible widget grid into an off-screen container with print-optimized styling (white bg, no hover states, serif title).
2. Include header: company name, report date, applied filters.
3. Call `html2pdf().from(element).set({margin, filename: 'report-YYYY-MM-DD.pdf'}).save()`.

If PDF fidelity becomes an issue with Chart.js canvas rendering, fall back to `html2canvas` pre-rasterization (`html2pdf.js` already uses it internally).

### Files

- `stores/permissions.ts`, `components/Settings/Permissions.vue`
- `components/SidebarTopbar/SidebarMenu.vue`
- `pages/reports.vue` (new)
- `components/Reports/*.vue` (new — one per widget)
- `stores/reports.ts` (new)
- `composables/reportsApiComposable.ts` (new)
- `server/api/reports/summary.get.ts` (new proxy)
- Backend `ReportsController`
- `locales/*.json` (labels for widgets, filters, export)
- `package.json` (+ `html2pdf.js`)

---

## 8. Holidays Year Fetch Bug

### Root Cause

`PublicHolidays.vue:501` calls `useHolidays(selectedYear.value)` **once at mount**. The composable builds the query string at init time (`holidaysApiComposable.ts:51-59`), so `year=2026` is frozen. `nextYear()` / `prevYear()` (522-528) only call `refreshHolidays()`, which refetches the same URL.

### Fix

Convert `useHolidays` to accept a reactive ref or watch-trigger:

**Option A (preferred):** change `useHolidays(year)` to accept a `Ref<number>` and rebuild the URL via `computed`:
```ts
export const useHolidays = (yearRef: Ref<number | undefined>) => {
  const url = computed(() => yearRef.value ? `/api/holidays?year=${yearRef.value}` : '/api/holidays');
  const key = computed(() => `holidays-${yearRef.value ?? 'all'}`);
  return useAsyncData(key.value, () => $fetch(url.value), { watch: [yearRef] });
}
```
Then in `PublicHolidays.vue`: `const { data, ... } = useHolidays(selectedYear)` — pass the ref directly.

**Option B (minimal change):** in `PublicHolidays.vue`, replace `refreshHolidays()` calls with a direct re-fetch using the new year, updating local state. Works but keeps the leaky abstraction. Go with Option A.

### Files

- `composables/holidaysApiComposable.ts:51-59`
- `components/Settings/PublicHolidays.vue:501,522-528`

---

## 9. Phone Input with Country Code Dropdown

### Root Cause

`EditUser.vue:115-135` uses a plain `<input>` for `phone`. No country code, no flag, no international format support.

### Approach

Install **`intl-tel-input`** (framework-agnostic, mature, includes flag sprites, ~100KB). Wrap it in a project-styled component.

### Implementation

1. `npm install intl-tel-input`.
2. Create `components/shared/PhoneInput.vue`:
   - Internally uses `intl-tel-input` instance on an `<input>` ref.
   - Apply `useFormStyles.input` tokens to the wrapper and input. Override intl-tel-input's default selector styling to match the `CustomSelect` look: 40px height, `border-[#DFEAF2]`, `rounded-[8px]`, dark mode variants.
   - Props: `modelValue` (string, E.164 format e.g. `+302101234567`), `label`, `required`.
   - Emits: `update:modelValue` on valid input (using `getNumber(intlTelInputUtils.numberFormat.E164)`).
   - Exposes `isValid()` method via `defineExpose` for parent-driven validation (`isValidNumber()` from the lib).
3. Swap `EditUser.vue:115-135` phone input for `<PhoneInput v-model="formPhone" />`.
4. For `internal_phone` (extension) — keep plain number input (not a phone number, it's an extension).
5. Data migration: existing values are 10-digit strings without country code. On load, if the stored value doesn't start with `+`, default the country selector to Greece (`gr` → `+30`) and prepend. Save back in E.164 on next update. New users stored in E.164 from the start.

### Files

- `package.json` (+ `intl-tel-input`)
- `components/shared/PhoneInput.vue` (new)
- `components/Settings/EditUser.vue:115-135`
- `types/models.ts` (update comment on `phone` field — now E.164 format)
- `locales/*.json` (country search placeholder string)

---

## Suggested Execution Order

Order by dependency + risk:

1. **#1 accrual type** — backend fix only, unblocks leave type creation now
2. **#2 invitation sender** — backend + tiny FE fallback
3. **#3 admin leave permission** — pure FE, low risk
4. **#8 holidays year** — pure FE, isolated composable refactor
5. **#5 delete user modal** — isolated new component
6. **#4 UI consistency** — touches many files but parallel-safe; build shared components (FlatpickrInput, WeekdayPills) first, then swap call-sites
7. **#9 phone input** — isolated new component + one call-site
8. **#6 documents roles** — needs backend migration coordination
9. **#7 reports** — largest; do last when foundation (CustomSelect patterns, flatpickr wrapper) is stable

---

## Testing Notes

- Manual verification per issue is sufficient for bugs 1, 2, 3, 8.
- UI consistency (#4, #5, #9) — click through every affected modal in both locales and both color modes.
- Documents (#6) — test matrix: doc visible to user only / role only / both / all.
- Reports (#7) — smoke-test each widget with zero-data, one-user, large dataset. Confirm PDF renders charts correctly.
