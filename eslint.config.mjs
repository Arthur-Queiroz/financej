// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Test mocks legitimately need `any` to stub framework objects (H3Event, etc.)
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    // Vue 3 supports multiple root nodes (fragments); this Vue 2-era rule is a false positive
    rules: {
      'vue/no-multiple-template-root': 'off'
    }
  }
)
