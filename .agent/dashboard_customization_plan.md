# Dashboard Customization — Implementation Plan

## What the dashboard currently is

The home page has three sections stacked vertically:

| # | Section | Component | Who sees it |
|---|---|---|---|
| 1 | **Leave Balance** | `HomeLeavesMetric` → `Metrics` cards | All roles |
| 2 | **Info Row** | `HomeInfo` → `ProfileInfo` + `UserGroupInfo` + `LeavesYearInfo` | All roles |
| 3 | **Pending Actions** | `LeavesYearlyLeaves` (small) | Admin / HR / Head only |

The leave balance cards are currently sorted hard-coded by `leave_type_id` with no way to override.

---

## What will be customizable

| Preference | What it controls |
|---|---|
| `sectionOrder` | Which of the 3 sections appears first/second/third |
| `hiddenSections` | Which sections are completely hidden |
| `leaveTypeOrder` | Which leave type card appears first in the balance row |
| `hiddenLeaveTypes` | Leave type IDs to omit from the balance row entirely |

Drag-and-drop is intentionally excluded — no new dependencies. Up/down arrows + eye toggles are sufficient and consistent with the rest of the app's no-library approach.

---

## Backend (Laravel)

### Step 1 — Migration: add `dashboard_preferences` to `user_profiles`

```php
// One new nullable JSON column — no new table, no FK, no joins
$table->json('dashboard_preferences')->nullable()->after('profile_image');
```

Null = user has never customized = use defaults.

### Step 2 — `UserProfile` model

Add `dashboard_preferences` to `$fillable` and cast it:

```php
protected $casts = [
    // existing...
    'dashboard_preferences' => 'array',
];
```

### Step 3 — `UserController` — two new methods

`getDashboardPreferences()` — `GET /dashboard-preferences`
- Uses `auth()->user()` — never exposes another user's prefs
- Returns `profile->dashboard_preferences ?? null`

`updateDashboardPreferences()` — `PUT /dashboard-preferences`
- Validates the JSON shape strictly:
  - `section_order`: array, each item in `['leave_balance', 'profile_info', 'pending_actions']`
  - `hidden_sections`: array, same enum values
  - `leave_type_order`: array of integers (each `exists:leaves_types,id`)
  - `hidden_leave_types`: array of integers (each `exists:leaves_types,id`)
- Saves to `auth()->user()->profile->dashboard_preferences`
- Returns the saved preferences

### Step 4 — Routes (`api.php`)

```php
Route::get('/dashboard-preferences', [UserController::class, 'getDashboardPreferences'])->middleware('auth:sanctum');
Route::put('/dashboard-preferences', [UserController::class, 'updateDashboardPreferences'])->middleware('auth:sanctum');
```

---

## Frontend (Nuxt)

### Step 5 — Types: `types/dashboard.ts`

```ts
export type DashboardSection = 'leave_balance' | 'profile_info' | 'pending_actions';

export interface DashboardPreferences {
  sectionOrder: DashboardSection[];
  hiddenSections: DashboardSection[];
  leaveTypeOrder: number[];    // leave_type_ids, preferred order; empty = sort by id
  hiddenLeaveTypes: number[];  // leave_type_ids to hide
}

// Canonical defaults — used when preferences are null or a key is missing
export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  sectionOrder: ['leave_balance', 'profile_info', 'pending_actions'],
  hiddenSections: [],
  leaveTypeOrder: [],
  hiddenLeaveTypes: [],
};
```

Export from `types/index.ts`.

### Step 6 — Server API proxy routes

- `server/api/user/dashboardPreferences.get.ts` — proxies `GET /dashboard-preferences`
- `server/api/user/dashboardPreferences.put.ts` — proxies `PUT /dashboard-preferences`

Both inject token from `event.context`.

### Step 7 — Composable additions in `composables/userApiComposable.ts`

Add two functions alongside the existing ones:

```ts
export const getDashboardPreferencesComposable = () => { ... }
export const updateDashboardPreferencesComposable = (prefs: DashboardPreferences) => { ... }
```

### Step 8 — Store: `stores/dashboardPreferences.ts`

