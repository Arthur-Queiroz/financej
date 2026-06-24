import { Webhook } from 'svix'

type ClerkWebhookEvent
  = | { type: 'user.created', data: { id: string } }
    | { type: string, data: unknown }

export default defineEventHandler(async (event) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'Webhook secret not configured' })
  }

  const payload = await readRawBody(event)
  if (!payload) {
    throw createError({ statusCode: 400, message: 'Empty request body' })
  }

  const svixHeaders = {
    'svix-id': getHeader(event, 'svix-id') ?? '',
    'svix-timestamp': getHeader(event, 'svix-timestamp') ?? '',
    'svix-signature': getHeader(event, 'svix-signature') ?? ''
  }

  let evt: ClerkWebhookEvent
  try {
    evt = new Webhook(secret).verify(payload, svixHeaders) as ClerkWebhookEvent
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid webhook signature' })
  }

  if (evt.type === 'user.created') {
    const { id } = evt.data as { id: string }
    await db.user.upsert({
      where: { clerkId: id },
      update: {},
      create: { clerkId: id }
    })
  }

  return { received: true }
})
