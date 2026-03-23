# AGENT_DOCUMENTATION (V1.1)
## TECH STACK
Nuxt 3 (SSR), TypeScript, Pinia (Setup Stores), Tailwind CSS, Preline UI, @nuxtjs/i18n.
## CORE ARCHITECTURE
- **Global Store**: `stores/centralStore.ts` (proxies `auth`, `user`, `leaves`, `depts`, `notifs`, `perms`).
- **Data Flow**: `Components` -> `Stores` -> `Composables` -> `Server API (Nitro)` -> `Laravel Backend`.
- **API Wrapper**: `utils/retryFetch.ts` (exponential backoff, 401/403 auto-logout).
## STORES (useCentralStore)
- `auth`: session mgmt (login/logout/me).
- `user`: user profile & global user list.
- `leaves`: leave requests CRUD & status actions.
- `departments`: dept CRUD & membership.
- `notifications`: user-specific notification stream.
- `permissions`: RBAC using `can(perm, action)` logic.
- `entitlement`: leave balance & mass imports.
## API ROUTES (server/api)
- Proxies to `${config.public.apiBase}` (Laravel).
- Auth token passed via `event.context`.
- Routes: `/auth`, `/leaves`, `/user`, `/departments`, `/entitlement`, `/notifications`.
## UI ORGANIZATION & COMPONENTS
### Layout & Global (`components/SidebarTopbar`)
- `Sidebar.vue`, `SidebarMenu.vue`: Main navigation.
- `MyAccount.vue`, `UserNotification.vue`: User-specific header tools.
- **Sub-components**: `IconDark.vue`, `IconLight.vue`, `IconSepia.vue`, `IconSystem.vue` (Color mode icons), `ColorModeSwitcher.vue`, `LanguageSwitcher.vue`.
- `Search.vue`: Global search functionality.
### Common & Utilities (`components/misc`)
- `CustomSelect.vue`, `CustomMultiSelect.vue`: Standardized dropdowns.
- `FilterInput.vue`: Reusable filter field for lists.
### Feature Areas
- `components/Calendar`: `Calendar.vue` (Schedule-x wrapper).
- `components/Leaves`: `YearlyLeaves.vue` (Main leave request list/filter/action).
- `components/Home`: `NewLeave.vue` (Form), `LeavesMetric.vue`/`Metrics.vue` (Stats), `ProfileInfo.vue`.
- `components/Settings`: `UsersList.vue`, `GroupsList.vue`, `Permissions.vue`, `EntitlementDays.vue` (Admin CRUD).
## PAGES
- `/home`: Dashboard overview.
- `/calendar`: Visual leave schedule.
- `/settings`: Unified admin/user config.
- `/yearly-leaves`: Full historical leave records.
- `/auth/login`: Entrance.
## I18N
- Locales: `locales/el.json` (default), `locales/en.json`.
- Usage: `$t('key')` in templates, `t('key')` in scripts.
## CONVENTIONS
- Use `useCentralStore()` for all data access.
- All API calls through `composables/*ApiComposable.ts`.
- Components are functional & localized.
