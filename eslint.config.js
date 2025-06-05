import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import js from '@eslint/js'
import pluginVitest from '@vitest/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import autoImport from './.eslintrc-auto-import.mjs'


export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  skipFormatting,
  {
    // 設定 ESLint 全域變數，讓自動匯入的變數不會被標記為未定義錯誤
    languageOptions: autoImport
  },
  {
    rules: {
      /**
       * @description 關閉 Vue 屬性名稱必須使用連字符號的規則檢查
       * @see https://eslint.vuejs.org/rules/attribute-hyphenation#vue-attribute-hyphenation
       */
      'vue/attribute-hyphenation': [
        'off',
        {
          ignore: [], // 要忽略的屬性名稱列表
          ignoreTags: [], // 要忽略的標籤名稱列表
        },
      ],
    },
  },
]
