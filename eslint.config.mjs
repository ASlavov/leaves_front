import withNuxt from './.nuxt/eslint.config.mjs';
import prettier from 'eslint-plugin-prettier/recommended';

export default withNuxt(
  {
    ignores: ['tests/**', '.nuxt/**', '.output/**', 'dist/**', 'types/**/*.d.ts'],
  },
  prettier,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // any is legitimate in this codebase (API responses, catch blocks, cast helpers)
      '@typescript-eslint/no-explicit-any': 'off',

      // Vue 3 supports multiple root elements — this rule is Vue 2 only
      'vue/no-multiple-template-root': 'off',

      // v-html is used intentionally in a few places (team is aware of the XSS tradeoff)
      'vue/no-v-html': 'off',

      // Unused vars: allow _-prefixed names; don't report unused catch bindings
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // default props are not required when undefined is an acceptable default
      'vue/require-default-prop': 'off',
    },
  },
);
