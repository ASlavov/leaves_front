# Agent Changes Log

This file tracks all changes made by the AI agent during the architectural stabilization phase.

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
