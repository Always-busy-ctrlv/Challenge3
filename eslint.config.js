import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-alert': 'error',
      'no-with': 'error',
      'no-iterator': 'error',
      'no-return-assign': 'error',
      'no-void': 'error',

      // Code quality
      'eqeqeq': ['error', 'always'],
      'no-self-compare': 'error',
      'no-shadow-restricted-names': 'error',
      'no-unused-expressions': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-lonely-if': 'error',
      'no-unneeded-ternary': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'radix': 'error',
      'curly': ['error', 'multi-line'],
      'complexity': ['warn', 15],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 5],
      'max-nested-callbacks': ['warn', 3],
      'no-console': 'warn'
    }
  },
  // Relax certain rules for test files
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'max-nested-callbacks': 'off',
      'no-console': 'off'
    }
  },
])
