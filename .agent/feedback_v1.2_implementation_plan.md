# Feedback v1.2 — Implementation Plan & Explanations (Revised)

Feedback received: 2026-04-29. Revised: 2026-04-29.
Each section: **Explanation** (≤5 sentences) + **Implementation Plan** + **Seeder** where applicable.

---

## 1. Login/Logout — Reload on Profile Page Logs User Out

### Explanation

When a user hard-reloads a page, Nuxt performs an SSR pass that makes a server-side `/me` call to Laravel. Because the Nuxt server proxy does not forward the incoming browser cookie to Laravel, the request arrives unauthenticated and Laravel returns 401. `retryFetch.ts` treats any 401 as a logout signal and clears the session. This is correct behavior for a truly expired session, but wrong for a valid one — the fix is ensuring the `Cookie` header is forwarded in every server-side proxy call that requires authentication. No logout logic changes are needed.

### Implementation Plan

1. **Identify SSR auth proxy routes**: Search all files under `server/api/` for routes that call the Laravel backend but do not forward the `Cookie` header. The pattern should be `headers: { Authorization: \`Bearer ${token}\` }` — the `Cookie` header is usually missing.
2. **Fix forwarding**: In each relevant proxy route, add:
   ```ts
   const cookieHeader = getHeader(event, 'cookie') ?? '';
   // then in the fetch headers:
   headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader, ... }
   ```
3. **Specifically verify `server/api/me.ts`** (or whichever route restores the session on SSR) — this is the most likely culprit.
4. **Test**: Hard-reload `/settings`, `/home`, and `/calendar` as a logged-in user and confirm no spurious logout occurs.
5. **Files**: All files under `server/api/` that proxy authenticated requests, primarily `server/api/me.ts`.

---

## 2. WFH Leave Request — Auto-Accept (Already Partially Implemented — Bug Fix Only)

### Explanation

The `auto_approve` feature is already fully implemented end-to-end: `EditLeaveType.vue` has the checkbox, `LeavesController::newLeave()` checks the flag and sets `status = 'approved'`, and the migration exists. However, `auto_approve` is missing from `LeavesType::$fillable`, so every save silently drops the field — the checkbox saves nothing. This is a one-line backend fix. Additionally, the "Work from home" leave type in the seeder should have `auto_approve: true` by default so fresh installations are correctly configured without manual setup.

### Implementation Plan

1. **Backend model fix**: In `app/Models/LeavesType.php`, add `'auto_approve'` to `$fillable` and `'auto_approve' => 'boolean'` to `$casts`. This unblocks the already-written controller save logic.
2. **Verify controller**: Confirm both `new_leave_type()` and `update_leave_type()` in `LeavesTypeController.php` pass `auto_approve` to `$leaveType->fill(...)` or direct assignment. The explore agent confirmed both do — no change needed there.
3. **Test**: Toggle `auto_approve` on a leave type in Settings, submit a leave of that type as a user — confirm it appears as `approved` immediately.
4. **No frontend changes needed** — the checkbox, form binding, and payload already exist in `EditLeaveType.vue:153-160`.

### Seeder

Update `database/seeders/LeavesTypeSeeder.php`. Change the flat name array to a structured array so the "Work from home" type is seeded with `auto_approve: true`:

```php
$leavesTypes = [
    ['name' => 'Πληρωμένη άδεια',                    'auto_approve' => false],
    ['name' => 'Άδεια μητρότητας',                   'auto_approve' => false],
    ['name' => 'Άδεια πατρότητας',                   'auto_approve' => false],
    ['name' => 'Επιπλέον ημέρες DigitalWise',         'auto_approve' => false],
    ['name' => 'Work from home',                      'auto_approve' => true],
    ['name' => 'Αρρώστια',                            'auto_approve' => false],
    ['name' => 'Ειδική άδεια ( Για άλλους λόγους )', 'auto_approve' => false],
];

foreach ($leavesTypes as $type) {
    LeavesType::updateOrCreate(['name' => $type['name']], $type);
}
```

Change `create` → `updateOrCreate` on `['name']` so re-running the seeder is idempotent.

---

## 3. Leave Balance — Next Month's Available Days

### Explanation

The dashboard cards show current `remaining_days`, which for `pro_rata_monthly` types reflects only what has accrued so far this year. The primary request is to let users see their projected available balance for upcoming months — e.g., "If I want to take a week off in June, how many days will I have?" The projection is computable client-side: `(total_entitled_days / 12) * target_month_number - days_already_used`. A secondary, smaller task is adding a visible label indicating whether the shown balance is for the full year or accumulated to date.

