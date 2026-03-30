# Agent Changes Log

This file tracks all changes made by the AI agent during the architectural stabilization phase.

---
## 18. Store Error Reporting Consistency

### Problem
Three newly created stores (`holidays.ts`, `workWeek.ts`, `invitations.ts`) had inconsistent or missing error reporting compared to the established pattern in `entitlement.ts` and `notifications.ts`. `holidays.ts` used hardcoded English strings instead of i18n keys for the fetch error and had bare `throw err` with no `setError` call in mutation actions. `workWeek.ts` had the same two problems. `invitations.ts` had no `error` ref, no `setError` helper, and no `useI18n` at all. Additionally, both stores were missing locale keys for batch operations (`batchCreateFailed`, `batchDeleteFailed`) and no `errors.invitations.*` keys existed in either locale.

### Implementation Rationale
All stores should follow the same contract: `const { t } = useI18n()` + `const setError = (msg) => { error.value = msg; }` + every `catch` block calls `setError(t('errors.category.action'))` then rethrows so the consuming component can still show a toast. Background fetches also rethrow so init failures surface. This makes the `error` ref on each store usable for in-component error display if ever needed, and ensures all user-facing error strings go through the i18n pipeline.

### Code Changes
- **`stores/holidays.ts`**: Added `useI18n` import, `setError` helper. Replaced hardcoded `'Failed to fetch holidays'` with `t('errors.holidays.fetchFailed')`. Added `setError` calls to all six actions (`createHoliday`, `updateHoliday`, `deleteHoliday`, `createHolidayBatch`, `deleteHolidayBatch`).
- **`stores/workWeek.ts`**: Added `useI18n` import, `setError` helper. Replaced hardcoded string in `fetchWorkWeek`. Added `setError` to `updateWorkWeek`.
- **`stores/invitations.ts`**: Added `error` ref, `useI18n` import, `setError` helper. All four actions (`fetchInvitations`, `sendInvitation`, `respondToInvitation`, `revokeInvitation`) now call `setError` before rethrowing. `reset()` now also clears `error`. `error` added to the returned store object.
- **`locales/en.json`**: Added `errors.holidays.batchCreateFailed`, `errors.holidays.batchDeleteFailed`, `errors.invitations.fetchFailed`, `errors.invitations.sendFailed`, `errors.invitations.respondFailed`, `errors.invitations.revokeFailed`.
- **`locales/el.json`**: Same keys added in Greek.

---
## 17. Calendar Leave Visibility for Connected Users

### Problem
The `allUserLeaves` endpoint in `LeavesController` — which the calendar page calls — did not include connected users' leaves for role 4 (regular user). It only queried `WHERE id = $userId`, completely ignoring the `connected_users` JSON column populated by the invitations system. This meant the calendar sharing feature was non-functional: an accepted invitation updated `connected_users` correctly but the calendar never reflected it. A second bug was also present: role 2 (hr-manager) matched no `if` block and silently returned `null`.

### Implementation Rationale
The fix is purely backend. The calendar frontend already iterates over an array of `{ id, name, leaves[] }` user objects, so appending additional user objects for connected users requires no frontend changes. Role 4 now collects its own ID plus all IDs in `connected_users`, then performs a single `whereIn` query returning all relevant users with their leaves. Admin and HR manager are collapsed into a single `whereIn('role_id', [1, 2])` check.

### Code Changes
- **`app/Http/Controllers/Api/LeavesController.php`** (`allUserLeaves` method):
  - Replaced the three separate `if` blocks for roles 1, 3, 4 with a cleaner ordering: admin+HR first (roles 1+2 together), then head (role 3), then regular user (role 4).
  - Role 4 block: decodes `connected_users` (with `json_decode` guard for string vs array storage), merges IDs, and issues a single `User::whereIn('id', $userIds)->with('leaves')->get()`.
  - Role 2 (hr-manager) now returns all users with leaves instead of `null`.

---
## 16. Calendar Invitations System

