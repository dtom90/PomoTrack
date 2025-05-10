import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
import { configureVueProject } from '@vue/eslint-config-typescript'
configureVueProject({ scriptLangs: ['ts', 'tsx', 'js'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,cy.ts}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist_web/**',
    '**/dist_electron/**',
    '**/coverage/**',
    '**/.nuxt/**',
    '**/.output/**',
  ]),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    rules: {
      'no-console': 'error',
      'vue/multi-word-component-names': 'off',
    },
  },

  /* eslint-disable @typescript-eslint/no-require-imports */
  {
    files: ['cypress/**/*.{ts,mts,tsx,vue,cy.ts}'],
    plugins: {
      cypress: require('eslint-plugin-cypress'),
      'chai-friendly': require('eslint-plugin-chai-friendly'),
      'no-only-tests': require('eslint-plugin-no-only-tests')
    },
    languageOptions: {
      globals: {
        ...require('eslint-plugin-cypress').environments.globals.globals
      }
    },
    rules: {
      'no-unused-expressions': 0, // disable original rule
      'chai-friendly/no-unused-expressions': 2,
      'no-only-tests/no-only-tests': 'error'
    }
  }
)
