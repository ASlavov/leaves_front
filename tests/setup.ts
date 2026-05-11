import { vi } from 'vitest';

/**
 * Global test setup applied before every test file.
 *
 * - Partially mocks vue-i18n so stores can call useI18n() without a real i18n
 *   plugin. Uses importOriginal to preserve createI18n and other exports that
 *   the @nuxtjs/i18n Nuxt plugin needs during app initialization.
 *   The `t` function returns the key string, so error assertions use the key
 *   (e.g. expect(store.error).toBe('errors.invitations.fetchFailed')).
 *
 * - Exposes H3 server globals (defineEventHandler, createError, readBody)
 *   so that server/api route files can be imported in unit tests.
 *   Nuxt server auto-imports these at runtime but the client test environment
 *   does not; making them available globally lets the route modules load
 *   without ReferenceError.
 */
import { config } from '@vue/test-utils';
import { defineEventHandler, createError, readBody } from 'h3';

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

// H3 server globals — required for importing Nuxt server route files in tests
Object.assign(globalThis, { defineEventHandler, createError, readBody });

// pusher-js and laravel-echo are not compatible with happy-dom (the test DOM
// environment). Since plugins/echo.client.ts runs during app initialization for
// every component test, we mock both packages globally so the plugin loads
// without throwing "window.Pusher is not a constructor".
vi.mock('pusher-js', () => ({ default: class Pusher {} }));
vi.mock('laravel-echo', () => ({
  default: class Echo {
    connector = { pusher: { connection: { bind: vi.fn() } } };
    private() { return { notification: () => this }; }
    leave() {}
  },
}));