### Problem
There was no mechanism for regular users to share their leave calendar with specific colleagues. Only admins and HR could see all leaves; heads could see their department; users were isolated to their own data. A previous developer had partially implemented an `invitations` table and `InvitationController` (create + updateStatus endpoints) along with a `connected_users` JSON column on the `users` table, but there were no GET or DELETE endpoints, no frontend UI, and no store or composable layer.

### Implementation Rationale
The invitation model: User X sends an invitation to User Y → Y accepts → X's `connected_users` gets Y's ID appended → X can now see Y's leaves on the calendar (one-directional). The UI lives in a dedicated "Calendar Sharing" settings tab visible to all roles. All API calls go through a composable layer (`invitationsApiComposable.ts`) — no `$fetch` directly in the store. The server routes inject `requestingUserId` from `event.context` for the GET and DELETE endpoints so the client never needs to pass `user_id` manually for those; PATCH follows the existing `updateStatus` pattern and accepts `user_id` in the body.

### Code Changes
**Backend:**
- **`app/Http/Controllers/Api/InvitationController.php`**: Added `list()` — validates `user_id` query param (required, integer, exists:users), returns `{ sent: [...], received: [...] }` with `sender`/`receiver` relationships eager-loaded. Added `destroy()` — validates `user_id` in body, checks ownership with explicit `(int)` casts, cleans up `connected_users` if invitation was accepted (with `json_decode` guard), then deletes the record.
- **`routes/api.php`**: Added `GET /invitations` and `DELETE /invitations/{id}` routes with `auth:sanctum` middleware.

**Frontend:**
- **`nuxt.config.ts`**: Added `invitations: { list, create, updateStatus, delete }` to `runtimeConfig.public`.
- **`types/index.ts`**: Added `InvitationUser` and `Invitation` interfaces.
- **`server/api/invitations/index.get.ts`**: Proxies GET, injects `requestingUserId` from context as `?user_id=` query param.
- **`server/api/invitations/index.post.ts`**: Proxies POST for new invitation.
- **`server/api/invitations/[id].patch.ts`**: Proxies PATCH for accept/decline, forwards `user_id` + `status` body.
- **`server/api/invitations/[id].delete.ts`**: Proxies DELETE, injects `requestingUserId` from context as `user_id` in body.
- **`composables/invitationsApiComposable.ts`**: Exports `getInvitationsComposable`, `createInvitationComposable`, `updateInvitationStatusComposable`, `deleteInvitationComposable` — all via `retryFetch`.
- **`stores/invitations.ts`**: Pinia store with `sent`, `received`, `loading`, `error` refs. Actions: `fetchInvitations`, `sendInvitation`, `respondToInvitation`, `revokeInvitation`.
- **`stores/centralStore.ts`**: `useInvitationsStore` imported, initialized in `Promise.all`, reset on logout, exposed as `invitationsStore`.
- **`stores/permissions.ts`**: Added `invitations: { view: all roles, modify: all roles }`.
- **`components/Settings/Invitations.vue`**: Two-panel layout — left panel shows sent invitations (status badge + revoke X), right panel shows received (accept/decline buttons for pending, status badge otherwise, revoke X). "Send Invitation" button opens a searchable multi-select modal (already-invited users filtered out). Revoke has a confirmation modal. All actions show toast on success/failure.
- **`pages/settings.vue`**: Added "Calendar Sharing" tab using `invitations.view` permission.
- **`components/Settings/Permissions.vue`**: Added `invitations` row to category definitions and `hasPermission` matrix for all four roles.
- **`locales/en.json` + `locales/el.json`**: Added full `invitations.*` key tree and `common.sending`.

---
## 15. Preline UI Removal

### Problem
The project had Preline UI as a dependency whose JavaScript plugin was throwing console errors. Several components relied on Preline's CSS-class-driven state machines (`hs-overlay`, `hs-dropdown`, `hs-accordion-group`) for modals and dropdowns, which required the Preline plugin to initialize on each page navigation — an inherently fragile pattern incompatible with Nuxt's SPA routing.

