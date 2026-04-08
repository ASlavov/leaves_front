# Memory

## Architecture Decisions

- **ESLint v10 Flat Config**: Migrated from legacy `.eslintrc` to `eslint.config.mjs` to support modern ESLint features and performance improvements.
- **TypeScript Migration**: Enabled `lang="ts"` across all core components and stores. Types modularized into feature-specific files (`auth.ts`, `user.ts`, `leave.ts`, etc.) with a central `models.ts`; `types/index.ts` is a barrel file.
- **Shared Type Definitions**: Centralized in `~/types/` to ensure consistency across components and stores.
- **Component Refactoring**: All components migrated to `<script setup>`. No legacy Options API.
- **Shared Components**: Reusable elements in `components/shared/` — `UserAvatar.vue`, `BaseModal.vue`.
- **VS Code Alignment**: `.vscode/settings.json` ensures ESLint Flat Config extension auto-fixes on save.
- **No Preline UI**: Removed entirely (was causing SPA routing conflicts). All interactive behavior via native Vue 3 reactivity.
- **Proxy Pattern**: Frontend never hits Laravel directly. Every call goes: Component → Store → Composable → Nuxt server route (`server/api/...`) → Laravel API.
- **Rules Engine**: Leave type behavior governed by rules-engine columns on `leaves_types` (priority, overflow, accrual type, hourly, attachment threshold). See `AGENT_DOCUMENTATION.md`.
- **Day Numbering Convention**: `0=Sunday, 1=Monday … 6=Saturday` everywhere — Carbon `dayOfWeek`, JS `Date.getDay()`, CompanySetting stored values. **NOT ISO weekday.**
- **Holiday Handling**: Two-query pattern — moving holidays by exact date, recurring holidays by `MM-DD` pattern. `WorkingDaysHelper` returns `float` for hourly support.
- **File Uploads**: Base64 encoding in JSON body (existing pattern). Not multipart/form-data.
- **CompanySetting Access**: Always via `CompanySetting::get($key, $default)` — model casts `value` to array already.
- **Per-User Schedule**: `users.work_schedule` JSON column (nullable) overrides company `work_week` setting in `WorkingDaysHelper`.
- **Administrative Leaves**: HR/admin can record leaves for any user via `POST /admin-leave`. Sets `is_administrative = true`; bypasses wallet checks.
- **Wallet Overflow**: When a leave exhausts a wallet and `allow_wallet_overflow = true`, the system auto-creates a child leave (linked via `parent_leave_id`) for the overflow segment using the `overflow_leave_type_id` type (typically Unpaid).

## Resolved Issues

- **Nuxt $toast Typing**: Use `(useNuxtApp() as any).$toast` or `const { $toast } = useNuxtApp() as any`.
- **Strict Linting**: Codebase at zero errors/warnings. All commits must pass `npx eslint .`.
- **Pinia Reactivity**: Removed `setTimeout` hack in `setError`. Use `storeToRefs()` when destructuring store state in components.
- **Calendar Sharing**: Implemented via `invitations` system. Role 4 users see their own + connected users' leaves. Role 2 (hr-manager) also fixed to return all users.
- **NewLeave Date Bug**: Use `getFullYear/getMonth/getDate` (local time) not `toISOString()` (UTC) for date strings.

## Context

- **RetryFetch**: `utils/retryFetch.ts` — wraps `useFetch` with retry logic and exponential backoff.
- **Leave Type Field Name**: Backend uses `leave_type_name` for create/update requests.
- **Entitlement Decimal**: `entitled_days` and `remaining_days` are `decimal(8,2)` — supports hourly leave fractions.
