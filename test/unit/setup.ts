import { vi } from 'vitest'

// Minimal stand-ins for the Nuxt/Nitro auto-imports used by server utils under test.
// We don't depend on `h3` here so the suite installs with only `vitest` and stays
// isolated from framework internals. `createError` only needs to produce an Error
// carrying `statusCode` and `message`, which is what the code asserts against.
globalThis.createError = (input: { statusCode?: number; message?: string }) => {
  const err = new Error(input?.message) as Error & { statusCode?: number }
  err.statusCode = input?.statusCode
  return err
}

const mockDb = {
  user: {
    upsert: vi.fn().mockResolvedValue({ id: 'internal-user-id' })
  }
}

globalThis.db = mockDb