### Implementation Plan

1. **`Metrics.vue` — time scope label**: Below the days-remaining figure, add a small badge. If `leave.accrual_type === 'upfront'` → show `$t('leaves.annualBalance')`. If `'pro_rata_monthly'` → show `$t('leaves.accruedToDate')`. The `accrual_type` field must be present in `leavesAvailableDays` items (verify the backend serializes it; if not, join it from `leavesTypes`).
2. **Pro-rata projected balance popover**: On the `Metrics.vue` card, when `accrual_type === 'pro_rata_monthly'`, add a small "Next months ›" link below the badge. Clicking it opens an inline popover (not a modal — keep it lightweight) showing a mini-table: | Month | Projected Balance | with rows for the remaining months of the current year.
3. **Projection formula** (client-side, no new API needed):
   ```ts
   const monthlyAccrual = totalEntitledDays / 12;
   const projectedForMonth = (m: number) =>
     Math.max(0, (monthlyAccrual * m) - daysUsed);
   // where m = month number (1–12), daysUsed = entitled_days - remaining_days
   ```
4. **Popover component**: A small `<div>` absolutely positioned below the "Next months" link, dismissed on outside-click (`onClickOutside` from VueUse — already used in the codebase). Style with `bg-white dark:bg-neutral-800 border rounded shadow p-3`.
5. **Locale keys**: `leaves.annualBalance`, `leaves.accruedToDate`, `leaves.projectedBalance`, `leaves.nextMonths`.
6. **Files**: `components/Home/Metrics.vue`, `locales/en.json`, `locales/el.json`.

### Seeder

No seeder needed — this is purely a display enhancement over existing data.

---

## 4. Calendar — Four Additions

### 4a. Status Icons on Events (✓ / ⌛)

**Explanation**: The `extendedProps.status` field is already on every event. This is a purely cosmetic template change in the custom event slot — no backend work needed.

**Plan**: In `Calendar.vue` inside `#monthGridEvent`, add after the title:
```html
<span v-if="calendarEvent.extendedProps.status === 'approved'" class="ml-1 text-[10px]">✓</span>
<span v-else-if="calendarEvent.extendedProps.status === 'pending'" class="ml-1 text-[10px]">⌛</span>
```

**Seeder**: None.

---

### 4b. Admin Accept / Decline on Event Click

**Explanation**: Currently clicking an event opens Schedule-X's built-in popup which has no action buttons. Admin/HR need accept/decline controls directly from the calendar. The existing `@click="setEventColor(calendarEvent)"` handler is the hook — we extend it to also store the selected event and open a custom modal.

