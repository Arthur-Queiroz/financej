export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const { name, icon, color, target, perAmount, interval } = await readBody(event)

  const existing = await db.vault.findFirst({ where: { id, userId } })
  if (!existing) throw createError({ statusCode: 404, message: 'Vault not found' })

  const vault = await db.vault.update({
    where: { id },
    data: {
      name,
      icon,
      color,
      target: target !== undefined ? (target ? Number(target) : null) : existing.target,
      perAmount: perAmount !== undefined ? Number(perAmount) : existing.perAmount,
      interval: interval ?? existing.interval
    },
    include: { deposits: { select: { amount: true } } }
  })

  const current = vault.deposits.reduce((sum, d) => sum + Number(d.amount), 0)
  const { deposits: _, ...rest } = vault
  return { ...rest, current }
})
