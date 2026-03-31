import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
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