**Plan**:
1. Remove `createEventModalPlugin()` from the calendar init (it provides the default popup we're replacing).
2. Add `selectedEvent = ref(null)` and extend `setEventColor` to also set `selectedEvent.value = calendarEvent`.
3. Create `components/Calendar/CalendarEventModal.vue` using `BaseModal`. Props: the selected event object. Shows: user name + avatar (look up from `userStore.allUsers` by `extendedProps.userId`), leave type, date range, status badge. If `can('profile_leave_balance', 'accept_leave')` and status is `'pending'`: green Accept + red Decline buttons calling `leavesStore.acceptLeave(id)` / `leavesStore.declineLeave(id)`, then closes and refreshes calendar events.
4. In `Calendar.vue`: `<CalendarEventModal v-if="selectedEvent" v-model="selectedEvent" />`.

**Seeder**: None.

---

### 4c. Click on a Day to Create Leave / Admin Leave

**Explanation**: Schedule-X exposes an `onClickDate` callback in the calendar config. Wiring this to a pre-filled NewLeave form gives users a much faster submission path without leaving the calendar page.

**Plan**:
1. In `initializeCalendar()` in `Calendar.vue`, add to the config:
   ```ts
   callbacks: {
     onClickDate(dateString: string) { openNewLeaveForDate(dateString); },
   }
   ```
2. `openNewLeaveForDate(date)`: sets `prefilledStartDate = ref('')`, opens a small choice modal: "New Leave Request" / (if admin/HR) "Administrative Leave". Choosing the first opens `NewLeave` modal with `startDate` pre-filled; choosing the second opens `AdminLeaveModal` with `startDate` pre-filled.
3. Pass `prefilledStartDate` as a prop to both modals; both already have a `startDate` field — just pre-populate it on open.
4. Verify the exact Schedule-X callback key name against the installed version (`@schedule-x/calendar`) — it may be `onClickDay` rather than `onClickDate`.

**Seeder**: None.

---

### 4d. iCal Export Link

**Explanation**: An iCal subscription URL lets users import leave events into any calendar app (Google, Apple, Outlook) and keep them updated. The backend generates a standards-compliant `.ics` file; the frontend exposes a download button.

**Plan**:
1. **Backend**: Add `GET /api/calendar/ical` to `routes/api.php` with `auth:sanctum`. New method in a `CalendarController` (or existing controller): builds VCALENDAR string — one VEVENT per approved leave visible to the current user (same visibility scope as `allUserLeaves`). Headers: `Content-Type: text/calendar; charset=utf-8`, `Content-Disposition: attachment; filename="leaves.ics"`.
2. **Nuxt proxy**: `server/api/calendar/ical.get.ts` — proxies the request, forwards token and cookie, returns the response with content-type preserved.
3. **Frontend**: In `Calendar.vue` header area, add an `<a>` tag pointing to `/api/calendar/ical` with `download` attribute. Style as a secondary button alongside the filters.
4. **Files**: Backend `CalendarController.php`, `routes/api.php`, `server/api/calendar/ical.get.ts`, `Calendar.vue`.

**Seeder**: None.

---

## 5. Org Chart — Two Additions

### 5a. Click on User → Opens Profile

**Explanation**: A click handler on the node card (outside edit mode) navigates to the user's profile in Settings. The edit-mode buttons already use `.stop` so they won't bubble.

**Plan**:
- In `OrgChartNode.vue`, add `const router = useRouter()` and a `goToProfile` method:
  ```ts
  const goToProfile = () => {
    if (!props.editMode) router.push(`/settings?tab=edit-profile&userId=${props.node.user_id}`);
  };
  ```
- Add `@click="goToProfile"` and `cursor-pointer` to the outer card div (only when `!editMode`).

**Seeder**: None.

---

### 5b. Vertical Sibling Stacking + Sticky Header

**Explanation**: The current `flex flex-row` children layout causes unlimited horizontal growth when there are many siblings. Switching children to `flex flex-col` keeps the tree within the viewport width. The page title and edit button need `position: sticky; top: 0` so they remain accessible while scrolling through a tall tree.

**Plan**:

**Vertical stacking in `OrgChartNode.vue`:**
- Change children container (line 63): `class="flex flex-col gap-4 mt-4 relative items-center"` (was `flex gap-4 mt-8 relative`).
- Replace the horizontal branching connector lines with a simple left-side vertical rail: a single `w-px h-full bg-gray-300` div on the left of each child, connecting it to the parent above. Remove all the `h-px` horizontal lines.
- Move arrows: change `&larr;`/`&rarr;` labels to `&uarr;`/`&darr;`. The `position`-swap logic in `OrgChartPage::moveNode` is orientation-agnostic — no change needed there.

**Sticky header in `OrgChartPage.vue`:**
- Extract the title + button row (lines 3–31) into a dedicated `<div>` with `class="sticky top-0 z-10 bg-white dark:bg-neutral-900 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-700"`.
- The outer container changes to `class="flex flex-col h-full"` (remove `overflow-x-auto` from the root; let the inner scrollable area handle overflow).
- Add a scrollable inner wrapper: `<div class="flex-grow overflow-auto p-4 sm:p-6 lg:px-8">` around the tree content.

**Seeder**: None.

---

## 6. Company Documents — Five Issues

### 6a. Document Source Methods — Configurable via Settings Tab (not removal)

**Explanation**: Instead of hard-removing Google Docs, all three source types (Google Doc, SharePoint, File Upload) remain available, but a new Settings tab lets admins toggle which methods are active for their company. A company that doesn't use SharePoint simply disables it; one that wants to deprecate Google Docs can do so. This is a company-level setting stored via the existing `CompanySetting` model.

**Plan**:
1. **Backend**: Use the existing `CompanySetting::get()` / `CompanySetting::set()` pattern. Key: `document_source_methods`. Value: JSON object `{ "google_doc": true, "sharepoint": true, "file": true }`. Add a `GET /api/settings/document-sources` and `PUT /api/settings/document-sources` endpoint in `CompanySettingsController` (two new methods, same pattern as `getWorkWeek` / `updateWorkWeek`).
2. **Nuxt proxy**: `server/api/settings/documentSources.get.ts` + `documentSources.put.ts`.
3. **Store**: Extend `stores/workWeek.ts` pattern — or create `stores/documentSettings.ts` with `fetchDocumentSources()` and `updateDocumentSources(methods)` actions. Expose via `centralStore`.
4. **New Settings tab** `components/Settings/DocumentSourceSettings.vue`: Three toggle rows (one per source type) using the existing toggle pattern from `WorkWeekSettings.vue`. Only visible to admin/HR (`can('company_documents', 'modify')`). Add as a new tab entry in `pages/settings.vue`.
5. **`UploadDocumentModal.vue`**: Source type pill buttons are conditionally rendered based on `documentSettingsStore.enabledMethods`. If only one method is enabled, skip the pill step and pre-select it.
6. **Permissions**: Add `document_settings: { view: ['admin', 'hr-manager'], modify: ['admin', 'hr-manager'] }` to the permissions matrix.
7. **Files**: Backend `CompanySettingsController.php` (2 new methods), `routes/api.php`; `server/api/settings/documentSources.get.ts` + `.put.ts`; `stores/documentSettings.ts`; `components/Settings/DocumentSourceSettings.vue`; `pages/settings.vue`; both locale files.

### Seeder

New `CompanySettingsSeeder.php` (or extend existing if one exists):
```php
use App\Models\CompanySetting;

CompanySetting::updateOrCreate(
    ['key' => 'document_source_methods'],
    ['value' => json_encode(['google_doc' => true, 'sharepoint' => true, 'file' => true])]
);
```
Add `$this->call(CompanySettingsSeeder::class)` to `DatabaseSeeder.php`.

---

### 6b. Add Group (Department) Targeting

**Explanation**: Documents can target all users, specific individuals, or specific roles. Adding department targeting lets an admin assign a document to e.g. the "Engineering" group and every member sees it automatically, without listing individuals.

**Plan**:
1. **Backend migration**: Create `company_document_departments` pivot (`document_id FK`, `department_id FK`, composite PK with cascade delete).
2. **Model**: Add `targetDepartments()` BelongsToMany to `CompanyDocument.php`.
3. **Controller visibility**: Add `->orWhereHas('targetDepartments', fn($q) => $q->whereIn('departments.id', $userDeptIds))` to `scopeForUser`. Fetch `$userDeptIds` from the user's department membership.
4. **`store()` / `update()`**: Accept `target_department_ids[]`, sync with `$doc->targetDepartments()->sync(...)`.
5. **Frontend**: Add third `CustomMultiSelect` for departments in `UploadDocumentModal.vue` restricted section. `deptOptions` from `departmentsStore`.
6. **`DocumentCard.vue`**: Add a group-count badge alongside user/role badges.
7. **Types**: Add `target_departments?: { id: number; name: string }[]` to `CompanyDocument`.

**Seeder**: None (pivot data is user-generated; department seed is already handled by `DepartmentSeeder`).

---

### 6c. Max File Size: 20MB → 30MB

**Explanation**: The limit needs to be raised in three places: frontend validation, backend request validation, and PHP's server configuration. A 30MB binary file encodes to ~40MB in base64, so PHP's `post_max_size` must accommodate that overhead.

**Plan**:
1. **Frontend `UploadDocumentModal.vue`**: `file.size > 30 * 1024 * 1024`.
2. **Backend validation**: Update `file_base64` max rule to allow ~40MB encoded string.
3. **PHP config** (`php.ini` or hosting panel): `upload_max_filesize = 40M`, `post_max_size = 45M`.
4. **Locale**: Update `documents.fileSizeWarning` → "30 MB" in both locale files.

**Seeder**: None.

---

### 6d. Second File Upload Bug (Freeze / Not Display)

**Explanation**: After the first successful upload, the modal's reactive form state is not fully reset, and/or a stale `FileReader` event listener accumulates — the second submission is silently blocked or fires the wrong handler. This is a state management bug in `UploadDocumentModal.vue`.

**Plan**:
1. After a successful upload in `submitForm`, explicitly reset all form refs (base64, filename, title, description, targetType, etc.) to their initial values.
2. Verify `FileReader` is created fresh on each file-select event (inside the `@change` handler function scope), not reused across calls.
3. Confirm `documentsStore.fetchDocuments()` is awaited after `createDocument()` so the new item appears.
4. Test: upload two files in the same modal session without closing it.

**Seeder**: None.

---

### 6e (στ). Admin Adds File for Specific User — Neither Sees It

**Explanation**: Two potential bugs — the admin role check in `CompanyDocumentController::index()` may be failing, or the `target_type` string value in the DB doesn't match what the frontend filters on (renamed from `'user'` to `'restricted'` during migration). If the pivot row was never saved either (due to incorrect `sync()` order), neither user would see the document.

**Plan**:
1. **Backend**: In `index()`, verify the admin bypass: `in_array($user->roles()->first()?->name, ['admin', 'hr-manager'])` — add a debug log or check directly in DB.
2. **Pivot save order**: In `store()`, ensure `$doc->save()` runs before `$doc->targetUsers()->sync(...)` — the FK requires the parent to exist first.
3. **Frontend store**: Confirm `personalDocuments` computed filters on `target_type === 'restricted'` (not the old `'user'`).
4. **Quick DB check**: After upload, inspect `company_document_users` and `company_documents` directly to identify which step dropped the data.

**Seeder**: None.

---

## 7. Reports — Three Changes

### 7a. "Pending Approvals" Widget — Admin Only

**Explanation**: The PendingQueue widget currently shows for all roles with `reports.view` permission (admin + HR manager). It should be restricted to admin only. The cleanest approach is a sub-permission rather than hardcoding a role check in the component.

**Plan**:
1. Backend: add `view_pending_approvals` to the admin role's permissions; exclude it from hr-manager.
2. `pages/reports.vue` `widgetDefs`: conditionally include `pendingQueue` only when `can('reports', 'view_pending_approvals')`.
3. Update `Permissions.vue` matrix and both locale files.

**Seeder**: The permissions are stored in the backend's role-permissions table. Update `RolePermissionsSeeder.php` to include `reports.view_pending_approvals` for the `admin` role only.

---

### 7b. CSV Export (+ Keep PDF — Both in an Export Dropdown)

**Explanation**: CSV is a universally compatible tabular format that opens in any spreadsheet tool without library dependencies. The export button becomes a dropdown with two options: "Export PDF" and "Export CSV". CSV is generated entirely client-side from the in-memory `reportsStore.summary` — no library needed beyond standard JS string building.

**Plan**:
1. **Export dropdown**: In `pages/reports.vue`, replace the single "Export PDF" button with a dropdown button group. The trigger shows "Export ▾"; the dropdown contains "PDF" and "CSV" options. Use the same `ref`-boolean + `onClickOutside` pattern used elsewhere in the codebase (no new UI library).
2. **CSV generation** (no `xlsx`, no new dependency):
   ```ts
   const exportCsv = () => {
     const rows: string[][] = [];
     // Leaves by month
     rows.push(['Month', 'Leave Days']);
     summary.by_month.forEach(r => rows.push([monthLabel(r.m), String(r.days)]));
     rows.push([]); // blank separator
     // Top users
     rows.push(['Employee', 'Days']);
     summary.top_users.forEach(r => rows.push([r.user.name, String(r.days)]));
     // ... add other sections similarly
     const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
     const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a'); a.href = url; a.download = `report-${yearStr.value}.csv`; a.click();
     URL.revokeObjectURL(url);
   };
   ```
   The `﻿` BOM ensures Excel/Numbers opens the file with correct Greek character encoding.
3. **PDF**: Keep the existing `html2pdf.js` flow unchanged, now triggered from the "PDF" dropdown item.
4. **`ExportReportModal.vue`**: Update to show format choice (PDF / CSV) or remove the modal entirely in favour of the inline dropdown if it adds no value.
5. **Locale**: `reports.exportCsv` = "Export CSV", `reports.exportReport` = "Export PDF", `reports.export` = "Export".

**Seeder**: None.

---

### 7c. Add User Filter

**Explanation**: Adding an employee filter to the report toolbar allows admin/HR to scope all widgets to one or more specific users — useful for individual audits or performance discussions.

**Plan**:
1. **Frontend**: Add `selectedUserIds: ref<number[]>([])` and a `CustomMultiSelect` for users in the `pages/reports.vue` toolbar. Append to the `watch` trigger alongside existing filters.
2. **Composable + store**: Add `userIds: number[]` param to `getReportSummaryComposable` and `reportsStore.fetchSummary`.
3. **Backend**: `$userIds = (array) $r->query('user_ids', [])` + `->when($userIds, fn($q) => $q->whereIn('user_id', $userIds))` on the base query in `ReportsController::summary()`.
4. **Locale**: `reports.users` / `reports.allUsers`.

**Seeder**: None.

---

## 8. User Profile — Redesign Leave Requests Section

### Explanation

Annual leave info should move to sit below profile + group info, with leave requests displayed as a compact recent list rather than the current layout. The last 3 requests are shown immediately, each with a status badge and cancel option. A "View All" button links to `/yearly-leaves`. Month and status filter dropdowns sit above the list for users who want to search further.

### Implementation Plan

1. **Home page reorder** (`pages/home.vue`): Ensure `ProfileInfo` + `UserGroupInfo` render above the leave balance section. With `DashboardCustomizer` already wired to `sectionOrder`, update the default section order if needed.
2. **New `components/Home/RecentLeaveRequests.vue`**: Reads `leavesStore.leavesData.leaves` (current user's own leaves), sorted descending by `created_at`. Shows top 3. Each row: leave type colored pill, date range, status badge, cancel button (only for `pending` status — calls `leavesStore.cancelLeave(id)`). Top-right: `<NuxtLink to="/yearly-leaves">` with a "View All →" label.
3. **Filters**: Two `CustomSelect` dropdowns above the 3-item list — Month (Jan–Dec of current year, "All Months" default) and Status (All / Pending / Approved / Declined). Filtering is client-side over the full loaded leaves array. When a non-default filter is active, show up to 10 results instead of 3.
4. **`LeavesYearInfo` position**: Move below `UserGroupInfo` and above `RecentLeaveRequests` — this is the entitlement balance summary. The three together form one coherent "Leave Overview" section.
5. **Files**: `pages/home.vue`, `components/Home/RecentLeaveRequests.vue` (new), both locale files.

### Seeder

None — data is user-generated.

---

## 9. Settings — Admin Should See Calendar Sharing Tab

### Explanation

The "Calendar Sharing" tab in Settings is gated by `can('invitations', 'view')`, which is loaded from the backend's `/api/permissions/me`. If the admin doesn't see the tab, the backend is not returning `invitations.view: true` for the admin role — this is a permissions matrix configuration issue in the database, not a frontend bug.

### Implementation Plan

1. **Check backend `RolePermissionsSeeder.php`**: Ensure `invitations.view` is granted to the `admin` role. If it is missing, add it.
2. **Verify live data**: Query the role-permissions table in the production/test DB for the admin role and confirm `invitations.view` is present.
3. **Frontend**: No changes needed once the backend is corrected. The settings tab will appear automatically on next login/permissions refresh.

### Seeder

Update `database/seeders/RolePermissionsSeeder.php` to ensure `invitations.view` and `invitations.modify` are included for all four roles (they should be, per the original design). This guarantees fresh installations have the correct defaults.

---

## Suggested Execution Order

| Priority | Item | Effort | Risk |
|---|---|---|---|
| 1 | #2 WFH auto_approve — add to `$fillable` + seeder | Low | Low (one-line fix) |
| 2 | #1 Login/logout SSR cookie forwarding | Medium | High (UX blocker) |
| 3 | #9 Admin calendar sharing — backend permissions | Low | Low |
| 4 | #6e Admin document visibility bug | Low | Low |
| 5 | #6d Second file upload state reset bug | Low | Low |
| 6 | #4a Calendar status icons | Low | Low |
| 7 | #6c File size 30MB + seeder | Low | Low |
| 8 | #6a Document source methods settings tab + seeder | Medium | Low |
| 9 | #7a Pending approvals admin-only + seeder | Low | Low |
| 10 | #5a Org chart → profile on click | Low | Low |
| 11 | #5b Org chart vertical layout + sticky header | Medium | Medium |
| 12 | #3 Leave balance next-month projection popover | Medium | Medium |
| 13 | #4b Calendar admin accept/decline | Medium | Medium |
| 14 | #7b CSV + PDF export dropdown | Medium | Low |
| 15 | #7c Report user filter | Medium | Low |
| 16 | #6b Document group targeting | High | Medium |
| 17 | #4c Calendar day click → new leave | Medium | Medium |
| 18 | #8 Profile leave section redesign | High | Medium |
| 19 | #4d iCal export | Medium | Low |

---

## New Seeders Summary

| Seeder | What to add |
|---|---|
| `LeavesTypeSeeder.php` | Change to `updateOrCreate`; set `auto_approve: true` for "Work from home" |
| `CompanySettingsSeeder.php` (new) | `document_source_methods: { google_doc: true, sharepoint: true, file: true }` |
| `RolePermissionsSeeder.php` | Ensure `invitations.view` + `invitations.modify` for all roles; `reports.view_pending_approvals` for admin only |
| `DatabaseSeeder.php` | Add `$this->call(CompanySettingsSeeder::class)` |
