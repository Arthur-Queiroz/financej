export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!

  const existing = await db.vault.findFirst({ where: { id, userId } })
  if (!existing) throw createError({ statusCode: 404, message: 'Vault not found' })

  await db.vault.delete({ where: { id } })
  return { success: true }
})
