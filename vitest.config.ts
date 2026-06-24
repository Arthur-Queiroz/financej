import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// Pin the timezone so date-based assertions (e.g. isoDate) are deterministic
// regardless of the machine/CI timezone. Set before workers fork so they inherit it.
process.env.TZ = 'UTC'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/unit/**/*.test.ts'],
    setupFiles: ['test/unit/setup.ts']
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'app'),
      '~~': resolve(__dirname, '.')
    }
  }
})
