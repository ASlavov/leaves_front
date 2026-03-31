import { vi } from 'vitest';

/**
 * Global test setup applied before every test file.
 *
 * - Partially mocks vue-i18n so stores can call useI18n() without a real i18n
 *   plugin. Uses importOriginal to preserve createI18n and other exports that
 *   the @nuxtjs/i18n Nuxt plugin needs during app initialization.
 *   The `t` function returns the key string, so error assertions use the key
 *   (e.g. expect(store.error).toBe('errors.invitations.fetchFailed')).
 */
import { config } from '@vue/test-utils';

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>();
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key, locale: { value: 'el' } }),
  };
});

// Provide global $t for templates
config.global.mocks = {
  $t: (key: string) => key,
};
