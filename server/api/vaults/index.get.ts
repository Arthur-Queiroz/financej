export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)

  const vaults = await db.vault.findMany({
    where: { userId },
    include: {
      deposits: {
        select: { amount: true, direction: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return vaults.map((v) => {
    const current = v.deposits.reduce((sum, d) => {
      return d.direction === 'IN' ? sum + Number(d.amount) : sum - Number(d.amount)
    }, 0)
    const { deposits: _, ...rest } = v
    return { ...rest, current }
  })
})
