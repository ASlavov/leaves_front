# Agent Changes Log

This file tracks all changes made by the AI agent during the architectural stabilization phase.

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
