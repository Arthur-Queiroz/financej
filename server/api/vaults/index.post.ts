export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { name, icon, color, target, perAmount, interval } = await readBody(event)

  if (!name || !icon || !color || !perAmount || !interval) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const vault = await db.vault.create({
    data: {
      name,
      icon,
      color,
      target: target ? Number(target) : null,
      perAmount: Number(perAmount),
      interval,
      userId
    }
  })

  setResponseStatus(event, 201)
  return { ...vault, current: 0 }
})
