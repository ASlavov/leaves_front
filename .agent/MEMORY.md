# Project Memory

## Architecture Decisions

### Translation System
- **Choice**: `@nuxtjs/i18n`
- **Reason**: Seamless integration with Nuxt 3, support for lazy-loading translations, and easy-to-use `$t` functions.
- **Locale Strategy**: `no_prefix` for the default locale (`el`) to maintain existing URL structures.
- **Organization**: Translation keys are structured hierarchically (e.g., `settings.firstName`, `common.saveChanges`) for better maintainability.

## Resolved Issues

### Greek Character Encoding
- **Problem**: Hardcoded Greek strings in `.vue` files were being displayed as gibberish due to encoding mismatches.
- **Fix**: Migrated all Greek strings to `el.json` translation files. Externalizing the strings ensures consistent encoding (UTF-8) and allows the i18n module to handle the display correctly.

## Context

### Component & Page Migration
- **Coverage**: 100% of the active `components/` and `pages/` directories have been audited and updated to use i18n.
- **Backup**: Original files with potentially broken encoding were kept in `intelligence_translations` for reference during extraction.
- **State Management**: Integrated `i18n` with Pinia stores where necessary (e.g., toast messages for store actions).

### Pinia Stores
- Stores are accessed through `useCentralStore()` which provides a unified access point to `userStore`, `leavesStore`, etc.