```ts
// state
preferences: Ref<DashboardPreferences>   // always has defaults merged in — never null
loading: Ref<boolean>
error: Ref<string | null>
previewPreferences: Ref<DashboardPreferences | null>  // non-null only while customizer is open

// computed
activePreferences: ComputedRef<DashboardPreferences>
  // → previewPreferences ?? preferences
  // → what home.vue and LeavesMetric.vue read from

orderedSections: ComputedRef<DashboardSection[]>
  // → activePreferences.sectionOrder filtered to remove hiddenSections

// actions
fetchPreferences()        // GET — merges result with DEFAULT_DASHBOARD_PREFERENCES
savePreferences(prefs)    // PUT — writes to preferences, clears previewPreferences on success
                          //       rolls back to previous preferences on failure
startPreview(draft)       // sets previewPreferences — called on every change in customizer
cancelPreview()           // clears previewPreferences — called on Cancel
reset()

// helper (pure function, not a computed — needs allTypes as input)
visibleLeaveTypes(allTypes: LeaveBalanceEntry[]): LeaveBalanceEntry[]
  // → filters hiddenLeaveTypes out of allTypes
  // → sorts remainder by leaveTypeOrder (pinned first, rest by leave_type_id)
  // reads from activePreferences
```

### Step 9 — Register in `centralStore.ts`

- Import `useDashboardPreferencesStore`
- Add `dashboardPreferencesStore.fetchPreferences()` to the second `Promise.all` in `init()`
- Add `dashboardPreferencesStore.reset()` to `logout()`
- Expose as `dashboardPreferencesStore`

### Step 10 — Modify `pages/home.vue`

Replace the three hard-coded component calls with a `v-for` over `orderedSections`:

```vue
<template>
  <SidebarTopbarSidebar />
  <div class="w-full lg:ps-64 bg-red min-h-dvh-64 dark:bg-neutral-900">
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">

      <!-- Customize button -->
      <div class="flex justify-end">
        <button @click="showCustomizer = true" class="...gear icon button...">
          {{ $t('dashboard.customize') }}
        </button>
      </div>

      <template v-for="section in dashboardStore.orderedSections" :key="section">
        <HomeLeavesMetric v-if="section === 'leave_balance'" />
        <HomeInfo         v-else-if="section === 'profile_info'" />
        <LeavesYearlyLeaves
          v-else-if="section === 'pending_actions' && canSeePendingActions"
          :is-small-component="true"
          :leaves-number="3"
        />
      </template>

    </div>
  </div>

  <HomeDashboardCustomizer v-if="showCustomizer" @close="showCustomizer = false" />
</template>
```

`canSeePendingActions` remains the same `permissionsStore.can('profile_leave_balance', 'accept_leave')` check.

### Step 11 — Modify `components/Home/LeavesMetric.vue`

Replace the hard-coded sort in `groupedLeavesData`:

```ts
// Before (last line of the reduce + sort):
return Object.values(groupedData).sort((a, b) => a.leave_type_id - b.leave_type_id);

// After:
const allTypes = Object.values(groupedData);
return dashboardStore.visibleLeaveTypes(allTypes);
```

No other changes needed in this component.

### Step 12 — New component: `components/Home/DashboardCustomizer.vue`

Uses `BaseModal` (`maxWidth="max-w-lg"`). Opens with a deep-clone of current `preferences` as `localDraft`. Every change in the UI calls `dashboardStore.startPreview(localDraft)` so the dashboard behind the modal re-renders live.

**Two-tab layout:**

**Tab 1 — Sections**

A reorderable list of the 3 dashboard sections. Each row:
```
[👁/🚫]  [↑]  [↓]  Section Label
```
- Eye icon: toggles membership in `localDraft.hiddenSections`
- Up/Down arrows: reorders `localDraft.sectionOrder`
- `pending_actions` row is only shown if the user has the `accept_leave` permission (no point customizing a section you can never see)
- A hidden section is greyed out but still shown in the list so the user can re-enable it

**Tab 2 — Leave Balance**

A reorderable list of all leave types the user currently has entitlements for. Each row:
```
[👁/🚫]  [↑]  [↓]  Leave Type Name
```
- Eye icon: toggles membership in `localDraft.hiddenLeaveTypes`
- Up/Down arrows: reorders `localDraft.leaveTypeOrder`
- Leave types not in `leaveTypeOrder` are appended after the ordered ones, sorted by `leave_type_id` (existing default behavior preserved for unpinned types)