### Implementation Rationale
Replace every Preline-driven behavior with native Vue 3 reactivity (`ref` booleans, `:class` bindings, `<Transition>`, `<Teleport>`). This eliminates the external dependency entirely and makes all interactive behavior deterministic and inspectable without a browser plugin.

### Code Changes
- **`plugins/preline.client.ts`**: Deleted.
- **`nuxt.config.ts`**: Removed `script[]` block and plugin entry for Preline.
- **`tailwind.config.js`**: Removed `node_modules/preline/dist/*.js` from `content[]` and `require('preline/plugin')` from `plugins[]`.
- **`package.json`**: `preline` uninstalled.
- **`components/Home/CancelLeave.vue`**: Replaced `hs-overlay` modal with `v-if="isOpen"` + `<Teleport to="body">` + `<Transition name="modal">` fade. Trigger changed to `@click.prevent="isOpen = true"`. Backdrop click closes.
- **`components/SidebarTopbar/MyAccount.vue`**: Replaced `hs-dropdown` with `isOpen` ref + `onClickOutside(dropdownRef, ...)` from VueUse. `<Transition name="dropdown">` with slide+fade animation.
- **`components/SidebarTopbar/Sidebar.vue`**: Replaced `hs-overlay` mobile sidebar with `sidebarOpen` ref. `:class` toggles `translate-x-0 / -translate-x-full`. Semi-transparent backdrop with `<Transition name="backdrop">`. `watch(route.path)` closes sidebar on navigation.
- **`components/SidebarTopbar/SidebarMenu.vue`**: Removed `hs-accordion-group` class and `data-hs-accordion-always-open` attribute. Added `defineEmits(['navigate'])`; all `NuxtLink`s emit `navigate` on click so the sidebar can close on mobile.

---
## 14. Permissions for WorkWeek & PublicHolidays

### Problem
The newly added WorkWeek and PublicHolidays settings tabs had no permissions gating — any role could modify them. The Permissions page matrix also did not list these new categories.

### Implementation Rationale
HR and admin should be the only roles that can modify company-wide settings like working days and public holidays. All roles can view them (so leaves are calculated correctly and transparently). The `canModify` computed in each component gates all write controls.

### Code Changes
- **`stores/permissions.ts`**: Added `work_week: { view: all, modify: admin+hr-manager }` and `public_holidays: { view: all, modify: admin+hr-manager }`.
- **`components/Settings/WorkWeekSettings.vue`**: Added `canModify` computed; save button and day-click handlers wrapped with `v-if="canModify"` / disabled state.
- **`components/Settings/PublicHolidays.vue`**: All write controls (add, edit, delete, mass-add, mass-delete buttons) wrapped with `v-if="canModify"`.
- **`components/Settings/Permissions.vue`**: Added `work_week` and `public_holidays` to `categoryDefinitions` computed and to the `hasPermission` matrix for all four roles.

---
## 13. Mass Add/Delete + Recurring/Moving Holidays

### Problem
The initial public holidays implementation only supported adding one holiday at a time and had no way to distinguish between fixed-date holidays (that repeat every year, e.g. Christmas) and one-off moving holidays (e.g. Easter, which falls on a different date each year).

### Implementation Rationale
**Recurring vs moving**: A holiday with `is_recurring = true` is stored once and matched by `MM-DD` regardless of year. A holiday with `is_recurring = false` is matched by exact `YYYY-MM-DD`. This maps cleanly to the two real-world categories and requires no duplicate storage for recurring holidays. **Batch operations**: HR teams need to add multiple days off at once (e.g. a whole holiday week). Using flatpickr `mode: "multiple"` and a single `INSERT IGNORE` batch query makes this efficient.

