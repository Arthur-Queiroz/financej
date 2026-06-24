import { describe, it, expect, beforeEach, vi } from 'vitest'
import { requireUserId } from '../../server/utils/auth'

describe('requireUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns internal user ID when auth is valid', async () => {
    const event = {
      context: {
        auth: () => ({ userId: 'clerk-user-123' })
      }
    } as any

    const id = await requireUserId(event)
    expect(id).toBe('internal-user-id')
    expect(globalThis.db.user.upsert).toHaveBeenCalledWith({
      where: { clerkId: 'clerk-user-123' },
      update: {},
      create: { clerkId: 'clerk-user-123' },
      select: { id: true }
    })
  })

  it('throws 401 when context.auth is undefined', async () => {
    const event = {
      context: {}
    } as any

    await expect(requireUserId(event)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unauthorized'
    })
  })

  it('throws 401 when auth getter returns null userId', async () => {
    const event = {
      context: {
        auth: () => ({ userId: null })
      }
    } as any

    await expect(requireUserId(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('throws 401 when auth getter returns undefined userId', async () => {
    const event = {
      context: {
        auth: () => ({})
      }
    } as any

    await expect(requireUserId(event)).rejects.toMatchObject({
      statusCode: 401
    })
  })

  it('calls db.user.upsert with correct clerkId', async () => {
    const event = {
      context: {
        auth: () => ({ userId: 'clerk-xyz-999' })
      }
    } as any

    await requireUserId(event)
    expect(globalThis.db.user.upsert).toHaveBeenCalledTimes(1)
    const callArgs = (globalThis.db.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(callArgs.where.clerkId).toBe('clerk-xyz-999')
    expect(callArgs.create.clerkId).toBe('clerk-xyz-999')
  })
})
