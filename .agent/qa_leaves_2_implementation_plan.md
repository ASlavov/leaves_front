# QA Round 2 — Implementation Plan

**Source:** QA_leaves_2.pdf (15 issues)  
**Date:** 2026-06-25  
**Branches:** frontend (`intelligence/`) · backend (`c:\htdocs\intelligence-back\`)

---

## Issue Map (priority order)

| # | Severity | Area | Short title |
|---|----------|------|-------------|
| 2 | Critical | Frontend | Calendar 500 crash on refresh |
| 3 | Critical | Frontend + Nitro | Reports crash on refresh (403) |
| 12 | Critical | Frontend (Nitro BFF) | Regular user profile edit always fails |
| 15 | Critical | Backend | Entitlement increase corrupts remaining days |
| 4 | High | Frontend | Light-mode refresh loses session / empty profile |
| 11 | High | Frontend | Document download 404 |
| 13 | High | Frontend | Profile save doesn't update UI |
| 1 | High | Frontend | Sidebar icons invisible in light mode |
| 14 | Medium | Frontend | Org chart must be Top-Down (not left-aligned tree) |
| 7 | Medium | Frontend | Greek characters garbled in CSV export |
| 5 | Medium | Frontend | Users list text overlapping |
| 6 | Medium | Frontend | "Change password" button overflows card; "ΕΠΙΚΕΦΑΛΗΣ" truncated |
| 8 | Low | Frontend | Document upload — user dropdown too small |
| 9 | Low | Frontend | Document upload — raw i18n keys shown (assignToGroups, selectGroups) |
| 10 | Low | Frontend | Document upload — submit button clipped at bottom of modal |

---

## Issue 1 — Sidebar icons invisible in light mode

**Root cause:** Every SVG in `components/SidebarTopbar/SidebarMenu.vue` except the home icon has
`stroke="#fff"` hardcoded. The home icon correctly uses `stroke="currentColor"`. In dark mode the
sidebar background is neutral-700 (dark), so white strokes are visible. In light mode the
background is white/light-gray, so white strokes vanish.

**Affected lines in SidebarMenu.vue:**
- Calendar icon: `stroke="#fff"` (line 46)
- Org-chart icon: `stroke="#fff"` (line 66)
- Documents icon: `stroke="#fff"` (lines 92)
- Reports icon: `stroke="#fff"` (line 118)
- Settings icons: `stroke="#fff"` (lines 143, 149)

**Fix (frontend only):**

`components/SidebarTopbar/SidebarMenu.vue`  
Replace every `stroke="#fff"` attribute in the SVG elements with `stroke="currentColor"`.
The `NuxtLink` already applies `text-gray-800 dark:text-white` so `currentColor` resolves
correctly in both modes.

---

## Issue 2 — Calendar page 500 crash on F5 / direct URL load

**Root cause:** `components/Calendar/Calendar.vue` does:
```ts
import { ScheduleXCalendar } from '@schedule-x/vue';
```
`@schedule-x/vue` is a **CommonJS** module that does not export named exports in an ESM context.
When Nuxt SSR-renders the page (e.g., direct URL / hard refresh), Vite attempts to import the
named export server-side and throws:
> *Named export 'ScheduleXCalendar' not found. The requested module '@schedule-x/vue' is a
> CommonJS module…*

**Fix (frontend, two-part):**

**Part A — Disable SSR for the calendar page:**  
`pages/calendar.vue` — add at the top of `<script setup>`:
```ts
definePageMeta({ ssr: false });
```

**Part B — Fix the import in Calendar.vue:**  
Replace the named import with a default import + destructure so the component also works if
SSR is ever re-enabled later:
```ts
// OLD
import { ScheduleXCalendar } from '@schedule-x/vue';

// NEW
import ScheduleXVue from '@schedule-x/vue';
const ScheduleXCalendar = ScheduleXVue.ScheduleXCalendar ?? ScheduleXVue;
```
Or more robustly, add to `nuxt.config.ts`:
```ts
vite: {
  ssr: {
    noExternal: ['@schedule-x/vue'],
  },
},
```
The `ssr: false` in Part A alone is the fastest fix.

---

## Issue 3 — Reports (Statistics) page "This function has crashed" on refresh

**Root cause:** Error trace shows:
```
FetchError: [GET] "/api/reports/summary?year=2026": 403 Not authenticated
```
The Nuxt server route `server/api/reports/summary.get.ts` checks for `event.context.token`
(set by the auth middleware). On Netlify after a hard refresh, the auth middleware may not
have hydrated yet, or the `auth_token` cookie isn't being forwarded from the browser into
the Nitro function context, leaving `token` undefined and causing a 403.

The reports page already has `definePageMeta({ ssr: false })` — so the crash happens
on the **client-side** fetch after hydration, not during SSR. This means `centralStore.init()`
(which calls `refreshSession`) hasn't completed before `reportsStore.fetchSummary()` is called.

**Fix (frontend):**

In `pages/reports.vue`, guard the initial fetch behind the central store's initialization:

```ts
// In onMounted, wait for centralStore to be ready before fetching
onMounted(async () => {
  await centralStore.ensureInitialized(); // or await centralStore.init() if not already called
  // then fetch...
  await reportsStore.fetchSummary(Number(yearStr.value), ...);
});
```

Also check `server/middleware/` — ensure the auth middleware correctly reads the `auth_token`
HTTP-only cookie and sets `event.context.token`. If `event.context.token` is undefined at the
Nitro function level, the middleware may have an import or execution-order bug.

If `centralStore.init()` is the guard, ensure `init()` resolves before watchers or `onMounted`
hooks call the reports API.

---

## Issue 4 — Light-mode refresh loses session (empty profile, N/A group)

**Root cause:** Two interacting problems:

1. **Auth token cookie scope:** The `auth_token` HTTP-only cookie must be set with the correct
   domain so it is sent on every browser request to the Nuxt Nitro server. If the cookie's
   `domain` or `sameSite` attributes prevent it from being forwarded, the Nuxt auth middleware
   cannot extract the token, and all API calls fail silently.

2. **Pinia hydration mismatch:** `pinia-plugin-persistedstate/nuxt` is installed. If the auth
   store's `userInfo` or `userId` is persisted to **localStorage** (browser-only), the SSR
   render produces an empty page (no localStorage on server). On client hydration the plugin
   restores the state, but Vue's hydration snapshot was already committed as empty — causing
   a mismatch that Pinia resolves by keeping the empty SSR snapshot.

3. **The light-mode specificity:** Switching to light mode changes the `nuxt-color-mode` cookie.
   If this triggers a Pinia plugin re-hydration (due to a storage key collision or a hydration
   event), the auth state can be cleared.

**Fix (frontend):**

**Step 1 — Check the `pinia-plugin-persistedstate` config.**  
In `stores/auth.ts` (check the `persist` option). Ensure the auth store is **not** persisting
sensitive data to localStorage. If persistence is needed for the user ID, use cookie storage
(which is SSR-safe):
```ts
persist: {
  storage: persistedState.cookiesWithOptions({ sameSite: 'strict' }),
  paths: ['userId'], // only persist the user id, not the full token
}
```

**Step 2 — Add a Nuxt plugin to ensure `centralStore.init()` runs before any page renders.**  
Create `plugins/init.client.ts`:
```ts
export default defineNuxtPlugin(async () => {
  const centralStore = useCentralStore();
  if (!centralStore.isInitialized) {
    await centralStore.init();
  }
});
```
And add an `isInitialized` flag to `centralStore.ts`.

**Step 3 — Add a loading gate to `ProfileInfo.vue`.**  
If `userStore.userInfo?.id` is falsy, show a skeleton until `loading` resolves. This prevents
the "empty" flash on refresh.

---

## Issue 5 — Users list: text overlapping between columns

**Root cause:** `UsersList.vue` uses `lg:grid-cols-12` with `col-span-2` per text column and
`col-span-3` for the actions column. Text like department names ("WHY") and action links
("Επεξεργασία Προφίλ") do not truncate, causing visual overflow into adjacent columns.

**Fix (frontend):**

`components/Settings/UsersList.vue`

Add `truncate` (or `overflow-hidden text-ellipsis whitespace-nowrap`) to every data cell:
```html
<div class="col-span-1 lg:col-span-2 truncate">
  {{ user.firstName || '' }}
</div>
<div class="col-span-1 lg:col-span-2 truncate">
  {{ user.lastName || '' }}
</div>
<div class="col-span-1 lg:col-span-2 truncate">
  {{ user?.profile?.job_title || '' }}
</div>
<div class="col-span-1 lg:col-span-2 truncate">
  {{ user?.department?.name || '' }}
</div>
```
Also add `min-w-0` to each cell div so the Tailwind grid items respect the `truncate` boundary
(without `min-w-0`, flex/grid children don't truncate).

The action links should remain `whitespace-nowrap` so they don't wrap mid-word, but the
container column should shrink via `overflow-hidden`.

---

## Issue 6 — "Change Password" button overflows card; "ΕΠΙΚΕΦΑΛΗΣ" truncated in groups

**Two independent sub-issues:**

### 6a — Change Password button overflow (ProfileInfo.vue)

**Root cause:** The button container uses:
```html
<div class="info-actions pt-[30px] flex gap-[25px] 2xl:flex-row flex-col items-start xl:items-center">
```
At intermediate screen widths, both the red "Edit" button and "Αλλαγή κωδικού" text link are in
a `flex-row` that can overflow the card's `px-[35px]` boundary.

**Fix:**
```html
<div class="info-actions pt-[30px] flex flex-wrap gap-[12px] items-center">
```
`flex-wrap` lets the buttons wrap to a second line instead of overflowing. Remove the `2xl:`
breakpoint variant and keep a consistent single-line with wrap-on-overflow behaviour.

### 6b — "ΕΠΙΚΕΦΑΛΗΣ" truncated in GroupsList

**Root cause:** The head badge in `components/Settings/GroupsList.vue` uses `whitespace-nowrap`
inside a narrow flex cell, causing the long Greek word "ΕΠΙΚΕΦΑΛΗΣ" to be clipped.

**Fix:** In `GroupsList.vue`, find the head badge element and either:
- Replace `whitespace-nowrap` with `break-words` for the role label
- Or shorten the label to use an abbreviated form `ΕΠΙΚΕΦ.` with a `title` tooltip

---

## Issue 7 — Greek characters garbled in CSV export (Excel shows Î Î»Î·Ï…)

**Root cause:** `ExportReportModal.vue::generateCsv()` creates a UTF-8 CSV Blob:
```ts
const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
```
Microsoft Excel does **not** auto-detect UTF-8 CSV; it defaults to Windows-1252 encoding.
Greek multi-byte UTF-8 sequences are misread as Latin-1, producing the garbled `Î` characters.

**Fix (frontend):**

Add a **UTF-8 BOM** (`﻿`) at the start of the CSV content:
```ts
// In generateCsv(), before creating the Blob:
const BOM = '﻿';
const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
```
Excel reads the BOM and correctly interprets the file as UTF-8.

---

## Issues 8, 9, 10 — Upload Document modal bugs

All three are in `components/Documents/UploadDocumentModal.vue`.

### Issue 8 — User dropdown too small (only shows 1 user)

**Root cause:** `MiscCustomMultiSelect` (used for the Users picker, `select-id="doc-users"`)
does not have a constrained height on the dropdown options list. The container renders too small.

**Fix:** In `components/misc/CustomMultiSelect.vue`, ensure the dropdown options container has
an explicit `max-height`:
```html
<div class="absolute z-50 w-full bg-white dark:bg-neutral-800 border ... max-h-[200px] overflow-y-auto">
  <!-- options -->
</div>
```
If `CustomMultiSelect` already has this, check whether the parent container in
`UploadDocumentModal.vue` is constraining the dropdown via `overflow-hidden`. Remove any
`overflow-hidden` from parent wrappers that clip the dropdown.

### Issue 9 — Raw translation keys shown (documents.assignToGroups, documents.selectGroups)

**Root cause:** `UploadDocumentModal.vue` uses:
```html
<label>{{ $t('documents.assignToGroups') }}</label>
<MiscCustomMultiSelect :placeholder="$t('documents.selectGroups')" ... />
```
These keys are missing from `locales/en.json` and `locales/el.json`.

**Fix:** Add the missing keys to both locale files:

`locales/en.json` — under the `"documents"` object:
```json
"assignToGroups": "Assign to Groups",
"selectGroups": "Select Groups...",
"assignToRoles": "Assign to Roles",
"selectRoles": "Select Roles...",
"assignToUsers": "Assign to Users",
"selectUsers": "Select Users..."
```

`locales/el.json` — under the `"documents"` object:
```json
"assignToGroups": "Ανάθεση σε Ομάδες",
"selectGroups": "Επιλογή Ομάδων...",
"assignToRoles": "Ανάθεση σε Ρόλους",
"selectRoles": "Επιλογή Ρόλων...",
"assignToUsers": "Ορισμός Χρηστών",
"selectUsers": "Επιλογή Χρηστών..."
```

### Issue 10 — "Upload Document" submit button clipped at bottom

**Root cause:** The form container `<form class="p-4 sm:p-6 space-y-5">` has `p-4`/`p-6`
padding but the BaseModal container may not provide enough bottom space. The last element
(submit button) is inside `<div class="pt-2 flex justify-end">` which sits at the very bottom
of the form with no bottom margin/padding in the modal.

**Fix:** Add `pb-4` to the submit button wrapper, or add `pb-6` to the form element:
```html
<form class="p-4 sm:p-6 pb-6 space-y-5" @submit.prevent="save">
```
Or change the submit wrapper:
```html
<div class="pt-2 pb-4 flex justify-end">
```

---

## Issue 11 — Company Documents: 404 on download

**Root cause:** `DocumentCard.vue::handleAction()` uses:
```ts
window.location.href = getDocumentDownloadUrl(props.document.id);
// resolves to: /api/documents/1/download
```
A full browser navigation to `/api/documents/1/download` is intercepted by the **Vue Router**
(client-side) before it reaches the Nitro server, because in production (Netlify SPA mode) all
routes not matched by the file-based page router render the Nuxt 404 page.

**Fix (frontend):**

`components/Documents/DocumentCard.vue` — replace `window.location.href` with a programmatic
blob download:
```ts
const handleAction = async () => {
  if (props.document.source_type === 'file') {
    try {
      const blob = await $fetch<Blob>(`/api/documents/${props.document.id}/download`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = props.document.original_filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    }
  } else if (props.document.url) {
    window.open(props.document.url, '_blank', 'noopener,noreferrer');
  }
};
```

Also update `server/api/documents/[id].download.get.ts` — replace `responseType: 'stream'`
with a buffer-based approach (streams aren't reliable in serverless Netlify Functions):
```ts
const response = await $fetch<ArrayBuffer>(
  `${config.public.apiBase}${config.public.documents.base}/${id}/download`,
  {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arrayBuffer',
  },
);
// Then set content-type header and return the buffer
```

---

## Issue 12 — Regular user profile edit fails after admin grants permission

**Root cause:** `server/api/user/editUser.ts` line 12:
```ts
await requireRole(event, ['admin', 'hr-manager']);
```
This is the same over-restrictive pattern documented in `bugfixes_april24.md` for
`processLeave.ts`. Any user who is not admin or hr-manager is blocked with 403, regardless of
what the permissions matrix says.

The Laravel backend at `PUT /user-update` already handles authorization: it checks whether the
requesting user can modify the target user (self-edit is allowed; editing others requires
admin/hr role).

**Fix (frontend Nitro BFF):**

`server/api/user/editUser.ts` — remove lines 4 and 12:
```ts
// REMOVE:
import { requireRole } from '~/server/utils/requireRole';
// REMOVE:
await requireRole(event, ['admin', 'hr-manager']);
```

The remaining auth check (`if (!token) throw 403`) is sufficient. The Laravel backend enforces
who can edit whom.

---

## Issue 13 — Profile save succeeds but UI shows stale data

**Root cause:** `stores/user.ts::editUser()` (line ~101):
```ts
if (targetUserId === userId.value) {
  await loadUserProfile();   // re-fetches and updates userInfo
} else {
  await getAllUsers();        // only updates allUsers[], not userInfo
}
```
`targetUserId` arrives as a **number** from the component, while `userId.value` is stored as a
**string** (set via `setUserId(id: string | number)` but often assigned from a cookie/string
parse). The strict `===` comparison returns `false`, so `loadUserProfile()` is never called for
the currently logged-in user. The profile page reads `userStore.userInfo` which remains stale.

**Fix (frontend):**

`stores/user.ts` — change the comparison:
```ts
// OLD
if (targetUserId === userId.value) {

// NEW
if (String(targetUserId) === String(userId.value)) {
```

This ensures numeric `1` and string `"1"` are treated as equal.

---

## Issue 14 — Org chart: Left-aligned vertical tree → should be Top-Down

**Root cause:** `components/OrgChart/OrgChartNode.vue` currently renders children in a
vertical left-bordered list (`flex flex-col` + `border-l-2`). The spec requires a traditional
**top-down tree** where the parent node is centered above a horizontal row of children, with
connector lines from parent center to each child's top.

**Fix (frontend):**

Major refactor of `OrgChartNode.vue`. Key changes:

**1. Change root container to center-align:**
```html
<!-- OLD -->
<div class="org-node flex flex-col items-start">

<!-- NEW -->
<div class="org-node flex flex-col items-center relative">
```

**2. Change children container from vertical list to horizontal row:**
```html
<!-- OLD: vertical with left border -->
<div class="flex flex-col gap-6 mt-4 relative pl-10 border-l-2 border-gray-300 ml-[3rem]">

<!-- NEW: horizontal row -->
<div class="flex flex-row gap-6 mt-10 relative justify-center items-start">
```

**3. Replace connector lines with top-down SVG/CSS connectors:**

The vertical connector from parent center:
```html
<!-- Vertical line from parent node bottom to children bar -->
<div class="absolute w-px h-10 bg-gray-300 dark:bg-neutral-600 -top-10 left-1/2 -translate-x-1/2"></div>
```

For multiple children, add a horizontal bar spanning all siblings:
```html
<!-- Horizontal line across children (only if siblings exist) -->
<div
  v-if="node.children.length > 1"
  class="absolute top-0 left-[calc(50%-50%+20px)] right-[calc(50%-50%+20px)] h-px bg-gray-300 dark:bg-neutral-600"
></div>
```

A clean CSS-only approach uses `:before`/`:after` on each child for the elbow connectors.

**4. Also change OrgChartPage.vue container to center root nodes:**
```html
<!-- OLD -->
<div class="flex-grow flex flex-col items-start overflow-visible min-w-max">

<!-- NEW -->
<div class="flex-grow flex flex-col items-center overflow-visible min-w-max">
```

> **Note:** The connector line geometry for a general tree with any number of children is
> non-trivial in pure CSS. Consider using a library like `vue3-org-chart` or drawing lines
> via an absolutely-positioned SVG overlay if the CSS approach proves too complex.

---

## Issue 15 — Entitlement update corrupts remaining_days (backend)

**Root cause:** `LeaveEntitlementController.php::update()` (lines 155–162):
```php
$entitlement->entitled_days = $request->entitled_days;  // updated
$entitlement->start_from = $request->start_from;
$entitlement->end_to = $request->end_to;
$entitlement->save();
// remaining_days is NEVER touched
```
When admin increases `entitled_days` from 10 to 15, `remaining_days` stays at its old value
(e.g., 10 if no leaves were taken). But the frontend computes used days as:
`entitled_days − remaining_days = 15 − 10 = 5` (showing 5 "consumed" days that don't exist).

The correct semantic: `remaining_days = entitled_days − days_deducted`. When entitled_days
increases by `delta`, remaining_days should also increase by `delta`.

**Fix (backend):**

`app/Http/Controllers/Api/LeaveEntitlementController.php::update()`:
```php
$entitlement = EntitlementDay::findOrFail($id);

// Calculate the delta and adjust remaining proportionally
$delta = $request->entitled_days - $entitlement->entitled_days;
$newRemaining = $entitlement->remaining_days + $delta;

// Clamp: remaining can't exceed new entitled, can't go below 0
$newRemaining = min($newRemaining, $request->entitled_days);
$newRemaining = max($newRemaining, 0);

$entitlement->entitled_days = $request->entitled_days;
$entitlement->remaining_days = $newRemaining;
$entitlement->start_from = $request->start_from;
$entitlement->end_to = $request->end_to;
$entitlement->save();
```

This preserves the already-consumed days and correctly reflects the new entitlement.

---

## Execution Order

| Step | File(s) | Issue(s) | Notes |
|------|---------|----------|-------|
| 1 | `SidebarMenu.vue` | #1 | 5 SVG stroke replacements, no logic change |
| 2 | `pages/calendar.vue` | #2 | `definePageMeta({ ssr: false })` |
| 3 | `server/api/user/editUser.ts` | #12 | Remove `requireRole` call |
| 4 | `stores/user.ts` | #13 | Fix `===` → `String()` comparison |
| 5 | `LeaveEntitlementController.php` | #15 | Backend delta logic |
| 6 | `ExportReportModal.vue` | #7 | Add `﻿` BOM to CSV |
| 7 | `locales/en.json` + `locales/el.json` | #9 | Add missing document keys |
| 8 | `UploadDocumentModal.vue` + `CustomMultiSelect.vue` | #8, #10 | max-height dropdown + pb-4 form |
| 9 | `DocumentCard.vue` + `[id].download.get.ts` | #11 | Blob download + arrayBuffer proxy |
| 10 | `UsersList.vue` | #5 | `truncate` + `min-w-0` on data cells |
| 11 | `ProfileInfo.vue` | #6a | `flex-wrap` on button container |
| 12 | `GroupsList.vue` | #6b | Head badge overflow fix |
| 13 | `OrgChartNode.vue` + `OrgChartPage.vue` | #14 | Top-down layout redesign |
| 14 | `pages/reports.vue` + auth middleware | #3 | Guard fetchSummary behind init |
| 15 | Auth/session layer | #4 | Pinia persist + hydration investigation |

Steps 1–13 are mechanical and safe to do in sequence. Steps 14–15 require deeper investigation
of the Nuxt session/auth middleware before changing code.