### Code Changes
**Backend:**
- **Migration** `add_is_recurring_to_public_holidays_table.php`: Added `boolean is_recurring default true`.
- **`PublicHoliday` model**: Added `is_recurring` to `$fillable` and cast to boolean.
- **`WorkingDaysHelper::countWorkingDays()`**: Fetches moving holidays (exact date match) and recurring holidays (`MM-DD` hash) separately for O(1) per-day lookup.
- **`PublicHolidaysController`**: `index()` returns recurring holidays always + moving holidays filtered by year. `store/update` accept `is_recurring`. Added `storeBatch()` (uses `insertOrIgnore`) and `destroyBatch()`.
- **`routes/api.php`**: Batch routes placed before `{id}` routes to avoid parameter conflicts.
- **`server/api/holidays/index.post.ts` + `[id].put.ts`**: Fixed to forward `is_recurring: body.is_recurring ?? true` (was being silently dropped).

**Frontend:**
- **`server/api/holidays/batch.post.ts`** + **`batchDelete.delete.ts`**: New Nuxt server routes.
- **`composables/holidaysApiComposable.ts`**: Added `createHolidayBatchComposable` and `deleteHolidayBatchComposable`.
- **`stores/holidays.ts`**: Added `createHolidayBatch` and `deleteHolidayBatch` actions.
- **`components/Settings/PublicHolidays.vue`**: Year navigator, recurring/one-time badge, checkbox multi-select, mass-delete button (appears when items checked), mass-add modal with flatpickr `mode: "multiple"`, add/edit modal with recurring toggle.

---
## 12. NewLeave.vue Date Format Bug Fix

### Problem
The start date stored in `startDate.value` was a raw JS `Date` object, which serialized as an ISO string with UTC offset (e.g. `2026-04-07T21:00:00.000Z`) when sent to the backend. The backend expected `YYYY-MM-DD`. The same UTC-offset issue existed in `isExcludedDay` which called `toISOString()`. Additionally, the end date flatpickr instance had no `onChange` handler, so `endDate.value` was never updated after the picker re-initialized.

### Implementation Rationale
Using `getFullYear/getMonth/getDate` (local time methods) instead of `toISOString()` (UTC) ensures the date string always reflects the user's local calendar date regardless of timezone. A `toLocalDateStr()` helper centralizes this logic.

### Code Changes
- **`components/Home/NewLeave.vue`**: Added `toLocalDateStr(date)` helper using `getFullYear/getMonth/getDate`. Applied to `startDate.value` assignment, `endDate.value` assignment (via new `onChange` handler on the end-date picker), and replaced `toISOString()` in `isExcludedDay`. `datePickrSettings` changed from plain object to `computed(() => ({...}))` to reactively update when work week or holidays change.

---
## 11. Working Days & Public Holidays System

### Problem
Leave day counts were calculated using raw calendar days (`diffInDays + 1`), ignoring weekends and public holidays. There was no admin interface to configure which days of the week are working days, and no public holiday management.

### Implementation Rationale
The backend counts working days by iterating each day in the requested range, skipping non-working days of the week (configurable) and public holidays (with efficient `MM-DD` hash for recurring ones). The frontend mirrors this logic exactly in the flatpickr `disable` function so the day count shown to the user before submitting is always accurate.

### Code Changes
**Backend:**
- **Migrations**: `create_public_holidays_table` (id, date UNIQUE, name, timestamps) and `create_company_settings_table` (id, key UNIQUE, value JSON, timestamps).
- **`app/Models/PublicHoliday.php`**: Fillable `date`, `name`, `is_recurring`; boolean cast.
- **`app/Models/CompanySetting.php`**: Key-value JSON store with static `get(key, default)` / `set(key, value)` helpers.
- **`app/Helpers/WorkingDaysHelper.php`**: `countWorkingDays(start, end)` iterates each day, checks `dayOfWeek` against configured working days and holiday hashes.
- **`app/Http/Controllers/Api/LeavesController.php`**: Replaced `diffInDays + 1` with `WorkingDaysHelper::countWorkingDays()`.
- **`app/Http/Controllers/Api/PublicHolidaysController.php`**: Full CRUD.
- **`app/Http/Controllers/Api/CompanySettingsController.php`**: `getWorkWeek()` / `updateWorkWeek()`.
- **`routes/api.php`**: All new routes registered.

