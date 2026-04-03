# Memory

## Architecture Decisions

- **ESLint v10 Flat Config**: Migrated from legacy `.eslintrc` to `eslint.config.mjs` to support modern ESLint features and performance improvements.
- **TypeScript Migration**: Enabled `lang="ts"` across most core components (`app.vue`, `CustomMultiSelect.vue`, etc.) to improve type safety and developer experience.
- **Shared Type Definitions**: Centralized types in `~/types/index.ts` (e.g., `User`, `Leave`, `Option`, `Department`) to ensure consistency across components and stores.
- **Component Refactoring**: Migrated legacy Options API components to `<script setup>` for better alignment with Nuxt 3 best practices.
- **Shared Components**: Extracted reusable elements like `SharedLogo` into `components/shared/` to reduce duplication and improve maintainability.
- **VS Code Alignment**: Created `.vscode/settings.json` to ensure the ESLint extension correctly handles Flat Config and auto-fixes on save.

## Resolved Issues

- **Nuxt $toast Typing**: Workaround for `useNuxtApp().$toast` missing types by using `(useNuxtApp() as any).$toast` or `const { $toast } = useNuxtApp() as any`. This resolved numerous `any` and `unsafe-member-access` errors.
- **Implicit any in Loops**: Resolved by adding explicit interfaces (`Option`, `Department`) to `.map()` and `.filter()` callbacks.
- **Legacy Files Cleanup**: Deleted `Calendar_OLD.vue` and related unused components to reduce linting noise.
- **Vitest Failure**: Fixed an assertion error in `YearlyLeavesFlow.test.ts` where 'John Doe' was expected but not found due to rendering delays or incorrect store state in tests.

## Context

- **RetryFetch**: Located in `utils/retryFetch.ts`. It wraps `useFetch` with retry logic for robust API communication.
- **Strict Linting**: The codebase is now at zero errors/warnings (excluding intentionally ignored legacy patterns if any remain). All future commits must pass `npx eslint .`.
