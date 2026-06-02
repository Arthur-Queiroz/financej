export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const vaultId = getRouterParam(event, 'id')!
  const { amount, note, date } = await readBody(event)

  if (!amount || !date) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const vault = await db.vault.findFirst({ where: { id: vaultId, userId } })
  if (!vault) throw createError({ statusCode: 404, message: 'Vault not found' })

  const withdrawal = await db.vaultDeposit.create({
    data: {
      vaultId,
      amount: Number(amount),
      direction: 'OUT',
      note: note || null,
      date: new Date(date)
    }
  })

  setResponseStatus(event, 201)
  return withdrawal
})