**Frontend:**
- **`nuxt.config.ts`**: Added `holidays` and `companySettings` endpoint groups to `runtimeConfig.public`.
- **`types/index.ts`**: Added `PublicHoliday` and `WorkWeekSettings` interfaces.
- **`server/api/holidays/`** + **`server/api/settings/`**: Full set of proxy routes.
- **`composables/holidaysApiComposable.ts`** + **`composables/settingsApiComposable.ts`**: All API calls via `retryFetch`.
- **`stores/holidays.ts`** + **`stores/workWeek.ts`**: Pinia stores with full CRUD / fetch+update.
- **`stores/centralStore.ts`**: Both stores initialized in `Promise.all`, reset on logout, exposed.
- **`components/Settings/WorkWeekSettings.vue`**: Day toggle buttons (Mon–Sun), save, read-only mode for non-modifiers.
- **`components/Settings/PublicHolidays.vue`**: Year navigator, holiday list, add/edit/delete modals.
- **`pages/settings.vue`**: Two new tabs — "Work Week" and "Public Holidays".
- **`locales/en.json` + `locales/el.json`**: All new keys for work week, days, public holidays, recurring/one-time.

---
## 10. Modal Styling Unification (Figma Design System)

### Problem
Despite using a shared `BaseModal.vue` shell, the form components inside modals had inconsistent and mismatched styling: varied input heights, border colors, font sizes, button shapes, and dark mode tokens. The appearance diverged significantly from the Figma design spec (node `1066:4733`).

### Implementation Rationale
A single `useFormStyles` composable serves as the source of truth for all shared form tokens (input, label, submit button). This ensures pixel-perfect consistency with the Figma design across all modal form components, with no risk of per-component drift. `BaseModal.vue` was simultaneously updated to match the exact Figma modal container spec (shadow, radius, title typography).

### Design Tokens Applied (from Figma)
- **Modal**: `max-w-[675px]`, `rounded-[10px]`, `shadow-[0px_0px_12px_0px_rgba(0,0,0,0.25)]`, title `text-[24px] font-bold` centered
- **Input**: `h-[40px] py-[8px] px-[16px]`, `border-[#DFEAF2]`, `rounded-[8px]`, `bg-white`, `text-[14px]`, placeholder `#808080`
- **Label**: `text-[14px] font-bold mb-[8px]`
- **Submit button**: `rounded-[70px] py-[15px] px-[20px] font-bold text-[14px] bg-[#EA021A]`
- **Dark mode**: modal `neutral-900`, inputs `neutral-800`, borders `neutral-600`, labels `gray-100`, placeholders `neutral-400`

### Code Changes
- **`composables/useFormStyles.ts`** *(new file)*: Exports `input`, `label`, and `submitBtn` class strings as the single source of truth for all form token styling.
- **`components/shared/BaseModal.vue`**: Updated modal container to `max-w-[675px]`, `rounded-[10px]`, added Figma drop shadow, `dark:bg-neutral-900`. Title bar centered with `text-[24px] font-bold`; close button absolutely positioned top-right. Added `maxWidth` prop for smaller modals.
- **`components/misc/CustomSelect.vue`**: Updated trigger div to `h-[40px] py-[8px] px-[16px]`, `border-[#DFEAF2]`, `rounded-[8px]`, `dark:bg-neutral-800 dark:border-neutral-600`. Label styled with `text-[14px] font-bold mb-[8px] dark:text-gray-100`.
- **`components/misc/CustomMultiSelect.vue`**: Updated container to `min-h-[40px]`, `border-[#DFEAF2]`, `rounded-[8px]`, `dark:bg-neutral-800 dark:border-neutral-600`, `text-[14px]`.
- **`components/Settings/EditUser.vue`**: All inputs/labels/button switched to `useFormStyles` tokens. Modal mode uses `flex flex-wrap gap-[15px]` with `w-[300px]` fields; inline mode preserves original `grid grid-cols-12` layout with 132px avatar column.
- **`components/Settings/EditGroup.vue`**: Modal mode `flex flex-wrap gap-[15px]` with `w-[300px]` per field; inline mode preserves `grid grid-cols-2`. Uses `useFormStyles`.
- **`components/Settings/EditEntitlement.vue`**: Modal mode `flex flex-wrap gap-[15px]` with `w-[300px]` fields; inline mode preserves `grid grid-cols-2`. Date inputs retain flatpickr refs. Uses `useFormStyles`.
- **`components/Settings/EditLeaveType.vue`**: Styled with `px-[30px] pb-[30px] pt-[10px]` container. Single input + submit using `useFormStyles` tokens.
- **`components/Settings/NewLeaves.vue`**: Stripped old card layout. Restyled with `px-[30px] pb-[30px] pt-[10px]`, `flex flex-wrap gap-[15px]` grid, `w-[300px]` fields. Toggle button dark mode updated to `dark:bg-neutral-800 dark:border-neutral-600 dark:bg-neutral-700`. Uses `useFormStyles`.