**Footer:**
- **Save** — calls `dashboardStore.savePreferences(localDraft)`, closes on success, shows toast
- **Reset to defaults** — resets `localDraft` to `DEFAULT_DASHBOARD_PREFERENCES`, calls `startPreview` — does not persist until Save is pressed
- **Cancel** — calls `dashboardStore.cancelPreview()`, closes modal, no changes saved

### Step 13 — Settings page access point

In the `edit-profile` settings tab (`components/Settings/EditUser.vue`), add a "Dashboard Preferences" button at the bottom of the form that opens `DashboardCustomizer`. This gives users a second discoverable access point beyond the home page button.

### Step 14 — i18n (`en.json` / `el.json`)

```json
"dashboard": {
  "customize": "Customize",
  "customizeTitle": "Customize Dashboard",
  "tabSections": "Sections",
  "tabLeaveBalance": "Leave Balance",
  "sectionLeaveBalance": "Leave Balance",
  "sectionProfileInfo": "Profile & Group Info",
  "sectionPendingActions": "Pending Actions",
  "visible": "Visible",
  "hidden": "Hidden",
  "moveUp": "Move up",
  "moveDown": "Move down",
  "resetDefaults": "Reset to defaults",
  "saveSuccess": "Dashboard layout saved.",
  "saveFailed": "Failed to save preferences.",
  "fetchFailed": "Failed to load preferences.",
  "noLeaveTypes": "No leave types to configure."
}
```

Mirror all keys in `el.json`.

---

## Data flow summary

```
User opens DashboardCustomizer
  → localDraft = deepClone(store.preferences)

User reorders a section / toggles visibility
  → localDraft updated
  → store.startPreview(localDraft)
    → store.previewPreferences = localDraft
    → store.activePreferences = previewPreferences  (computed)
    → home.vue re-renders live (sections reorder behind the modal)
    → LeavesMetric re-renders live (leave type cards reorder)

User clicks Save
  → store.savePreferences(localDraft)
    → PUT /api/user/dashboardPreferences  (Nuxt proxy)
      → PUT /api/dashboard-preferences   (Laravel)
        → user_profiles.dashboard_preferences = JSON
    → store.preferences = localDraft
    → store.previewPreferences = null
    → modal closes, toast shown

User clicks Cancel
  → store.cancelPreview()
    → store.previewPreferences = null
    → store.activePreferences falls back to store.preferences
    → dashboard reverts to last saved state
  → modal closes

Next login
  → centralStore.init() → fetchPreferences()
  → store.preferences = merge(response, DEFAULT_DASHBOARD_PREFERENCES)
  → home.vue renders with saved layout immediately
```

---

## What this does NOT attempt

| Out of scope | Why |
|---|---|
| Free-form drag-and-drop grid | Requires a layout library; adds bundle weight for marginal UX gain |
| Resizing individual cards | Same reason |
| Custom color themes | Already handled by `ColorModeSwitcher` (light/dark/system) |
| Per-widget density/compact settings | Small returns; adds complexity to every component |
| Admin overriding another user's preferences | Preferences are personal; `auth()->user()` enforced server-side |

---

## Execution order

```
Phase 1 — Backend
  Migration: add dashboard_preferences JSON column to user_profiles
  UserController: getDashboardPreferences + updateDashboardPreferences methods
  Routes: GET + PUT /dashboard-preferences

Phase 2 — Frontend types + server proxies
  types/dashboard.ts (DashboardPreferences, DashboardSection, DEFAULT_DASHBOARD_PREFERENCES)
  server/api/user/dashboardPreferences.get.ts
  server/api/user/dashboardPreferences.put.ts

Phase 3 — Composable + Store
  getDashboardPreferencesComposable + updateDashboardPreferencesComposable in userApiComposable.ts
  stores/dashboardPreferences.ts
  Register in centralStore.ts

Phase 4 — Wire up existing components
  pages/home.vue  (v-for over orderedSections, customize button)
  components/Home/LeavesMetric.vue  (visibleLeaveTypes replacing hard-coded sort)

Phase 5 — DashboardCustomizer.vue component

Phase 6 — Settings access point in EditUser.vue + i18n

Phase 7 — QA
  Default behavior unchanged for users with no saved preferences
  Dark mode, mobile layout
  ESLint pass
```
