# Project Memory

## Architecture Decisions

### Translation System
- **Choice**: `@nuxtjs/i18n`
- **Reason**: Seamless integration with Nuxt 3, support for lazy-loading translations, and easy-to-use `$t` functions.
- **Locale Strategy**: `no_prefix` for the default locale (`el`) to maintain existing URL structures.
- **Organization**: Translation keys are structured hierarchically (e.g., `settings.firstName`, `common.saveChanges`) for better maintainability.

### Role Localization & Centralization
- **Choice**: Centralized the role names in the `permissions` store (`permissions.ts`) using the `i18n` system.
- **Reason**: Role names are used both for UI display (in `EditUser.vue` and `Permissions.vue`) and as logical identifiers (in the permissions matrix). Centralizing them ensures that the display names are consistent across the app and correctly translated, while the logic remains decoupled from the translated strings.
- **Key Implementation**: The store provides an `allRoles` computed property that maps internal keys (like `admin`, `hr-manager`) to translated names using `t('roles.key')`.

## Resolved Issues

### Greek Character Encoding
- **Problem**: Hardcoded Greek strings in `.vue` files were being displayed as gibberish due to encoding mismatches.
- **Fix**: Migrated all Greek strings to `el.json` translation files. Externalizing the strings ensures consistent encoding (UTF-8) and allows the i18n module to handle the display correctly.

## Context

### Component & Page Migration
- **Coverage**: 100% of the active `components/` and `pages/` directories have been audited and updated to use i18n.
- **Backup**: Original files with potentially broken encoding were kept in `intelligence_translations` for reference during extraction.
- **State Management**: Integrated `i18n` with Pinia stores where necessary (e.g., toast messages for store actions).

### Agent Documentation
- **File**: `AGENT_DOCUMENTATION.md`
- **Purpose**: A dense, token-efficient architectural overview for AI agents. It should be the first file an agent reads when entering the project.

### Pinia Stores
- Stores are accessed through `useCentralStore()` which provides a unified access point to `userStore`, `leavesStore`, etc.