---
## 9. Modal Homogenization

### Problem
Modal overlays were implemented with duplicated logic across 5+ list components. Additionally, the content components (EditUser, EditGroup, etc.) wrapped themselves in their own card containers, leading to a "card-inside-card" visual nesting when rendered inside a modal.

### Implementation Rationale
Centralizing the modal shell into a single `SharedBaseModal` component ensures consistent z-index management (via Teleport), overlay behavior, and close logic. By introducing an `asModal` prop to content components, we allow them to strip their internal card wrappers when rendered inside a modal, while preserving their appearance when rendered inline (e.g., in Profile Info).

### Code Changes
- **Core Component**: Created `components/shared/BaseModal.vue` to handle the generic modal overlay, container, and close actions.
- **Content Normalization**: Updated `EditUser.vue`, `EditGroup.vue`, and `EditEntitlement.vue` to accept an `asModal` prop, which conditionally removes their outer card styling.
- **Shell Refactor**: Overhauled `UsersList.vue`, `GroupsList.vue`, `EntitlementDays.vue`, `LeavesTypesList.vue`, and `LeavesList.vue` to use `<SharedBaseModal>` instead of manual `div` overlays.
- **Bug Fixes**: Wired missing `@saved` listeners in `LeavesTypesList` and `LeavesList` to ensure modals close automatically after successful operations.

---
## 8. EditLeaveType & NewLeaves Revamp

### Problem
The `EditLeaveType` component was only prepared for editing, causing errors when used in "Add" mode. It also contained deprecated deletion logic and redundant styling wrappers. `NewLeaves.vue` similarly contained hardcoded card headers that clashed with the new universal modal shell.

### Implementation Rationale
Consolidating creation and editing into a single, "flat" component reduces code duplication and ensures a consistent form experience. Removing orphaned deletion logic prevents data integrity issues (orphaned entitlements).

### Code Changes
- **EditLeaveType Revamp**: 
    - Support for "Add" mode when `leaveTypeId` is null.
    - Stripped all internal card wrappers and buttons to be "modal-aware" by default.
    - Logic added to call `leavesStore.createLeaveType` when in creation mode.
- **NewLeaves Revamp**: Stripped outer card wrapper and redundant headers to allow the `SharedBaseModal` to provide the container.
- **Backend Integration**: Created `server/api/leaves/newLeaveType.ts` and added `createLeaveType` action to `stores/leaves.ts` to support the new creation flow.

---
## 7. Required Field Visibility (Edit User/Profile)

### Problem
While the user creation flow was rectified, the "Edit User" and "Edit Profile" modes still lacked visual indicators (asterisks) for required fields, leading to inconsistent UI/UX compared to other forms in the application.

### Implementation Rationale
Standardizing the presence of red asterisks (`*`) for essential fields (First Name, Email, Group, and Role) helps users identify mandatory inputs regardless of whether they are creating a new user or editing an existing one.

### Code Changes
- **Component Update**: Modified `components/Settings/EditUser.vue` to always display `<span class="text-[#EA021A]">*</span>` for:
    - First Name
    - Email
    - Group (via `CustomSelect` label)
    - Role (via `CustomSelect` label)
