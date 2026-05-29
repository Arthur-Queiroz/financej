import type { H3Event } from 'h3'

export async function requireUserId(event: H3Event): Promise<string> {
  // @clerk/nuxt@2.x stores auth as a lazy getter function on event.context.auth.
  // Call it to get the auth state object, then access userId.
  const getAuth = event.context.auth as (() => { userId?: string | null }) | undefined
  const userId = getAuth?.()?.userId

  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const user = await db.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
    select: { id: true }
  })

  return user.id
}
