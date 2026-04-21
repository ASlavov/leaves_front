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
- **Org Chart**: Stored as a flat list with `parent_id` and `position`. Tree generation happens exclusively on the frontend inside `stores/orgChart.ts`.
- **Company Documents**: Leverages same Base64 payload method as leave attachments for file uploads. Extended to support Personal Documents via explicit `target_type` ('all' or 'user') mapping directly in payload shape without an explicit frontend adapter, reducing complexity.

## Resolved Issues

- **Nuxt $toast Typing**: Use `(useNuxtApp() as any).$toast` or `const { $toast } = useNuxtApp() as any`.
- **Strict Linting**: Codebase at zero errors/warnings. All commits must pass `npx eslint .`.
- **Pinia Reactivity**: Removed `setTimeout` hack in `setError`. Use `storeToRefs()` when destructuring store state in components.
- **Calendar Sharing**: Implemented via `invitations` system. Role 4 users see their own + connected users' leaves. Role 2 (hr-manager) also fixed to return all users.
- **NewLeave Date Bug**: Use `getFullYear/getMonth/getDate` (local time) not `toISOString()` (UTC) for date strings.
- **Float PTO Precision**: Added explicit `parseFloat` inside Nuxt `server/api/leaves/getLeavesAvailableDays.ts` and `.toFixed(2)` logic across `LeavesMetric.vue` and `Metrics.vue` to handle `decimal(8,2)` values coming as strings from backend queries, and prevent JavaScript float addition precision quirks.
- **OrgChart Sibling Link Bug**: Clicking `+ Peer` added the peer to the parent's level because the child node emitted `node.parent_id` instead of its own `node.id`, causing the recursive component page listener to look up the parent's parent ID to append the new node. Fixed by emitting `node.id` instead.
- **OrgChart Flat Save Bug**: The frontend was stripping negative `parent_id`s (from newly drafted nodes) to `null` before sending the `sync` payload, which disconnected newly formed relationships and turned every new node into a root. We now send `id` (even if temporary/negative) and `parent_id` unfiltered so Laravel can reconstruct associations.
- **Document API Forwarding**: Explicitly added `query: getQuery(event)` to the Nuxt proxy layer on `GET /documents` to ensure trailing GET query string variables (like `target_user_id`) flow successfully down to the Laravel server.
- **403 on /api/me Fix**: Removed `/api/me` from the exempt list in `server/middleware/verifyAuth.ts`. Previously, the middleware skipped this route, preventing `event.context.requestingUserId` and `token` from being set, which caused the `/api/me` handler to return a 403 "Not authenticated" error even when a valid session existed.

## Context

- **RetryFetch**: `utils/retryFetch.ts` — wraps `useFetch` with retry logic and exponential backoff.
- **Leave Type Field Name**: Backend uses `leave_type_name` for create/update requests.
- **Entitlement Decimal**: `entitled_days` and `remaining_days` are `decimal(8,2)` — supports hourly leave fractions.

## Backend existence

- **Folder**: `c:\laragon\www\intelligence-backend`
- **Database**: `intelligence`
- **Server**: `http://localhost:8000`