- **Conditional Password**: The password asterisk remains conditionally rendered only in `isNewUser` mode, as it is only required for creation.

---
## 6. User Creation Rectification

### Problem
The `EditUser.vue` component was being overloaded for both "Add" and "Edit" modes, but it lacked a dedicated backend creation flow. Specifically, it was missing a `password` field and a `POST /api/users` integration, causing 500 errors when attempting to create a user via the `PUT /user-update` endpoint with a null `user_id`.

### Implementation Rationale
By explicitly branching the logic in `EditUser.vue` based on the presence of a `userId`, we can provide a dedicated creation experience (including the required password field and visual indicators) and target the correct RESTful backend endpoint (`POST /api/users`).

### Code Changes
- **Types & Composables**: Added `AddUserPayload` interface to `types/index.ts` and created `addUserComposable` in `composables/userApiComposable.ts`.
- **API Connectivity**: Created `server/api/user/addUser.ts` as a Nuxt server proxy route to handle user creation on the Laravel backend.
- **State Management**: Added the `addUser` action to `stores/user.ts` to handle the creation lifecycle and list refresh.
- **Component Logic**: Updated `components/Settings/EditUser.vue` to support `isNewUser` mode. Added a password input field, dynamic required field asterisks (`*`), and a branched `submitForm` method that calls `userStore.addUser` or `userStore.editUser` accordingly.
- **i18n**: Added missing `settings.password` and `settings.requiredFieldsMissing` translations to English (`en.json`) and Greek (`el.json`) locales.

---
## 5. Centralized User Avatar

### Problem
The avatar rendering pattern (image fallback to initials) was duplicated inline across 7+ components with no overarching abstraction. Additionally, the `User` type did not declare the `profile` sub-object, creating a type safety gap when accessing `user.profile.profile_image_base64`.

### Implementation Rationale
By creating a single `UserAvatar` component, we standardize the rendering logic, size propagation, and fallback initial calculation based on the `name` property. Updating the TypeScript `User` and `UserProfile` interfaces ensures type safety when handling avatar paths.

### Code Changes
- **Types Migrated**: Added `UserProfile` interface to `types/index.ts` and attached `profile?: UserProfile` to the `User` interface.
- **Component Created**: Created `components/shared/UserAvatar.vue` to handle the generic avatar rendering logic (`img` or initialized `span` based on the specified size).
- **Inline Avatars Removed**: Replaced duplicate code blocks with explicit local `<UserAvatar>` imports in `MyAccount.vue`, `ProfileInfo.vue`, `GroupsList.vue`, `UsersList.vue`, `LeavesList.vue`, and `EntitlementDays.vue`.

---
## 4. TypeScript Migration

### Problem
The application relied heavily on plain `.js` files for Pinia stores, composables, and utilities (like `retryFetch`), leading to poor type safety and developer experience.

### Implementation Rationale
By renaming these files to `.ts` and annotating function parameters and return types, we reduce runtime errors, improve IDE autocomplete, and establish a cleaner foundation for future development.

### Code Changes
- **Composables Migrated:** Renamed all composables to `.ts` and assigned explicit parameter types (`authApiComposable`, `departmentsApiComposable`, `entitlementApiComposable`, `leavesApiComposable`, `notificationsApiComposable`, `userApiComposable`).
- **Stores Migrated:** Converted all Pinia stores from `.js` to `.ts` (`auth`, `centralStore`, `departments`, `entitlement`, `leaves`, `notifications`, `permissions`, `user`).
- **Store Typings:** Overhauled store methods by typing reactive references (e.g., `ref<Notification[]>([])`), adding function signature typings (e.g., `userId: string | number`), and removing "implicitly has any" runtime bugs.
- **Utility Migrated:** Moved `utils/retryFetch.js` to `retryFetch.ts` and added payload typings.
- **Import Adjustments:** Scanned through all Vue components, stores, and config files to remove hardcoded `.js` extensions from our newly migrated `.ts` files (e.g. `stores/centralStore.js` -> `stores/centralStore`).

