# AGENT_DOCUMENTATION (V1.2)

## TECH STACK

Nuxt 3 (SSR), TypeScript, Pinia (Setup Stores), Tailwind CSS, `@nuxtjs/i18n`, `@nuxtjs/color-mode`, VueUse, flatpickr.

## CORE ARCHITECTURE

- **Global Store**: `stores/centralStore.ts` (proxies `auth`, `user`, `leaves`, `depts`, `notifs`, `perms`, `entitlement`, `holidays`, `workWeek`, `invitations`).
- **Data Flow**: `Components` → `Stores` → `Composables` → `Server API (Nitro)` → `Laravel Backend`.
- **API Wrapper**: `utils/retryFetch.ts` (exponential backoff, 401/403 auto-logout).
- **No Preline UI**: Removed entirely. All interactive behavior uses native Vue 3 reactivity (ref booleans, `:class`, `<Transition>`, `<Teleport>`).

## STORES (useCentralStore)

- `auth`: session mgmt (login/logout/me).
- `user`: user profile & global user list. Actions: `editUser`, `addUser`, `terminateUser`.
- `leaves`: leave requests CRUD & status actions. Actions: `adminLeave` (HR records leave for any user).
- `departments`: dept CRUD & membership.
- `notifications`: user-specific notification stream.
- `permissions`: RBAC using `can(perm, action)` logic. Categories: `leaves`, `departments`, `entitlement`, `leave_types`, `work_week`, `public_holidays`, `invitations`.
- `entitlement`: leave balance & mass imports.
- `holidays`: public holidays CRUD + batch operations.
- `workWeek`: company work-week configuration (get/update).
- `invitations`: calendar sharing invitations (sent/received, accept/decline/revoke).

## API ROUTES (server/api)

- Proxies to `${config.public.apiBase}` (Laravel).
- Auth token passed via `event.context` (HTTP-only cookie → JWT).
- Route groups: `/auth`, `/leaves`, `/user`, `/departments`, `/entitlement`, `/notifications`, `/holidays`, `/settings`, `/invitations`.

## UI ORGANIZATION & COMPONENTS

### Layout & Global (`components/SidebarTopbar`)

- `Sidebar.vue`, `SidebarMenu.vue`: Main navigation. Mobile sidebar uses `sidebarOpen` ref + `<Transition>`.
- `MyAccount.vue`, `UserNotification.vue`: User-specific header tools.
- `ColorModeSwitcher.vue`, `LanguageSwitcher.vue`, `Search.vue`.

### Common & Utilities (`components/misc` & `components/shared`)

- `CustomSelect.vue`, `CustomMultiSelect.vue`: Standardized dropdowns (Figma-styled).
- `FilterInput.vue`: Reusable filter field.
- `UserAvatar.vue` (`components/shared`): Centralized avatar rendering — image or fallback initials.
- `BaseModal.vue` (`components/shared`): Universal modal shell (`<Teleport to="body">`, `maxWidth` prop). All modals use this.

### Composables

- `useFormStyles.ts`: Single source of truth for form token classes (input, label, submitBtn) matching Figma design spec.

### Feature Areas

- `components/Calendar`: `Calendar.vue` (Schedule-x wrapper).
- `components/Leaves`:
  - `YearlyLeaves.vue`: Main leave request list/filter/action.
  - `AdminLeaveModal.vue`: HR/Admin records a leave on behalf of any user.
- `components/Home`:
  - `NewLeave.vue`: Leave submission form. Supports hourly leaves (time pickers), attachment upload (base64), wallet overflow warning, flatpickr with working-day-aware disable logic.
  - `LeavesMetric.vue`, `Metrics.vue`: Stats/radial bar chart (custom SVG, no ApexCharts).
  - `ProfileInfo.vue`, `CancelLeave.vue`.
- `components/Settings`:
  - `UsersList.vue`, `GroupsList.vue`, `Permissions.vue`, `EntitlementDays.vue`: Admin CRUD.
  - `EditUser.vue`: Add/edit user. Includes `work_schedule` day-picker, `hire_date`, `termination_date`.
  - `EditLeaveType.vue`: Add/edit leave type including full rules-engine fields (priority, overflow, accrual, hourly, attachment threshold).
  - `WorkWeekSettings.vue`: Toggle working days (Mon–Sun), save. Read-only for non-admins.
  - `PublicHolidays.vue`: Year navigator, recurring/one-time badges, checkbox multi-select, mass-add/delete, flatpickr `mode: "multiple"`.
  - `Invitations.vue`: Calendar sharing — sent/received panels, accept/decline/revoke, send modal.
  - `TerminateUserModal.vue`: Confirm termination date, warns about future leaves to be cancelled.

## PAGES

- `/home`: Dashboard overview.
- `/calendar`: Visual leave schedule (includes connected users' leaves via invitations).
- `/settings`: Unified admin/user config. Tabs: Users, Groups, Entitlements, Leave Types, Work Week, Public Holidays, Calendar Sharing, Permissions.
- `/yearly-leaves`: Full historical leave records. HR+ see "Record Leave" button (AdminLeaveModal).
- `/auth/login`: Entrance.

## I18N

- Locales: `locales/el.json` (default), `locales/en.json`.
- Usage: `$t('key')` in templates, `t('key')` in scripts.

## CONVENTIONS

- Use `useCentralStore()` for all data access.
- All API calls through `composables/*ApiComposable.ts`.
- Components are functional & localized — no hardcoded English strings.
- Day numbering: `0=Sunday, 1=Monday … 6=Saturday` everywhere (Carbon `dayOfWeek`, JS `Date.getDay()`, CompanySetting stored values).
- File uploads: Base64 encoding in JSON body (not multipart/form-data).
- Leave type field name for create/update: `leave_type_name`.

## RULES ENGINE (LeaveType-level)

Each `LeaveType` carries rules-engine columns:

| Column | Purpose |
|--------|---------|
| `priority_level` | Lower = higher priority; used to check wallet depletion order |
| `allow_wallet_overflow` | Auto-split into `overflow_leave_type_id` when wallet exhausted |
| `overflow_leave_type_id` | FK → another LeaveType (typically Unpaid) |
| `accrual_type` | `upfront` or `pro_rata_monthly` |
| `allow_negative_balance` | Allow leave even when wallet at 0 |
| `max_negative_balance` | Cap on negative deduction |
| `is_hourly` | Hourly leave type; stores `total_hours`, `start_time`, `end_time` |
| `hours_per_day` | Working hours per day (default 8) |
| `attachment_required_after_days` | Require document if leave ≥ N days |

## WORKING DAYS & HOLIDAY HANDLING

- Backend: `WorkingDaysHelper::countWorkingDays(start, end, ?userId)` — per-user schedule override, dual holiday query (moving by exact date + recurring by `MM-DD`), returns `float` for hourly support.
- Frontend: `NewLeave.vue` mirrors this via flatpickr `disable` function.
- `PublicHolidayService`: retroactive refunds when a new holiday is added inside an approved leave range.
- `holiday_adjustments` table tracks all retroactive refund/charge events.
