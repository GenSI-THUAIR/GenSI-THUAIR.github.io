import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true, unocss: true },
  {
    rules: {
      // 禁用所有 ESLint 规则
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/component-name-in-template-casing': 'off',
      'unocss/order-attributify': 'off',
      // 禁用所有规则
      ...Object.fromEntries(
        Object.keys(require('@soybeanjs/eslint-config').rules || {}).map(rule => [rule, 'off'])
      )
    }
  }
);