### Newly Defined Interfaces
To avoid generic `Record<string, any>` and `any` types throughout the app, a new `types/index.ts` file was created defining the domain architecture:
- **Domain Models:** `User`, `Department`, `Leave`, `Notification`, `Role`, `LeaveType`, `Entitlement`.
- **API Payloads:** `AuthUserPayload`, `UpdatePasswordPayload`, `NewDepartmentPayload`, `EditDepartmentPayload`, `AddEntitlementPayload`, `UpdateEntitlementPayload`, `LeaveActionPayload`, `EditUserPayload`.
These explicit types were aggressively injected back into the `composables/` endpoints and `stores/` reactivity modules.

---
## 1. Pinia Reactivity Anti-Pattern: setTimeout Hack

### Problem
Throughout the Pinia stores, there was a pattern of using setTimeout within the setError function to "force reactivity". This is an anti-pattern in Vue/Pinia. It indicates that components consuming the store are likely destructuring the state incorrectly (e.g., const { error } = useAuthStore() instead of const { error } = storeToRefs(useAuthStore())). The setTimeout artificially delays the assignment, causing unnecessary render cycles and potential race conditions.

### Implementation Rationale
By removing the artificial delay and setting the value directly (error.value = errorMessage;), we restore native Vue reactivity. The consuming components can then react to state changes synchronously and predictably.

### Code Changes

**Files Modified:** stores/auth.js, stores/centralStore.js, stores/leaves.js, stores/departments.js, stores/entitlement.js, stores/notifications.js, stores/user.js

**Previous Code:**
`javascript
const setError = (errorMessage) => {
    // Reset error to force reactivity
    error.value = null;
    setTimeout(() => {
        error.value = errorMessage; // Set the actual error message
    });
};
`

**New Code:**
`javascript
const setError = (errorMessage) => {
    error.value = errorMessage;
};
`

---
## 2. Redundant Component Registrations

### Problem
In Nuxt 3, components placed in the ~/components directory are automatically imported and registered globally. However, files like pages/home.vue, pages/calendar.vue, and pages/yearly-leaves.vue were using a secondary Options API script block solely to manually import and register components that were already available via auto-import. This adds unnecessary boilerplate, creates a mix of script setup and Options API, and goes against Nuxt 3 best practices.

### Implementation Rationale
By removing the redundant script blocks, we embrace Nuxt's auto-import capabilities, reducing file size and improving code cleanliness.

### Code Changes
**Files Modified:** pages/home.vue, pages/calendar.vue, pages/yearly-leaves.vue

**Previous Code (Example from home.vue):**
`vue
import Sidebar from '~/components/SidebarTopbar/Sidebar.vue'
import LeavesMetric from '~/components/Home/LeavesMetric.vue'
import Info from '~/components/Home/Info.vue'
export default {
    components: {
        Sidebar,
        LeavesMetric,
        Info
    }
}
`

**New Code:**
Nothing

---
## 3. Global CORS Configuration

### Problem
Previously, internal API routes like server/api/auth/login.ts and server/api/me.ts manually set CORS headers using setHeader(event, 'Access-Control-Allow-Origin', '*');. This is redundant and error-prone, requiring manual configuration for every new endpoint.

### Implementation Rationale
By moving CORS logic into 
uxt.config.ts via the 
outeRules property, we configure Nitropack to apply CORS rules automatically to all matching endpoints (e.g., /api/**), keeping endpoint handlers lean and ensuring unified behavior.

### Code Changes
**Files Modified:** 
uxt.config.ts, server/api/auth/login.ts, server/api/me.ts

**Previous Code (Example from login.ts):**
`	ypescript
export default defineEventHandler(async (event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*');
    // ...
`

**New Code (login.ts):**
`	ypescript
export default defineEventHandler(async (event) => {
    // ...
`

**New Code (nuxt.config.ts addition):**
`	ypescript
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  },
`

---
