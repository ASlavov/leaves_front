import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    // 1. Explicitly exclude the Playwright folder
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      './tests/e2e/**',
      '**/*.spec.ts', // If you use .spec.ts for Playwright and .test.ts for Vitest
    ],
    globals: true,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['utils/**', 'composables/**', 'stores/**', 'server/api/**', 'server/utils/**'],
      exclude: ['**/*.d.ts', 'node_modules/**', 'server/plugins/**', 'server/middleware/**'],
      thresholds: {
        lines: 70,
        functions: 70,
      },
    },
  },
});
